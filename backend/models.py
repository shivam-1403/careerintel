from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON
from datetime import datetime
from database import Base


# =========================
# USER
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    target_role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    

# =========================
# SKILL (Predefined & Controlled)
# =========================
class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    normalized_name = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, nullable=False)  # technical / soft / tool / certification


# =========================
# USER SKILL (Only FK, No Raw Skill Text)
# =========================
class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)


# =========================
# ROLE (Career)
# =========================
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    category = Column(String, nullable=False)  # tech / non-tech
    description = Column(String, nullable=True)


# =========================
# ROLE SKILL (Weighted Mapping)
# =========================
class RoleSkill(Base):
    __tablename__ = "role_skills"

    id = Column(Integer, primary_key=True, index=True)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    importance_weight = Column(Integer, nullable=False)  # 1–5


# =========================
# RESUME SCAN
# =========================
class ResumeScan(Base):
    __tablename__ = "resume_scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    extracted_skills = Column(JSON)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)


# =========================
# USER ROADMAP (Phase 2 – Keep for later)
# =========================
class UserRoadmap(Base):
    __tablename__ = "user_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    missing_skills = Column(JSON)
    score = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)