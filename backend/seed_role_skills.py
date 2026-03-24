from database import SessionLocal
from models import RoleSkill, Skill, Role

db = SessionLocal()

# First, add any missing skills
additional_skills = [
    ("HTML", "technical"),
    ("CSS", "technical"),
    ("Express", "technical"),
    ("APIs", "technical"),
    ("Databases", "technical"),
]

for name, category in additional_skills:
    normalized = name.lower().strip()
    existing = db.query(Skill).filter_by(normalized_name=normalized).first()
    if not existing:
        skill = Skill(
            name=name,
            normalized_name=normalized,
            category=category
        )
        db.add(skill)
        db.flush()  # Get the ID
        print(f"✅ Added skill: {name}")
    else:
        print(f"Skill already exists: {name}")

db.commit()

# Now create role_skill_data with proper skill IDs based on normalized_name
def get_skill_id(normalized_name):
    skill = db.query(Skill).filter_by(normalized_name=normalized_name).first()
    if skill:
        return skill.id
    print(f"WARNING: Skill not found: {normalized_name}")
    return None

role_skill_data = [

    # =========================
    # DATA ANALYST (role_id = 1)
    # =========================
    (1, get_skill_id("python"), 5),
    (1, get_skill_id("sql"), 5),
    (1, get_skill_id("excel"), 4),
    (1, get_skill_id("statistics"), 5),
    (1, get_skill_id("power bi"), 4),
    (1, get_skill_id("tableau"), 3),
    (1, get_skill_id("data visualization"), 3),
    (1, get_skill_id("pandas"), 4),
    (1, get_skill_id("communication"), 3),
    (1, get_skill_id("problem solving"), 4),

    # =========================
    # FRONTEND DEVELOPER (role_id = 3)
    # =========================
    (3, get_skill_id("html"), 5),
    (3, get_skill_id("css"), 5),
    (3, get_skill_id("javascript"), 5),
    (3, get_skill_id("react"), 4),
    (3, get_skill_id("typescript"), 3),
    (3, get_skill_id("git"), 3),
    (3, get_skill_id("docker"), 2),
    (3, get_skill_id("communication"), 3),
    (3, get_skill_id("problem solving"), 3),

    # =========================
    # BACKEND DEVELOPER (role_id = 2)
    # =========================
    (2, get_skill_id("python"), 4),
    (2, get_skill_id("java"), 4),
    (2, get_skill_id("sql"), 5),
    (2, get_skill_id("node.js"), 5),
    (2, get_skill_id("express"), 4),
    (2, get_skill_id("apis"), 5),
    (2, get_skill_id("databases"), 5),
    (2, get_skill_id("django"), 3),
    (2, get_skill_id("fastapi"), 3),
    (2, get_skill_id("git"), 4),
    (2, get_skill_id("docker"), 3),
    (2, get_skill_id("problem solving"), 4),

    # =========================
    # FULL STACK DEVELOPER (role_id = 4)
    # =========================
    (4, get_skill_id("html"), 5),
    (4, get_skill_id("css"), 5),
    (4, get_skill_id("javascript"), 5),
    (4, get_skill_id("react"), 4),
    (4, get_skill_id("node.js"), 4),
    (4, get_skill_id("express"), 4),
    (4, get_skill_id("sql"), 5),
    (4, get_skill_id("databases"), 4),
    (4, get_skill_id("apis"), 5),
    (4, get_skill_id("git"), 4),
    (4, get_skill_id("docker"), 3),
    (4, get_skill_id("python"), 3),
    (4, get_skill_id("problem solving"), 4),
    (4, get_skill_id("communication"), 3),

    # =========================
    # MACHINE LEARNING ENGINEER (role_id = 5)
    # =========================
    (5, get_skill_id("python"), 5),
    (5, get_skill_id("pandas"), 4),
    (5, get_skill_id("numpy"), 4),
    (5, get_skill_id("scikit-learn"), 5),
    (5, get_skill_id("tensorflow"), 4),
    (5, get_skill_id("pytorch"), 4),
    (5, get_skill_id("deep learning"), 5),
    (5, get_skill_id("machine learning"), 5),
    (5, get_skill_id("statistics"), 5),
    (5, get_skill_id("sql"), 3),
    (5, get_skill_id("git"), 3),
    (5, get_skill_id("docker"), 3),
    (5, get_skill_id("problem solving"), 5),

    # =========================
    # DEVOPS ENGINEER (role_id = 6)
    # =========================
    (6, get_skill_id("git"), 4),
    (6, get_skill_id("docker"), 5),
    (6, get_skill_id("kubernetes"), 4),
    (6, get_skill_id("aws"), 5),
    (6, get_skill_id("azure"), 4),
    (6, get_skill_id("gcp"), 4),
    (6, get_skill_id("python"), 3),

    # =========================
    # DATA SCIENTIST (role_id = 7)
    # =========================
    (7, get_skill_id("python"), 5),
    (7, get_skill_id("sql"), 4),
    (7, get_skill_id("r"), 4),
    (7, get_skill_id("pandas"), 5),
    (7, get_skill_id("numpy"), 5),
    (7, get_skill_id("statistics"), 5),
    (7, get_skill_id("machine learning"), 5),
    (7, get_skill_id("scikit-learn"), 4),
    (7, get_skill_id("tensorflow"), 3),
    (7, get_skill_id("pytorch"), 3),
    (7, get_skill_id("data visualization"), 4),
    (7, get_skill_id("excel"), 3),
    (7, get_skill_id("communication"), 3),
    (7, get_skill_id("problem solving"), 4),

    # =========================
    # CLOUD ENGINEER (role_id = 8)
    # =========================
    (8, get_skill_id("aws"), 5),
    (8, get_skill_id("azure"), 5),
    (8, get_skill_id("gcp"), 4),
    (8, get_skill_id("docker"), 5),
    (8, get_skill_id("kubernetes"), 5),
    (8, get_skill_id("git"), 4),
    (8, get_skill_id("python"), 3),
    (8, get_skill_id("linux"), 4),

    # =========================
    # UI/UX DESIGNER (role_id = 9)
    # =========================
    (9, get_skill_id("html"), 3),
    (9, get_skill_id("css"), 4),
    (9, get_skill_id("communication"), 5),
    (9, get_skill_id("problem solving"), 4),
    (9, get_skill_id("critical thinking"), 4),

    # =========================
    # PRODUCT MANAGER (role_id = 10)
    # =========================
    (10, get_skill_id("communication"), 5),
    (10, get_skill_id("problem solving"), 4),
    (10, get_skill_id("critical thinking"), 4),
    (10, get_skill_id("leadership"), 4),
    (10, get_skill_id("teamwork"), 4),
    (10, get_skill_id("time management"), 3),
]

# Clear existing mappings and re-add (to ensure correct weights)
for role_id, skill_id, weight in role_skill_data:
    if skill_id is None:
        continue

    # Delete existing mapping for this role/skill combo
    existing = db.query(RoleSkill).filter_by(
        role_id=role_id,
        skill_id=skill_id
    ).first()

    if existing:
        existing.importance_weight = weight
    else:
        mapping = RoleSkill(
            role_id=role_id,
            skill_id=skill_id,
            importance_weight=weight
        )
        db.add(mapping)

db.commit()
db.close()

print("[OK] RoleSkill mapping seeded successfully!")