from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import pdfplumber
from groq import Groq
import os
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db, Base, engine
from models import User, Skill, UserSkill, Role, RoleSkill, ResumeScan, UserRoadmap, Base
from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from services.career_engine import extract_skills_from_text, recommend_roles_for_user, get_skill_gap_for_role
from services.ats_engine import calculate_resume_quality
from datetime import datetime, timedelta
from email.message import EmailMessage
import base64
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://careerintel-beta.vercel.app",
        "https://careerintel-w10f.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

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
            model="openai/gpt-oss-120b",
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


# Semantic Skill Understanding Function
def extract_skills_with_ai(text, available_skills):
    """
    Extract skills from resume text using Groq AI.
    Returns a list of dicts: [{"skill": "Python", "evidence": "Used python for script", "confidence": "high"}]
    """
    try:
        client = get_groq_client()
        if not client:
            return []

        import json

        # Convert available_skills to a simple list of names for the prompt
        skill_names = [s.name if hasattr(s, "name") else str(s) for s in available_skills]

        prompt = f"""You are an expert ATS (Applicant Tracking System) parser.
Your task is to identify which of the provided predefined skills are present in the provided resume text.
Do not match based only on exact keywords; understand the semantic meaning.
For example, if the resume says "created interactive dashboards", that is evidence for the skill "Data Visualization" (if it's in the list).

PROVIDED SKILL LIST:
{', '.join(skill_names)}

RESUME TEXT:
{text[:4000]}  # limit text length for safety

Instructions:
1. ONLY return skills that exist EXACTLY as written in the PROVIDED SKILL LIST.
2. For each identified skill, provide a brief snippet of evidence from the resume.
3. Provide a confidence level ("high", "medium", "low").
4. Return ONLY a valid JSON array of objects, with no other text, markdown, or explanations.
Format: [{{ "skill": "Skill Name", "evidence": "brief snippet", "confidence": "high" }}]"""

        response = client.chat.completions.create(
            model="openai/gpt-oss-120b", # Using supported model from API
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
        )

        content = response.choices[0].message.content

        # Strip markdown code blocks if the model ignored instructions
        if content.startswith("```json"):
            content = content[7:-3]
        elif content.startswith("```"):
            content = content[3:-3]

        result = json.loads(content.strip())

        # If it returned a dictionary with an array inside (e.g. {"skills": [...]})
        if isinstance(result, dict):
            for key in result:
                if isinstance(result[key], list):
                    return result[key]
            return []

        return result if isinstance(result, list) else []

    except Exception as e:
        print(f"Semantic Extraction Error: {e}")
        return []


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


# ============================
# JWT FORGOT PASSWORD SYSTEM
# ============================

RESET_TOKEN_EXPIRE_MINUTES = 15

def create_reset_token(email: str):
    """Generate a JWT specifically for password reset"""
    expire = datetime.utcnow() + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": email, "type": "password_reset", "exp": expire}
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def send_reset_email(email: str, token: str):
    """Send password reset email through Gmail API over HTTPS."""
    
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REFRESH_TOKEN = os.getenv("GOOGLE_REFRESH_TOKEN")
    SMTP_EMAIL = os.getenv("SMTP_EMAIL")
    FRONTEND_URL = os.getenv("FRONTEND_URL")

    if not all([
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REFRESH_TOKEN,
        SMTP_EMAIL,
        FRONTEND_URL
    ]):
        print("Warning: Gmail API credentials are not fully configured.")
        return False

    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    msg = EmailMessage()
    msg["Subject"] = "Reset your CareerIntel password"
    msg["From"] = f"CareerIntel <{SMTP_EMAIL}>"
    msg["To"] = email

    msg.set_content(
        f"""
You requested a password reset for your CareerIntel account.

Click the link below to reset your password:

{reset_link}

This link will expire in {RESET_TOKEN_EXPIRE_MINUTES} minutes.

If you did not request this password change, you can safely ignore this email.

CareerIntel
"""
    )

    msg.add_alternative(
        f"""
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background-color: #f9fbfd; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #4f46e5; margin-top: 0;">CareerIntel</h2>

            <p style="color: #333; line-height: 1.5;">
                You requested a password reset. Click the button below to securely reset your password.
            </p>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_link}"
                   style="display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Reset Password
                </a>
            </div>

            <p style="color: #666; font-size: 13px; line-height: 1.4;">
                This link will expire in {RESET_TOKEN_EXPIRE_MINUTES} minutes.
            </p>

            <p style="color: #666; font-size: 13px; line-height: 1.4;">
                If you did not request this password change, you can safely ignore this email.
            </p>
        </div>
        """,
        subtype="html"
    )

    try:
        credentials = Credentials(
            token=None,
            refresh_token=GOOGLE_REFRESH_TOKEN,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=["https://www.googleapis.com/auth/gmail.send"]
        )

        service = build("gmail", "v1", credentials=credentials)

        encoded_message = base64.urlsafe_b64encode(
            msg.as_bytes()
        ).decode()

        service.users().messages().send(
            userId="me",
            body={"raw": encoded_message}
        ).execute()

        print(f"Password reset email sent to {email}")
        return True

    except Exception as e:
        print(f"Failed to send email through Gmail API: {e}")
        return False

class ForgotPasswordRequest(BaseModel):
    email: str

@app.post("/auth/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    
    # We silently succeed even if the user does not exist to prevent user enumeration
    if user:
        token = create_reset_token(user.email)
        send_reset_email(user.email, token)
        
    return {"message": "If the email exists, a password reset link will be sent."}

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@app.post("/auth/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(data.token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify custom claim to prevent using normal access tokens for pass reset
        if payload.get("type") != "password_reset":
            raise HTTPException(status_code=400, detail="Invalid token type.")
            
        email = payload.get("sub")
        if not email:
            raise HTTPException(status_code=400, detail="Invalid token payload.")
            
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link. Please request a new one.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    if len(data.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters long."
        ) 
        
    user.password = hash_password(data.new_password)
    db.commit()
    
    return {"message": "Password reset successfully. You may now login."}



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
        "target_role_id": current_user.target_role_id
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

    text = extract_text_from_pdf(file)

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

    matched = result.get("matched_skills", [])

    missing = [
        skill["name"]
        for skill in (
            result.get("technical_gaps", []) +
            result.get("soft_skill_gaps", [])
        )
    ]

    ai_insight = generate_ai_insight(
        result["career"],
        matched,
        missing,
        result["score"]
    )

    result["ai_insight"] = ai_insight

    return result


def _required_skills_payload(role_id: int, db: Session):
    """Serialize RoleSkill rows with Skill metadata (presentation only; scoring lives in career_engine)."""
    mappings = db.query(RoleSkill).filter(RoleSkill.role_id == role_id).all()
    rows = []
    for rs in mappings:
        skill = db.query(Skill).filter(Skill.id == rs.skill_id).first()
        if skill:
            rows.append({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
                "priority": rs.importance_weight,
            })
    return sorted(rows, key=lambda x: x["priority"], reverse=True)


def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
):
    """
    Optional user auth helper for career personalization.
    Returns a User if JWT is valid, otherwise None. Logs safe error details.
    """
    if credentials is None:
        # No token provided
        return None
    try:
        # credentials.credentials is the token string
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError as e:
        print(f"Optional auth JWT error: {str(e)}")
        return None
    except Exception as ex:
        print(f"Optional auth unexpected error: {str(ex)}")
        return None

@app.get("/career/{role_id}")
def get_career_details(
    role_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_optional),
):
    """
    Public career metadata plus optional personalization via get_skill_gap_for_role
    (same weighted match / readiness as /career/gap/{role_id}).
    """
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Career not found")

    required_skills = _required_skills_payload(role_id, db)
    desc = role.description
    has_desc = bool(desc and str(desc).strip())

    response = {
        "id": role.id,
        "name": role.name,
        "category": role.category,
        "description": desc,
        "required_skills": required_skills,
        "empty_states": {
            "no_description": not has_desc,
            "no_required_skills": len(required_skills) == 0,
        },
    }

    if not user:
        response["is_authenticated"] = False
        response["match_score"] = None
        response["match_percentage"] = None
        response["readiness_score"] = None
        response["matched_skills"] = []
        response["missing_skills"] = []
        return response

    gap = get_skill_gap_for_role(user.id, role_id, db)
    if gap is None:
        # Role exists but has no RoleSkill mappings — gap engine cannot score.
        response["is_authenticated"] = True
        response["match_score"] = None
        response["match_percentage"] = None
        response["readiness_score"] = None
        response["matched_skills"] = []
        response["missing_skills"] = []
        response["empty_states"]["personalization_unavailable"] = True
        return response

    gaps_combined = gap["technical_gaps"] + gap["soft_skill_gaps"]
    gaps_sorted = sorted(gaps_combined, key=lambda x: x["priority"], reverse=True)
    missing_names = [g["name"] for g in gaps_sorted]
    score = gap["score"]

    response["is_authenticated"] = True
    response["match_score"] = score
    response["match_percentage"] = score
    response["readiness_score"] = score
    response["matched_skills"] = list(gap["matched_skills"])
    response["missing_skills"] = missing_names
    response["empty_states"]["no_matched_skills"] = len(gap["matched_skills"]) == 0
    response["empty_states"]["no_missing_skills"] = len(missing_names) == 0

    if user:
        ai_insight = generate_ai_insight(
            role.name,
            response["matched_skills"],
            response["missing_skills"],
            score
        )

        response["ai_insight"] = ai_insight
    else:
        response["ai_insight"] = None
    return response


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

    # 2️⃣ Get role & role skills
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
        
    role_skills = (
        db.query(RoleSkill)
        .filter(RoleSkill.role_id == role_id)
        .all()
    )
    if not role_skills:
        raise HTTPException(status_code=400, detail="No skills mapped to this role")

    # 3️⃣ Deterministic Extraction
    deterministic_skills = extract_skills_from_text(text, db)
    deterministic_names = {s.name.lower() for s in deterministic_skills}

    # 4️⃣ Identify Technical Gaps to send to AI
    gap_skills_for_ai = []
    for rs in role_skills:
        skill = db.get(Skill, rs.skill_id)
        if skill.name.lower() not in deterministic_names and skill.category != "soft":
            gap_skills_for_ai.append(skill)

    # 5️⃣ AI Semantic Extraction (only on gaps)
    ai_skills = []
    if gap_skills_for_ai:
        ai_results = extract_skills_with_ai(text, gap_skills_for_ai)
        for item in ai_results:
            skill_name = item.get("skill")
            if skill_name:
                skill_obj = db.query(Skill).filter(Skill.name == skill_name).first()
                if skill_obj:
                    ai_skills.append(skill_obj)

    # 6️⃣ Merge deterministic and AI skills
    combined_skills_map = {s.id: s for s in (deterministic_skills + ai_skills)}
    final_extracted_skills = list(combined_skills_map.values())
    extracted_skills = [s.name for s in final_extracted_skills]

    # 7️⃣ Calculate Final Score & Missing Skills
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
            # Only surface technical/tool/certification gaps as "missing".
            # Soft skills (Communication, Problem Solving, etc.) are never
            # detectable from resume text so we exclude them from the list.
            # NOTE: matched_weight and total_weight are unchanged — score is unaffected.
            if skill.category != "soft":
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

@app.get("/search")
def search(q: str, db: Session = Depends(get_db)):

    if not q or len(q.strip()) < 1:
        return {"roles": [], "skills": []}

    query_lower = q.strip().lower()

    roles = db.query(Role).filter(
        Role.name.ilike(f"%{query_lower}%")
    ).limit(8).all()

    skills = db.query(Skill).filter(
        Skill.name.ilike(f"%{query_lower}%")
    ).limit(8).all()

    return {
        "roles": [
            {"id": r.id, "name": r.name, "category": r.category}
            for r in roles
        ],
        "skills": [
            {"id": s.id, "name": s.name, "category": s.category}
            for s in skills
        ]
    }