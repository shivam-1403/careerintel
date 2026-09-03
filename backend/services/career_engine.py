import re
from models import UserSkill, Role, RoleSkill, Skill

# ===============================
# SKILL EXTRACTION FROM TEXT
# ===============================
def extract_skills_from_text(text, db):
    text_lower = text.lower()
    db_skills = db.query(Skill).all()

    matched = []

    for skill in db_skills:
        # Create a regex pattern to match the skill as a discrete word/phrase
        # Negative lookbehinds/lookaheads ensure we don't match partial words or partial special-character combinations (e.g., matching "C" inside "C++")
        pattern = r"(?<![a-z0-9\+\#])" + re.escape(skill.normalized_name) + r"(?![a-z0-9\+\#])"
        
        if re.search(pattern, text_lower):
            matched.append(skill)

    return matched  # return Skill objects


# ===============================
# WEIGHTED ROLE MATCHING
# ===============================
def compare_skills_with_roles(user_skills, db):
    """
    user_skills = list of Skill objects
    """
    results = []
    user_skill_ids = {skill.id for skill in user_skills}

    # Bulk fetch ALL roles, role-mappings, and skills
    roles = db.query(Role).all()
    all_role_skills = db.query(RoleSkill).all()
    all_skills = {s.id: s for s in db.query(Skill).all()}

    # Group mappings in memory
    role_skill_map = {}
    for rs in all_role_skills:
        role_skill_map.setdefault(rs.role_id, []).append(rs)

    for role in roles:
        role_mappings = role_skill_map.get(role.id, [])
        if not role_mappings:
            continue

        total_weight = sum(rs.importance_weight for rs in role_mappings)

        matched_weight = 0
        matched_skills = []
        missing_skills = []

        for rs in role_mappings:
            skill = all_skills.get(rs.skill_id)
            if not skill:
                continue

            if rs.skill_id in user_skill_ids:
                matched_weight += rs.importance_weight
                matched_skills.append(skill.name)
            else:
                missing_skills.append(skill.name)

        score = int((matched_weight / total_weight) * 100) if total_weight > 0 else 0

        results.append({
            "role_id": role.id,
            "career": role.name,
            "score": score,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        })

    return sorted(results, key=lambda x: x["score"], reverse=True)

# ===============================
# RECOMMEND ROLES FOR REAL USER
# ===============================
def recommend_roles_for_user(user_id, db):
    user_skill_mappings = db.query(UserSkill).filter(
        UserSkill.user_id == user_id
    ).all()

    if not user_skill_mappings:
        return []

    skill_ids = [us.skill_id for us in user_skill_mappings]

    user_skills = db.query(Skill).filter(
        Skill.id.in_(skill_ids)
    ).all()

    return compare_skills_with_roles(user_skills, db)

# ===============================
# SKILL GAP FOR SPECIFIC ROLE
# ===============================
def get_skill_gap_for_role(user_id, role_id, db):
    # Get user skills
    user_skill_mappings = db.query(UserSkill).filter(
        UserSkill.user_id == user_id
    ).all()

    user_skill_ids = {us.skill_id for us in user_skill_mappings}

    # Get role
    role = db.query(Role).filter(Role.id == role_id).first()

    if not role:
        return None

    role_mappings = db.query(RoleSkill).filter(
        RoleSkill.role_id == role_id
    ).all()

    if not role_mappings:
        return None

    # Bulk fetch required skills to avoid N+1 query loops
    skill_ids_to_fetch = [rs.skill_id for rs in role_mappings]
    skills = db.query(Skill).filter(Skill.id.in_(skill_ids_to_fetch)).all()
    skill_map = {s.id: s for s in skills}

    total_weight = sum(rs.importance_weight for rs in role_mappings)

    matched_weight = 0
    matched = []
    technical_gaps = []
    soft_gaps = []

    for rs in role_mappings:
        skill = skill_map.get(rs.skill_id)
        if not skill:
            continue

        if rs.skill_id in user_skill_ids:
            matched_weight += rs.importance_weight
            matched.append(skill.name)

        else:
            if skill.category == "soft":
                soft_gaps.append({
                    "name": skill.name,
                    "priority": rs.importance_weight,
                    "status": "Recommended"
                })
            else:
                technical_gaps.append({
                    "name": skill.name,
                    "priority": rs.importance_weight,
                    "status": "Missing"
                })

    score = int((matched_weight / total_weight) * 100) if total_weight > 0 else 0

    # Sort gaps by priority
    technical_gaps = sorted(technical_gaps, key=lambda x: x["priority"], reverse=True)
    soft_gaps = sorted(soft_gaps, key=lambda x: x["priority"], reverse=True)

    # Generate dynamic AI insights
    ai_insights = []

    # Insight 1 — Strong Foundation
    if matched:
        top_matched = matched[:2]
        if len(top_matched) == 1:
            message = f"You already have a strong foundation in {top_matched[0]} which is valuable for this career."
        else:
            message = f"You already have strong foundations in {', '.join(top_matched)} which are valuable for this career."
        ai_insights.append({
            "title": "Strong Foundation",
            "message": message
        })

    # Insight 2 — Critical Skill Gap
    if technical_gaps:
        top_gap = technical_gaps[0]
        ai_insights.append({
            "title": "Critical Skill Gap",
            "message": f"{top_gap['name']} is a high-priority skill missing from your profile. Learning it will significantly improve your readiness."
        })

    # Insight 3 — Career Readiness
    ai_insights.append({
        "title": "Career Readiness",
        "message": f"You are currently {score}% ready for the {role.name} role. Focus on the top missing skills to improve quickly."
    })

    return {
        "career": role.name,
        "score": score,
        "matched_skills": matched,
        "technical_gaps": technical_gaps,
        "soft_skill_gaps": soft_gaps,
        "ai_insights": ai_insights
    }