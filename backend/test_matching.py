from database import SessionLocal
from models import UserSkill, Skill
from services.career_engine import compare_skills_with_roles

db = SessionLocal()

# Simulate user skills (example: Python + SQL + Excel)
skills = db.query(Skill).filter(Skill.name.in_(["Python", "SQL", "Excel"])).all()

results = compare_skills_with_roles(skills, db)

for r in results[:3]:
    print(r)

db.close()