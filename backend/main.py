from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
import shutil
import pdfplumber
from groq import Groq
import os
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import get_db, Base, engine
from models import User, Skill, UserSkill, Role, RoleSkill, ResumeScan, UserRoadmap, Base
from auth import hash_password, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
from services.career_engine import extract_skills_from_text, compare_skills_with_roles, recommend_roles_for_user, get_skill_gap_for_role
from services.ats_engine import calculate_resume_quality
import time
from datetime import datetime, timedelta


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


# ============================
# OTP FORGOT PASSWORD SYSTEM
# ============================

# OTP Storage: {email: {"code": "123456", "expires_at": datetime}}
otp_storage = {}
OTP_EXPIRE_MINUTES = 10

# Email configuration (replace with your actual SMTP settings)
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "your_email@gmail.com"
SMTP_PASSWORD = "your_app_password"


def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices('0123456789', k=6))


def send_email(to_email: str, subject: str, body: str):
    """Send email using SMTP (simple placeholder)"""
    try:
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'html'))

        # For demo purposes, we'll just log the email
        # In production, uncomment the SMTP code below
        print(f"📧 EMAIL SENT to {to_email}")
        print(f"   Subject: {subject}")
        print(f"   Body: {body}")

        # Uncomment for production:
        # server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        # server.starttls()
        # server.login(SMTP_USERNAME, SMTP_PASSWORD)
        # server.send_message(msg)
        # server.quit()

        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def send_otp_email(email: str, otp: str):
    """Send OTP via email"""
    subject = "CareerIntel - Password Reset Code"
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #4f46e5;">CareerIntel</h2>
            <p>You requested a password reset. Use the verification code below:</p>
            <div style="background: #4f46e5; color: white; padding: 15px 30px; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; display: inline-block; margin: 20px 0;">
                {otp}
            </div>
            <p style="color: #666; font-size: 14px;">This code will expire in {OTP_EXPIRE_MINUTES} minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
        </div>
    </body>
    </html>
    """
    return send_email(email, subject, body)


# Request password reset - send OTP
class SendResetCodeRequest(BaseModel):
    email: str


@app.post("/auth/send-reset-code")
def send_reset_code(data: SendResetCodeRequest, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        # Don't reveal if email exists or not (security)
        return {"message": "If the email exists, a reset code will be sent"}

    # Generate OTP
    otp = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)

    # Store OTP
    otp_storage[data.email] = {
        "code": otp,
        "expires_at": expires_at,
        "verified": False
    }

    # Send email
    send_otp_email(data.email, otp)

    return {"message": "If the email exists, a reset code will be sent"}


# Verify OTP
class VerifyResetCodeRequest(BaseModel):
    email: str
    code: str


@app.post("/auth/verify-reset-code")
def verify_reset_code(data: VerifyResetCodeRequest):
    stored_otp = otp_storage.get(data.email)

    if not stored_otp:
        raise HTTPException(status_code=400, detail="No reset code found. Please request a new code.")

    # Check expiry
    if datetime.utcnow() > stored_otp["expires_at"]:
        del otp_storage[data.email]
        raise HTTPException(status_code=400, detail="Reset code expired. Please request a new code.")

    # Verify code
    if stored_otp["code"] != data.code:
        raise HTTPException(status_code=400, detail="Invalid reset code.")

    # Mark as verified (allows password reset)
    stored_otp["verified"] = True

    return {"message": "Code verified successfully. You can now reset your password."}


# Reset password
class ResetPasswordRequest(BaseModel):
    email: str
    new_password: str


@app.post("/auth/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    stored_otp = otp_storage.get(data.email)

    # Check if OTP was verified
    if not stored_otp or not stored_otp.get("verified"):
        raise HTTPException(status_code=400, detail="Please verify your identity first.")

    # Check expiry
    if datetime.utcnow() > stored_otp["expires_at"]:
        del otp_storage[data.email]
        raise HTTPException(status_code=400, detail="Reset code expired. Please request a new code.")

    # Find user and update password
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Update password
    user.password = hash_password(data.new_password)
    db.commit()

    # Clear OTP
    del otp_storage[data.email]

    return {"message": "Password reset successfully. Please login with your new password."}


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