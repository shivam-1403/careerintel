from database import SessionLocal
from models import Skill

db = SessionLocal()

skills_data = [
    # ===== Programming Languages =====
    ("Python", "technical"),
    ("Java", "technical"),
    ("C++", "technical"),
    ("JavaScript", "technical"),
    ("TypeScript", "technical"),
    ("SQL", "technical"),
    ("R", "technical"),
    ("Go", "technical"),
    ("Rust", "technical"),

    # ===== Web Development =====
    ("HTML", "technical"),
    ("CSS", "technical"),

    # ===== Frameworks =====
    ("Django", "technical"),
    ("FastAPI", "technical"),
    ("Flask", "technical"),
    ("React", "technical"),
    ("Next.js", "technical"),
    ("Node.js", "technical"),
    ("Express", "technical"),
    ("Spring Boot", "technical"),

    # ===== Data Skills =====
    ("Pandas", "technical"),
    ("NumPy", "technical"),
    ("Scikit-learn", "technical"),
    ("TensorFlow", "technical"),
    ("PyTorch", "technical"),
    ("Data Visualization", "technical"),
    ("Statistics", "technical"),
    ("Machine Learning", "technical"),
    ("Deep Learning", "technical"),

    # ===== Tools & Platforms =====
    ("Git", "tool"),
    ("Docker", "tool"),
    ("Kubernetes", "tool"),
    ("AWS", "tool"),
    ("Azure", "tool"),
    ("GCP", "tool"),
    ("Power BI", "tool"),
    ("Tableau", "tool"),
    ("Excel", "tool"),
    ("MySQL", "tool"),
    ("PostgreSQL", "tool"),

    # ===== Concepts =====
    ("APIs", "technical"),
    ("Databases", "technical"),
    ("Linux", "tool"),

    # ===== Soft Skills =====
    ("Communication", "soft"),
    ("Problem Solving", "soft"),
    ("Critical Thinking", "soft"),
    ("Leadership", "soft"),
    ("Teamwork", "soft"),
    ("Time Management", "soft"),
]

for name, category in skills_data:
    normalized = name.lower().strip()

    existing = db.query(Skill).filter_by(normalized_name=normalized).first()
    if not existing:
        skill = Skill(
            name=name,
            normalized_name=normalized,
            category=category
        )
        db.add(skill)
        print(f"[+] Added: {name} ({category})")
    else:
        print(f"[*] Already exists: {name}")

db.commit()
db.close()

print("[OK] Skills seeded successfully!")