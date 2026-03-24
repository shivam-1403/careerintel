from database import SessionLocal
from models import Role

db = SessionLocal()

roles_data = [
    ("Data Analyst", "tech", "Analyzes structured data to generate insights."),
    ("Backend Developer", "tech", "Builds server-side applications and APIs."),
    ("Frontend Developer", "tech", "Builds user interfaces and client-side logic."),
    ("Full Stack Developer", "tech", "Works on both frontend and backend systems."),
    ("Machine Learning Engineer", "tech", "Builds ML models and production ML systems."),
    ("DevOps Engineer", "tech", "Manages CI/CD pipelines and infrastructure."),
    ("Data Scientist", "tech", "Applies statistical and ML techniques to solve business problems."),
    ("Cloud Engineer", "tech", "Designs and manages cloud infrastructure."),
    ("UI/UX Designer", "tech", "Designs user experiences and interfaces."),
    ("Product Manager", "tech", "Defines product strategy and roadmap."),
]

for name, category, description in roles_data:
    existing = db.query(Role).filter_by(name=name).first()
    if not existing:
        role = Role(
            name=name,
            category=category,
            description=description
        )
        db.add(role)

db.commit()
db.close()

print("✅ Roles seeded successfully!")