from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
import shutil
import pdfplumber
from groq import Groq
import os
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db, Base, engine
from models import User, Skill, UserSkill, Role, RoleSkill, ResumeScan, UserRoadmap
from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from services.career_engine import extract_skills_from_text, compare_skills_with_roles, recommend_roles_for_user, get_skill_gap_for_role
from services.ats_engine import calculate_resume_quality
import time


app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://careerintel-beta.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import engine
from models import Base

Base.metadata.create_all(bind=engine)

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Initialize Groq client
def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)


# AI Insight Generation Function
def generate_ai_insight(role_name, matched_skills, missing_skills, score):
    """Generate AI-powered career insight using Groq"""
    try:
        client = get_groq_client()
        if not client:
            return None

        matched_str = ", ".join(matched_skills) if matched_skills else "No skills matched"
        missing_str = ", ".join(missing_skills) if missing_skills else "None"

        prompt = f"""You are a career advisor analyzing a resume for a {role_name} position.

Current Profile:
- Target Role: {role_name}
- Matched Skills: {matched_str}
- Missing Skills: {missing_str}
- Readiness Score: {score}%

Provide a short, clear, practical career insight in exactly 3-4 lines. Focus on:
1. What's going well
2. What needs immediate attention
3. One specific actionable advice

Keep it encouraging but honest. No bullet points, just natural paragraphs."""

        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=300
        )

        return response.choices[0].message.content

    except Exception as e:
        print(f"AI Insight Error: {e}")
        return None


def extract_text_from_pdf(file):
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text.lower()

class LoginRequest(BaseModel):
    email: str
    password: str

@app.get("/")
def root():
    return {"message": "Backend is running 🚀"}

@app.post("/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email
        }
    }


class SignupRequest(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    
@app.post("/auth/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    # check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        email=data.email,
        password=hash_password(data.password)
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": f"{user.first_name} {user.last_name}",
            "email": user.email
        }
    }


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user

@app.get("/user/profile")
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    role = None

    if current_user.target_role_id:
        role = db.query(Role).filter(Role.id == current_user.target_role_id).first()

    return {
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "target_role": role.name if role else None,
        "target_role_id": current_user.target_role_id,
        "profile_image": current_user.profile_image or None
    }

class UpdateProfile(BaseModel):
    first_name: str
    last_name: str
    email: str
@app.put("/user/update")
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        user.first_name = data.first_name
        user.last_name = data.last_name
        user.email = data.email


        db.commit()
        db.refresh(user)

        access_token = create_access_token({"sub": user.email})

        return {
            "message": "Profile updated successfully",
            "access_token": access_token
        }

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

@app.post("/user/upload-photo")
def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """Upload and save user's profile photo"""
    if not file:
        raise HTTPException(status_code=400, detail="No file provided")

    # Validate file type
    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed")

    # Generate unique filename using user_id and timestamp
    timestamp = int(time.time())
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"user_{user.id}_{timestamp}.{file_extension}"
    file_path = os.path.join("uploads", filename)

    # Delete old profile image if exists
    if user.profile_image:
        old_filename = user.profile_image.split("/")[-1].split("?")[0]  # Handle timestamp in filename
        old_path = os.path.join("uploads", old_filename)
        if os.path.exists(old_path):
            os.remove(old_path)

    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Return FULL public URL for frontend to display
    # Use production URL - change this if deploying to a different domain
    BASE_URL = "https://careerintel-w10f.onrender.com"
    full_url = f"{BASE_URL}/uploads/{filename}"
    user.profile_image = full_url
    db.commit()

    return {
        "message": "Profile photo uploaded successfully",
        "profile_image": full_url,
        "image_url": full_url
    }
        
@app.get("/skills")
def get_skills(user=Depends(get_current_user), db: Session = Depends(get_db)):
    skills = (
        db.query(Skill.name)
        .join(UserSkill, Skill.id == UserSkill.skill_id)
        .filter(UserSkill.user_id == user.id)
        .all()
    )

    return [s[0] for s in skills]

@app.get("/skills/search")
def search_skills(
    query: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    skills = db.query(Skill).filter(
        Skill.name.ilike(f"%{query}%")
    ).limit(10).all()

    return [
        {"id": s.id, "name": s.name}
        for s in skills
    ]

class AddSkillRequest(BaseModel):
    skill_id: int


@app.post("/skills/add")
def add_skill(
    data: AddSkillRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skill = db.get(Skill, data.skill_id)

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    exists = db.query(UserSkill).filter_by(
        user_id=user.id,
        skill_id=data.skill_id
    ).first()

    if exists:
        raise HTTPException(status_code=400, detail="Skill already added")

    new = UserSkill(
        user_id=user.id,
        skill_id=data.skill_id
    )

    db.add(new)
    db.commit()

    return {"message": "Skill added successfully"}


@app.delete("/skills/remove")
def remove_skill(name: str, user=Depends(get_current_user), db: Session = Depends(get_db)):

    skill = db.query(Skill).filter(Skill.name == name).first()

    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    user_skill = db.query(UserSkill).filter_by(user_id=user.id, skill_id=skill.id).first()

    if not user_skill:
        raise HTTPException(status_code=404, detail="Skill not linked")

    db.delete(user_skill)
    db.commit()

    return {"message": "Skill removed"}

@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):

    if not file.filename.endswith(".pdf"):
        raise HTTPException(400, "Only PDF allowed")

    text = ""

    file.file.seek(0)
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += (page.extract_text() or "") + "\n"

    return {
        "filename": file.filename,
        "text_preview": text[:500]
    }

@app.get("/resume/history")
def resume_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans = (
        db.query(ResumeScan)
        .filter(ResumeScan.user_id == user.id)
        .order_by(ResumeScan.id.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "score": s.score,
            "created_at": s.created_at
        }
        for s in scans
    ]

@app.get("/dashboard/stats")
def dashboard_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # total scans
    scans = db.query(ResumeScan).filter(ResumeScan.user_id == user.id).all()

    total_scans = len(scans)
    avg_score = int(sum(s.score for s in scans)/total_scans) if scans else 0
    last_score = scans[-1].score if scans else 0
    best_score = max([s.score for s in scans], default=0)

    # skills count
    skills_count = db.query(UserSkill).filter(UserSkill.user_id == user.id).count()

    # profile completion logic
    completion = min(
        40 + skills_count * 10,
        100
    )

    return {
        "profile_completion": completion,
        "skills_count": skills_count,
        "total_scans": total_scans,
        "average_score": avg_score,
        "latest_score": last_score,
        "best_score": best_score
    }

@app.get("/career/recommend")
def recommend_careers(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = recommend_roles_for_user(user.id, db)

    filtered = [r for r in results if r["score"] >= 40]

    if not filtered:
        return {
            "recommendations": [],
            "message": "No strong matches yet. Add more skills to improve recommendations."
        }

    return {
        "recommendations": filtered[:5]
    }
    
@app.get("/career/gap/{role_id}")
def get_career_gap(
    role_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = get_skill_gap_for_role(user.id, role_id, db)

    if not result:
        raise HTTPException(status_code=404, detail="Role not found")

    return result

class RoadmapRequest(BaseModel):
    career: str
    missing_skills: list[str]
    score: int
    
@app.post("/roadmap/save")
def save_roadmap(
    data: RoadmapRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = db.query(UserRoadmap).filter(
        UserRoadmap.user_id == user.id,
        UserRoadmap.career == data.career
    ).first()

    if existing:
        # Update that specific career roadmap
        existing.missing_skills = data.missing_skills
        existing.score = data.score
    else:
        new = UserRoadmap(
            user_id=user.id,
            career=data.career,
            missing_skills=data.missing_skills,
            score=data.score
        )
        db.add(new)

    db.commit()

    return {"message": "Roadmap saved"}


@app.get("/roadmap/all")
def get_all_roadmaps(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    roadmaps = db.query(UserRoadmap).filter(
        UserRoadmap.user_id == user.id
    ).all()

    return [
        {
            "id": r.id,
            "role_id": r.role_id,
            "career": db.get(Role, r.role_id).name if r.role_id else None,
            "missing_skills": r.missing_skills,
            "score": r.score
        }
        for r in roadmaps
    ]

@app.get("/roles")
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()

    return [
        {
            "id": r.id,
            "name": r.name
        }
        for r in roles
    ]
    
@app.post("/resume/analyze/{role_id}")
def analyze_resume_for_role(
    role_id: int,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1️⃣ Extract text
    text = extract_text_from_pdf(file)

    if not text.strip():
        raise HTTPException(status_code=400, detail="No readable text found.")

    # 2️⃣ Extract skills from resume
    extracted_skills = extract_skills_from_text(text, db)
    # Ensure we only work with skill names
    extracted_skills = [
        s.name if hasattr(s, "name") else s
        for s in extracted_skills
    ]

    # 3️⃣ Get role
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # 4️⃣ Get role required skills with weights
    role_skills = (
        db.query(RoleSkill)
        .filter(RoleSkill.role_id == role_id)
        .all()
    )

    if not role_skills:
        raise HTTPException(status_code=400, detail="No skills mapped to this role")

    total_weight = sum(rs.importance_weight for rs in role_skills)

    matched_weight = 0
    matched = []
    missing = []

    extracted_lower = [s.lower() for s in extracted_skills]

    for rs in role_skills:
        skill = db.get(Skill, rs.skill_id)

        if skill.name.lower() in extracted_lower:
            matched_weight += rs.importance_weight
            matched.append(skill.name)
        else:
            missing.append(skill.name)

    # 5️⃣ Resume Evidence Score
    evidence_score = round((matched_weight / total_weight) * 100, 2)

    # 6️⃣ Resume Quality Score
    quality_result = calculate_resume_quality(text)
    quality_score = quality_result["quality_score"]

    # 7️⃣ Final Readiness Score
    final_score = round(
        (0.7 * evidence_score) +
        (0.3 * quality_score),
        2
    )

    # 8️⃣ Save scan history
    scan = ResumeScan(
        user_id=user.id,
        role_id=role_id,
        extracted_skills=extracted_skills,
        score=final_score
    )

    db.add(scan)
    db.commit()

    # 9️⃣ Generate Dynamic Resume Insights
    insights = []

    # === Insight A: Strong Foundation ===
    # Trigger: matched skills >= 3 OR score > 60
    if len(matched) >= 3 or final_score > 60:
        top_matched = matched[:3]
        if len(top_matched) == 1:
            desc = f"You have a strong foundation in {top_matched[0]}. This is a core skill for the {role.name} role."
        else:
            desc = f"You have a strong foundation in {', '.join(top_matched[:-1])}, and {top_matched[-1]}. These are core skills for the {role.name} role."
        insights.append({
            "title": "Strong Foundation",
            "description": desc,
            "type": "positive"
        })

    # === Insight B: Critical Skill Gap ===
    # Take top 2-3 highest priority missing skills
    if missing:
        top_missing = missing[:3]
        if len(top_missing) == 1:
            desc = f"{top_missing[0]} is important for {role.name} positions but is missing from your resume."
        elif len(top_missing) == 2:
            desc = f"{top_missing[0]} and {top_missing[1]} are important for {role.name} roles but missing from your resume."
        else:
            desc = f"{', '.join(top_missing[:-1])}, and {top_missing[-1]} are important for {role.name} roles but missing from your resume."
        insights.append({
            "title": "Critical Skill Gap",
            "description": desc,
            "type": "warning"
        })

    # === Insight C: Resume Strength (based on quality score) ===
    if quality_score >= 60:
        insights.append({
            "title": "Resume Strength",
            "description": "Your resume structure and clarity are good. Keep building on this solid foundation.",
            "type": "positive"
        })
    else:
        insights.append({
            "title": "Resume Strength",
            "description": "Your resume needs improvement in structure and clarity. Consider adding measurable achievements and quantifying impact.",
            "type": "improvement"
        })

    # === Insight D: Overall Readiness (based on final score) ===
    if final_score < 40:
        desc = "Your profile needs significant improvement. Focus on building the core technical skills for this role."
    elif final_score <= 70:
        desc = "You are on the right track but need improvement. Continue learning missing skills to increase your readiness."
    else:
        desc = "You are well-prepared for this role! Consider refining your resume to highlight your strengths."

    insights.append({
        "title": "Overall Readiness",
        "description": desc,
        "type": "positive" if final_score >= 70 else ("warning" if final_score >= 40 else "improvement")
    })

    # Generate AI Insight (hybrid approach - fallback if API fails)
    ai_insight = generate_ai_insight(
        role.name,
        matched,
        missing,
        int(final_score)
    )

    # 🔟 Return structured response
    return {
        "career": role.name,
        "final_readiness_score": final_score,
        "resume_skill_evidence_score": evidence_score,
        "resume_quality_score": quality_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "quality_breakdown": quality_result["breakdown"],
        "suggestions": quality_result["suggestions"],
        "insights": insights,
        "ai_insight": ai_insight  # AI-generated insight with fallback to None
    }
    
@app.put("/user/target-role/{role_id}")
def set_target_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    role = db.query(Role).filter(Role.id == role_id).first()

    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    current_user.target_role_id = role_id
    db.commit()

    return {
        "message": "Target role updated",
        "role_id": role_id,
        "role_name": role.name
    }

@app.get("/user/target-role")
def get_target_role(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not user.target_role_id:
        return {"target_role": None}

    role = db.get(Role, user.target_role_id)

    return {
        "id": role.id,
        "name": role.name
    }

@app.post("/roadmap/generate/{role_id}")
def generate_roadmap(
    role_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get skill gaps for the user and role
    gap_result = get_skill_gap_for_role(user.id, role_id, db)

    if not gap_result:
        raise HTTPException(status_code=404, detail="Role or skill gaps not found")

    # Get top 5 technical gaps sorted by priority
    technical_gaps = gap_result.get("technical_gaps", [])[:5]

    # Convert gaps to learning phases
    roadmap_phases = []
    phase_names = [
        "Phase 1: Foundations",
        "Phase 2: Core Tools",
        "Phase 3: Advanced Skills",
        "Phase 4: Specialized Knowledge",
        "Phase 5: Professional Readiness"
    ]

    for i, skill in enumerate(technical_gaps):
        roadmap_phases.append({
            "phase": phase_names[i] if i < len(phase_names) else f"Phase {i+1}: Skills",
            "skills": [skill["name"]]
        })

    # Prepare data to save
    missing_skills = [skill["name"] for skill in technical_gaps]
    score = gap_result.get("score", 0)

    # Check if roadmap already exists for this user and role
    existing = db.query(UserRoadmap).filter(
        UserRoadmap.user_id == user.id,
        UserRoadmap.role_id == role_id
    ).first()

    if existing:
        # Update existing roadmap
        existing.missing_skills = missing_skills
        existing.score = score
    else:
        # Create new roadmap
        new_roadmap = UserRoadmap(
            user_id=user.id,
            role_id=role_id,
            missing_skills=missing_skills,
            score=score
        )
        db.add(new_roadmap)

    db.commit()

    return {
        "career": gap_result.get("career"),
        "score": score,
        "roadmap": roadmap_phases
    }
    
@app.get("/debug-files")
def debug_files():
    import os
    return {
        "cwd": os.getcwd(),
        "files": os.listdir("uploads") if os.path.exists("uploads") else "uploads folder missing"
    }