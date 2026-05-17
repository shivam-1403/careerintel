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

    # ── Role 1 ──
    (1, 1, 5),  # Python
    (1, 8, 5),  # SQL
    (1, 199, 5),  # Excel
    (1, 100, 5),  # Statistics
    (1, 195, 4),  # Power BI
    (1, 196, 4),  # Tableau
    (1, 99, 5),  # Data Visualization
    (1, 93, 4),  # Pandas
    (1, 94, 3),  # NumPy
    (1, 121, 5),  # Exploratory Data Analysis
    (1, 105, 4),  # Data Wrangling
    (1, 110, 4),  # Data Storytelling
    (1, 200, 3),  # Google Sheets
    (1, 107, 3),  # A/B Testing
    (1, 123, 4),  # Hypothesis Testing
    (1, 197, 3),  # Looker
    (1, 405, 4),  # Communication
    (1, 406, 4),  # Problem Solving
    (1, 423, 5),  # Analytical Thinking
    (1, 413, 4),  # Attention to Detail
    (1, 407, 4),  # Critical Thinking

    # ── Role 2 ──
    (2, 1, 4),  # Python
    (2, 2, 4),  # Java
    (2, 6, 3),  # JavaScript
    (2, 7, 3),  # TypeScript
    (2, 8, 5),  # SQL
    (2, 57, 4),  # Node.js
    (2, 58, 4),  # Express
    (2, 54, 3),  # Django
    (2, 55, 3),  # FastAPI
    (2, 56, 3),  # Flask
    (2, 59, 3),  # Spring Boot
    (2, 63, 3),  # NestJS
    (2, 32, 5),  # REST APIs
    (2, 31, 3),  # GraphQL
    (2, 74, 4),  # PostgreSQL
    (2, 73, 4),  # MySQL
    (2, 75, 3),  # MongoDB
    (2, 76, 3),  # Redis
    (2, 89, 4),  # Database Design
    (2, 90, 4),  # Query Optimization
    (2, 138, 4),  # Git
    (2, 139, 3),  # Docker
    (2, 146, 3),  # Linux
    (2, 35, 3),  # JWT Authentication
    (2, 34, 3),  # OAuth
    (2, 164, 4),  # Microservices
    (2, 165, 4),  # System Design
    (2, 406, 4),  # Problem Solving
    (2, 413, 4),  # Attention to Detail

    # ── Role 3 ──
    (3, 26, 5),  # HTML
    (3, 27, 5),  # CSS
    (3, 6, 5),  # JavaScript
    (3, 7, 4),  # TypeScript
    (3, 42, 5),  # React
    (3, 43, 4),  # Next.js
    (3, 44, 3),  # Vue.js
    (3, 45, 3),  # Angular
    (3, 28, 4),  # Tailwind CSS
    (3, 30, 3),  # SASS/SCSS
    (3, 29, 3),  # Bootstrap
    (3, 47, 3),  # Redux
    (3, 48, 3),  # Zustand
    (3, 49, 3),  # React Query
    (3, 50, 3),  # Webpack
    (3, 51, 3),  # Vite
    (3, 37, 5),  # Responsive Design
    (3, 36, 4),  # Web Accessibility
    (3, 39, 4),  # Web Performance Optimization
    (3, 40, 4),  # Browser Dev Tools
    (3, 32, 4),  # REST APIs
    (3, 31, 3),  # GraphQL
    (3, 138, 4),  # Git
    (3, 208, 3),  # Figma
    (3, 52, 3),  # Storybook
    (3, 406, 4),  # Problem Solving
    (3, 413, 4),  # Attention to Detail
    (3, 412, 3),  # Creativity

    # ── Role 4 ──
    (4, 26, 5),  # HTML
    (4, 27, 5),  # CSS
    (4, 6, 5),  # JavaScript
    (4, 7, 4),  # TypeScript
    (4, 42, 4),  # React
    (4, 43, 4),  # Next.js
    (4, 57, 5),  # Node.js
    (4, 58, 4),  # Express
    (4, 1, 3),  # Python
    (4, 54, 3),  # Django
    (4, 55, 3),  # FastAPI
    (4, 32, 5),  # REST APIs
    (4, 31, 3),  # GraphQL
    (4, 8, 5),  # SQL
    (4, 74, 4),  # PostgreSQL
    (4, 75, 3),  # MongoDB
    (4, 76, 3),  # Redis
    (4, 89, 4),  # Database Design
    (4, 138, 5),  # Git
    (4, 139, 4),  # Docker
    (4, 159, 3),  # AWS
    (4, 146, 3),  # Linux
    (4, 164, 3),  # Microservices
    (4, 165, 4),  # System Design
    (4, 35, 3),  # JWT Authentication
    (4, 37, 4),  # Responsive Design
    (4, 406, 5),  # Problem Solving
    (4, 405, 3),  # Communication

    # ── Role 5 ──
    (5, 1, 5),  # Python
    (5, 8, 3),  # SQL
    (5, 9, 3),  # R
    (5, 93, 5),  # Pandas
    (5, 94, 5),  # NumPy
    (5, 95, 5),  # Scikit-learn
    (5, 96, 4),  # TensorFlow
    (5, 97, 5),  # PyTorch
    (5, 98, 4),  # Keras
    (5, 101, 5),  # Machine Learning
    (5, 102, 5),  # Deep Learning
    (5, 100, 5),  # Statistics
    (5, 106, 5),  # Feature Engineering
    (5, 105, 4),  # Data Wrangling
    (5, 108, 5),  # Predictive Modeling
    (5, 103, 4),  # Natural Language Processing
    (5, 104, 4),  # Computer Vision
    (5, 135, 4),  # MLflow
    (5, 136, 5),  # Model Deployment
    (5, 139, 4),  # Docker
    (5, 138, 3),  # Git
    (5, 159, 3),  # AWS
    (5, 161, 3),  # GCP
    (5, 121, 4),  # Exploratory Data Analysis
    (5, 123, 4),  # Hypothesis Testing
    (5, 122, 4),  # Bayesian Statistics
    (5, 406, 5),  # Problem Solving
    (5, 423, 5),  # Analytical Thinking

    # ── Role 6 ──
    (6, 138, 5),  # Git
    (6, 139, 5),  # Docker
    (6, 140, 5),  # Kubernetes
    (6, 141, 5),  # CI/CD
    (6, 142, 5),  # Terraform
    (6, 143, 4),  # Ansible
    (6, 144, 4),  # Jenkins
    (6, 145, 4),  # GitHub Actions
    (6, 156, 4),  # GitLab CI
    (6, 146, 5),  # Linux
    (6, 18, 4),  # Shell Scripting
    (6, 1, 3),  # Python
    (6, 159, 5),  # AWS
    (6, 160, 4),  # Azure
    (6, 161, 4),  # GCP
    (6, 166, 3),  # AWS Lambda
    (6, 168, 4),  # AWS EC2
    (6, 147, 4),  # Nginx
    (6, 148, 5),  # Monitoring & Logging
    (6, 149, 5),  # Infrastructure as Code
    (6, 152, 4),  # Prometheus
    (6, 153, 4),  # Grafana
    (6, 154, 4),  # ELK Stack
    (6, 151, 4),  # Helm
    (6, 157, 4),  # ArgoCD
    (6, 158, 3),  # Istio
    (6, 163, 4),  # Cloud Security
    (6, 165, 4),  # System Design
    (6, 406, 4),  # Problem Solving
    (6, 413, 4),  # Attention to Detail

    # ── Role 7 ──
    (7, 1, 5),  # Python
    (7, 9, 5),  # R
    (7, 8, 4),  # SQL
    (7, 93, 5),  # Pandas
    (7, 94, 5),  # NumPy
    (7, 95, 5),  # Scikit-learn
    (7, 96, 4),  # TensorFlow
    (7, 97, 4),  # PyTorch
    (7, 98, 3),  # Keras
    (7, 100, 5),  # Statistics
    (7, 101, 5),  # Machine Learning
    (7, 102, 4),  # Deep Learning
    (7, 99, 5),  # Data Visualization
    (7, 105, 5),  # Data Wrangling
    (7, 106, 5),  # Feature Engineering
    (7, 108, 5),  # Predictive Modeling
    (7, 107, 4),  # A/B Testing
    (7, 123, 5),  # Hypothesis Testing
    (7, 122, 5),  # Bayesian Statistics
    (7, 109, 4),  # Time Series Analysis
    (7, 121, 5),  # Exploratory Data Analysis
    (7, 110, 4),  # Data Storytelling
    (7, 196, 3),  # Tableau
    (7, 195, 3),  # Power BI
    (7, 199, 3),  # Excel
    (7, 405, 4),  # Communication
    (7, 406, 5),  # Problem Solving
    (7, 423, 5),  # Analytical Thinking

    # ── Role 8 ──
    (8, 159, 5),  # AWS
    (8, 160, 5),  # Azure
    (8, 161, 5),  # GCP
    (8, 166, 5),  # AWS Lambda
    (8, 167, 4),  # AWS S3
    (8, 168, 5),  # AWS EC2
    (8, 169, 4),  # AWS RDS
    (8, 170, 4),  # Azure DevOps
    (8, 171, 4),  # Google BigQuery
    (8, 139, 5),  # Docker
    (8, 140, 5),  # Kubernetes
    (8, 142, 5),  # Terraform
    (8, 151, 4),  # Helm
    (8, 146, 5),  # Linux
    (8, 1, 3),  # Python
    (8, 18, 4),  # Shell Scripting
    (8, 138, 4),  # Git
    (8, 141, 4),  # CI/CD
    (8, 162, 5),  # Serverless Architecture
    (8, 163, 5),  # Cloud Security
    (8, 164, 4),  # Microservices
    (8, 165, 5),  # System Design
    (8, 149, 5),  # Infrastructure as Code
    (8, 148, 4),  # Monitoring & Logging
    (8, 431, 3),  # Networking
    (8, 406, 4),  # Problem Solving
    (8, 423, 4),  # Analytical Thinking

    # ── Role 9 ──
    (9, 176, 5),  # Cybersecurity
    (9, 178, 5),  # Network Security
    (9, 177, 4),  # Penetration Testing
    (9, 179, 4),  # OWASP
    (9, 181, 5),  # Vulnerability Assessment
    (9, 186, 5),  # Threat Modeling
    (9, 185, 5),  # Incident Response
    (9, 184, 5),  # SOC Operations
    (9, 192, 5),  # SIEM
    (9, 187, 4),  # Security Auditing
    (9, 182, 4),  # Identity & Access Management
    (9, 183, 4),  # Zero Trust Security
    (9, 180, 4),  # Cryptography
    (9, 193, 4),  # Firewall Management
    (9, 188, 3),  # Burp Suite
    (9, 189, 4),  # Wireshark
    (9, 191, 3),  # Nmap
    (9, 194, 3),  # PKI
    (9, 146, 4),  # Linux
    (9, 1, 3),  # Python
    (9, 163, 4),  # Cloud Security
    (9, 406, 5),  # Problem Solving
    (9, 423, 5),  # Analytical Thinking
    (9, 413, 5),  # Attention to Detail

    # ── Role 10 ──
    (10, 66, 5),  # React Native
    (10, 67, 5),  # Flutter
    (10, 68, 5),  # Android Development
    (10, 69, 5),  # iOS Development
    (10, 12, 4),  # Swift
    (10, 13, 5),  # Kotlin
    (10, 20, 4),  # Dart
    (10, 71, 4),  # SwiftUI
    (10, 72, 4),  # Jetpack Compose
    (10, 70, 3),  # Expo
    (10, 6, 4),  # JavaScript
    (10, 7, 4),  # TypeScript
    (10, 79, 4),  # Firebase
    (10, 32, 4),  # REST APIs
    (10, 138, 4),  # Git
    (10, 81, 3),  # SQLite
    (10, 37, 4),  # Responsive Design
    (10, 406, 5),  # Problem Solving
    (10, 413, 4),  # Attention to Detail
    (10, 412, 3),  # Creativity

    # ── Role 11 ──
    (11, 1, 5),  # Python
    (11, 8, 5),  # SQL
    (11, 15, 4),  # Scala
    (11, 2, 3),  # Java
    (11, 114, 5),  # Apache Spark
    (11, 115, 5),  # Apache Kafka
    (11, 116, 5),  # Apache Airflow
    (11, 111, 5),  # ETL Pipelines
    (11, 119, 5),  # Data Modeling
    (11, 120, 5),  # Data Warehousing
    (11, 118, 5),  # dbt
    (11, 117, 4),  # Hadoop
    (11, 113, 5),  # Big Data
    (11, 112, 4),  # Data Governance
    (11, 74, 4),  # PostgreSQL
    (11, 73, 4),  # MySQL
    (11, 75, 3),  # MongoDB
    (11, 76, 3),  # Redis
    (11, 171, 4),  # Google BigQuery
    (11, 167, 4),  # AWS S3
    (11, 169, 3),  # AWS RDS
    (11, 159, 4),  # AWS
    (11, 161, 4),  # GCP
    (11, 139, 4),  # Docker
    (11, 138, 4),  # Git
    (11, 146, 4),  # Linux
    (11, 90, 4),  # Query Optimization
    (11, 89, 4),  # Database Design
    (11, 406, 4),  # Problem Solving
    (11, 423, 5),  # Analytical Thinking

    # ── Role 12 ──
    (12, 1, 5),  # Python
    (12, 9, 4),  # R
    (12, 97, 5),  # PyTorch
    (12, 96, 5),  # TensorFlow
    (12, 98, 4),  # Keras
    (12, 101, 5),  # Machine Learning
    (12, 102, 5),  # Deep Learning
    (12, 128, 5),  # Reinforcement Learning
    (12, 103, 5),  # Natural Language Processing
    (12, 104, 5),  # Computer Vision
    (12, 100, 5),  # Statistics
    (12, 122, 5),  # Bayesian Statistics
    (12, 123, 5),  # Hypothesis Testing
    (12, 106, 4),  # Feature Engineering
    (12, 125, 5),  # LLM Fine-tuning
    (12, 130, 5),  # Hugging Face
    (12, 126, 4),  # RAG Systems
    (12, 134, 5),  # Embeddings
    (12, 135, 4),  # MLflow
    (12, 127, 4),  # AI Ethics
    (12, 137, 5),  # AI Safety
    (12, 133, 4),  # Vector Databases
    (12, 430, 5),  # Research Skills
    (12, 423, 5),  # Analytical Thinking
    (12, 429, 4),  # Written Communication
    (12, 406, 5),  # Problem Solving

    # ── Role 13 ──
    (13, 1, 4),  # Python
    (13, 6, 3),  # JavaScript
    (13, 8, 3),  # SQL
    (13, 138, 4),  # Git
    (13, 317, 4),  # JIRA
    (13, 340, 5),  # Quality Assurance
    (13, 32, 3),  # REST APIs
    (13, 330, 4),  # Agile
    (13, 331, 4),  # Scrum
    (13, 141, 3),  # CI/CD
    (13, 139, 3),  # Docker
    (13, 146, 3),  # Linux
    (13, 413, 5),  # Attention to Detail
    (13, 406, 5),  # Problem Solving
    (13, 423, 4),  # Analytical Thinking
    (13, 405, 3),  # Communication
    (13, 407, 4),  # Critical Thinking

    # ── Role 14 ──
    (14, 19, 5),  # Solidity
    (14, 6, 4),  # JavaScript
    (14, 7, 4),  # TypeScript
    (14, 1, 3),  # Python
    (14, 11, 4),  # Rust
    (14, 10, 3),  # Go
    (14, 180, 5),  # Cryptography
    (14, 32, 3),  # REST APIs
    (14, 57, 3),  # Node.js
    (14, 138, 4),  # Git
    (14, 165, 4),  # System Design
    (14, 139, 3),  # Docker
    (14, 406, 5),  # Problem Solving
    (14, 423, 5),  # Analytical Thinking
    (14, 413, 5),  # Attention to Detail

    # ── Role 15 ──
    (15, 146, 5),  # Linux
    (15, 1, 4),  # Python
    (15, 10, 3),  # Go
    (15, 18, 5),  # Shell Scripting
    (15, 139, 5),  # Docker
    (15, 140, 5),  # Kubernetes
    (15, 151, 4),  # Helm
    (15, 138, 4),  # Git
    (15, 141, 5),  # CI/CD
    (15, 142, 4),  # Terraform
    (15, 143, 4),  # Ansible
    (15, 157, 4),  # ArgoCD
    (15, 148, 5),  # Monitoring & Logging
    (15, 152, 5),  # Prometheus
    (15, 153, 5),  # Grafana
    (15, 154, 4),  # ELK Stack
    (15, 159, 4),  # AWS
    (15, 161, 4),  # GCP
    (15, 160, 4),  # Azure
    (15, 185, 5),  # Incident Response
    (15, 150, 5),  # Site Reliability Engineering
    (15, 165, 5),  # System Design
    (15, 147, 4),  # Nginx
    (15, 149, 5),  # Infrastructure as Code
    (15, 406, 5),  # Problem Solving
    (15, 423, 4),  # Analytical Thinking

    # ── Role 16 ──
    (16, 3, 5),  # C
    (16, 4, 5),  # C++
    (16, 24, 4),  # Assembly
    (16, 1, 3),  # Python
    (16, 11, 4),  # Rust
    (16, 17, 4),  # MATLAB
    (16, 18, 3),  # Shell Scripting
    (16, 146, 4),  # Linux
    (16, 138, 3),  # Git
    (16, 139, 2),  # Docker
    (16, 406, 5),  # Problem Solving
    (16, 413, 5),  # Attention to Detail
    (16, 423, 5),  # Analytical Thinking
    (16, 407, 4),  # Critical Thinking

    # ── Role 17 ──
    (17, 8, 5),  # SQL
    (17, 74, 5),  # PostgreSQL
    (17, 73, 5),  # MySQL
    (17, 87, 4),  # Oracle Database
    (17, 88, 4),  # MS SQL Server
    (17, 75, 4),  # MongoDB
    (17, 76, 4),  # Redis
    (17, 78, 3),  # Cassandra
    (17, 89, 5),  # Database Design
    (17, 90, 5),  # Query Optimization
    (17, 91, 5),  # Database Indexing
    (17, 92, 4),  # Stored Procedures
    (17, 83, 3),  # CockroachDB
    (17, 86, 3),  # MariaDB
    (17, 146, 4),  # Linux
    (17, 18, 3),  # Shell Scripting
    (17, 1, 3),  # Python
    (17, 169, 4),  # AWS RDS
    (17, 80, 3),  # Supabase
    (17, 79, 3),  # Firebase
    (17, 148, 4),  # Monitoring & Logging
    (17, 413, 5),  # Attention to Detail
    (17, 406, 4),  # Problem Solving

    # ── Role 18 ──
    (18, 146, 4),  # Linux
    (18, 431, 4),  # Networking
    (18, 344, 4),  # ServiceNow
    (18, 317, 3),  # JIRA
    (18, 319, 2),  # Notion
    (18, 176, 3),  # Cybersecurity
    (18, 193, 3),  # Firewall Management
    (18, 405, 5),  # Communication
    (18, 406, 5),  # Problem Solving
    (18, 424, 5),  # Customer Empathy
    (18, 413, 4),  # Attention to Detail
    (18, 411, 4),  # Adaptability
    (18, 409, 4),  # Teamwork

    # ── Role 19 ──
    (19, 165, 5),  # System Design
    (19, 159, 5),  # AWS
    (19, 160, 5),  # Azure
    (19, 161, 4),  # GCP
    (19, 164, 5),  # Microservices
    (19, 162, 4),  # Serverless Architecture
    (19, 139, 4),  # Docker
    (19, 140, 4),  # Kubernetes
    (19, 142, 4),  # Terraform
    (19, 163, 5),  # Cloud Security
    (19, 1, 3),  # Python
    (19, 2, 3),  # Java
    (19, 32, 4),  # REST APIs
    (19, 31, 3),  # GraphQL
    (19, 89, 4),  # Database Design
    (19, 149, 4),  # Infrastructure as Code
    (19, 8, 3),  # SQL
    (19, 74, 3),  # PostgreSQL
    (19, 75, 3),  # MongoDB
    (19, 316, 4),  # Executive Presentations
    (19, 315, 4),  # Stakeholder Management
    (19, 405, 5),  # Communication
    (19, 425, 5),  # Strategic Thinking
    (19, 406, 5),  # Problem Solving
    (19, 423, 4),  # Analytical Thinking

    # ── Role 20 ──
    (20, 429, 5),  # Written Communication
    (20, 405, 5),  # Communication
    (20, 32, 3),  # REST APIs
    (20, 138, 3),  # Git
    (20, 319, 3),  # Notion
    (20, 320, 4),  # Confluence
    (20, 430, 5),  # Research Skills
    (20, 413, 5),  # Attention to Detail
    (20, 407, 4),  # Critical Thinking
    (20, 411, 4),  # Adaptability

    # ── Role 21 ──
    (21, 8, 5),  # SQL
    (21, 195, 5),  # Power BI
    (21, 196, 5),  # Tableau
    (21, 197, 4),  # Looker
    (21, 199, 5),  # Excel
    (21, 200, 4),  # Google Sheets
    (21, 203, 4),  # Metabase
    (21, 204, 3),  # Superset
    (21, 206, 3),  # Domo
    (21, 207, 3),  # Qlik
    (21, 99, 5),  # Data Visualization
    (21, 110, 5),  # Data Storytelling
    (21, 1, 3),  # Python
    (21, 100, 4),  # Statistics
    (21, 292, 5),  # KPI Tracking
    (21, 119, 4),  # Data Modeling
    (21, 111, 3),  # ETL Pipelines
    (21, 405, 4),  # Communication
    (21, 423, 5),  # Analytical Thinking
    (21, 413, 4),  # Attention to Detail
    (21, 406, 4),  # Problem Solving

    # ── Role 22 ──
    (22, 124, 5),  # Prompt Engineering
    (22, 132, 5),  # OpenAI API
    (22, 131, 5),  # LangChain
    (22, 126, 5),  # RAG Systems
    (22, 134, 5),  # Embeddings
    (22, 133, 4),  # Vector Databases
    (22, 125, 4),  # LLM Fine-tuning
    (22, 129, 5),  # Generative AI
    (22, 130, 4),  # Hugging Face
    (22, 1, 4),  # Python
    (22, 32, 3),  # REST APIs
    (22, 127, 4),  # AI Ethics
    (22, 137, 3),  # AI Safety
    (22, 429, 5),  # Written Communication
    (22, 423, 5),  # Analytical Thinking
    (22, 407, 5),  # Critical Thinking
    (22, 430, 4),  # Research Skills
    (22, 412, 4),  # Creativity

    # ── Role 23 ──
    (23, 124, 4),  # Prompt Engineering
    (23, 129, 4),  # Generative AI
    (23, 127, 4),  # AI Ethics
    (23, 132, 3),  # OpenAI API
    (23, 131, 3),  # LangChain
    (23, 126, 3),  # RAG Systems
    (23, 305, 5),  # Product Roadmapping
    (23, 306, 5),  # User Story Writing
    (23, 309, 5),  # Customer Discovery
    (23, 310, 5),  # Prioritization Frameworks
    (23, 311, 4),  # Product Analytics
    (23, 312, 5),  # Feature Scoping
    (23, 314, 4),  # Product Launch
    (23, 278, 4),  # Go-to-Market Strategy
    (23, 315, 5),  # Stakeholder Management
    (23, 316, 5),  # Executive Presentations
    (23, 330, 4),  # Agile
    (23, 331, 3),  # Scrum
    (23, 291, 4),  # OKRs
    (23, 405, 5),  # Communication
    (23, 425, 5),  # Strategic Thinking
    (23, 414, 5),  # Decision Making
    (23, 408, 4),  # Leadership

    # ── Role 24 ──
    (24, 176, 5),  # Cybersecurity
    (24, 178, 5),  # Network Security
    (24, 177, 5),  # Penetration Testing
    (24, 179, 5),  # OWASP
    (24, 180, 5),  # Cryptography
    (24, 181, 5),  # Vulnerability Assessment
    (24, 182, 5),  # Identity & Access Management
    (24, 183, 5),  # Zero Trust Security
    (24, 186, 5),  # Threat Modeling
    (24, 187, 5),  # Security Auditing
    (24, 185, 4),  # Incident Response
    (24, 188, 4),  # Burp Suite
    (24, 190, 4),  # Metasploit
    (24, 191, 4),  # Nmap
    (24, 189, 4),  # Wireshark
    (24, 192, 4),  # SIEM
    (24, 193, 4),  # Firewall Management
    (24, 194, 4),  # PKI
    (24, 163, 5),  # Cloud Security
    (24, 1, 4),  # Python
    (24, 146, 5),  # Linux
    (24, 406, 5),  # Problem Solving
    (24, 423, 5),  # Analytical Thinking

    # ── Role 25 ──
    (25, 295, 5),  # Requirements Gathering
    (25, 8, 4),  # SQL
    (25, 199, 5),  # Excel
    (25, 286, 4),  # Business Strategy
    (25, 296, 5),  # Process Improvement
    (25, 99, 4),  # Data Visualization
    (25, 195, 3),  # Power BI
    (25, 196, 3),  # Tableau
    (25, 317, 4),  # JIRA
    (25, 320, 4),  # Confluence
    (25, 319, 3),  # Notion
    (25, 330, 4),  # Agile
    (25, 331, 3),  # Scrum
    (25, 292, 4),  # KPI Tracking
    (25, 300, 4),  # SWOT Analysis
    (25, 288, 4),  # Competitive Analysis
    (25, 405, 5),  # Communication
    (25, 315, 5),  # Stakeholder Management
    (25, 407, 5),  # Critical Thinking
    (25, 406, 5),  # Problem Solving
    (25, 423, 5),  # Analytical Thinking
    (25, 428, 4),  # Presentation Skills

    # ── Role 26 ──
    (26, 286, 5),  # Business Strategy
    (26, 299, 5),  # Strategic Planning
    (26, 287, 4),  # Market Research
    (26, 288, 5),  # Competitive Analysis
    (26, 300, 5),  # SWOT Analysis
    (26, 296, 5),  # Process Improvement
    (26, 297, 5),  # Change Management
    (26, 347, 4),  # Financial Analysis
    (26, 301, 5),  # Business Modeling
    (26, 302, 4),  # P&L Management
    (26, 199, 4),  # Excel
    (26, 405, 5),  # Communication
    (26, 316, 5),  # Executive Presentations
    (26, 315, 5),  # Stakeholder Management
    (26, 408, 4),  # Leadership
    (26, 423, 5),  # Analytical Thinking
    (26, 406, 5),  # Problem Solving
    (26, 425, 5),  # Strategic Thinking
    (26, 416, 4),  # Negotiation

    # ── Role 27 ──
    (27, 329, 5),  # Project Management
    (27, 296, 5),  # Process Improvement
    (27, 333, 5),  # Lean Operations
    (27, 334, 4),  # Six Sigma
    (27, 292, 5),  # KPI Tracking
    (27, 337, 4),  # Vendor Management
    (27, 342, 4),  # ERP Systems
    (27, 343, 3),  # SAP
    (27, 199, 4),  # Excel
    (27, 317, 3),  # JIRA
    (27, 318, 3),  # Asana
    (27, 349, 4),  # Budgeting & Forecasting
    (27, 298, 4),  # Risk Management
    (27, 405, 5),  # Communication
    (27, 408, 5),  # Leadership
    (27, 414, 5),  # Decision Making
    (27, 406, 5),  # Problem Solving
    (27, 315, 4),  # Stakeholder Management
    (27, 423, 4),  # Analytical Thinking
    (27, 425, 4),  # Strategic Thinking

    # ── Role 28 ──
    (28, 286, 5),  # Business Strategy
    (28, 290, 5),  # Product Strategy
    (28, 289, 5),  # Business Development
    (28, 278, 5),  # Go-to-Market Strategy
    (28, 302, 5),  # P&L Management
    (28, 287, 4),  # Market Research
    (28, 288, 4),  # Competitive Analysis
    (28, 346, 4),  # Financial Modeling
    (28, 349, 4),  # Budgeting & Forecasting
    (28, 291, 4),  # OKRs
    (28, 292, 4),  # KPI Tracking
    (28, 370, 4),  # Talent Acquisition
    (28, 408, 5),  # Leadership
    (28, 414, 5),  # Decision Making
    (28, 431, 5),  # Networking
    (28, 405, 5),  # Communication
    (28, 425, 5),  # Strategic Thinking
    (28, 411, 5),  # Adaptability
    (28, 436, 5),  # Resourcefulness

    # ── Role 29 ──
    (29, 286, 5),  # Business Strategy
    (29, 299, 5),  # Strategic Planning
    (29, 287, 5),  # Market Research
    (29, 288, 5),  # Competitive Analysis
    (29, 300, 5),  # SWOT Analysis
    (29, 347, 4),  # Financial Analysis
    (29, 301, 4),  # Business Modeling
    (29, 199, 5),  # Excel
    (29, 99, 4),  # Data Visualization
    (29, 195, 3),  # Power BI
    (29, 8, 3),  # SQL
    (29, 291, 3),  # OKRs
    (29, 292, 4),  # KPI Tracking
    (29, 405, 4),  # Communication
    (29, 423, 5),  # Analytical Thinking
    (29, 407, 5),  # Critical Thinking
    (29, 406, 5),  # Problem Solving
    (29, 428, 4),  # Presentation Skills
    (29, 430, 5),  # Research Skills

    # ── Role 30 ──
    (30, 329, 5),  # Project Management
    (30, 330, 5),  # Agile
    (30, 331, 5),  # Scrum
    (30, 332, 4),  # Kanban
    (30, 317, 5),  # JIRA
    (30, 318, 4),  # Asana
    (30, 319, 4),  # Notion
    (30, 320, 4),  # Confluence
    (30, 321, 3),  # Trello
    (30, 322, 3),  # Monday.com
    (30, 323, 3),  # ClickUp
    (30, 327, 4),  # Microsoft Project
    (30, 328, 3),  # Smartsheet
    (30, 298, 4),  # Risk Management
    (30, 349, 3),  # Budgeting & Forecasting
    (30, 315, 5),  # Stakeholder Management
    (30, 405, 5),  # Communication
    (30, 408, 4),  # Leadership
    (30, 406, 4),  # Problem Solving
    (30, 410, 5),  # Time Management
    (30, 414, 4),  # Decision Making

    # ── Role 31 ──
    (31, 289, 5),  # Business Development
    (31, 303, 5),  # Partnership Development
    (31, 304, 5),  # Contract Negotiation
    (31, 287, 4),  # Market Research
    (31, 288, 4),  # Competitive Analysis
    (31, 278, 4),  # Go-to-Market Strategy
    (31, 345, 4),  # Salesforce CRM
    (31, 245, 4),  # HubSpot
    (31, 286, 4),  # Business Strategy
    (31, 299, 4),  # Strategic Planning
    (31, 405, 5),  # Communication
    (31, 416, 5),  # Negotiation
    (31, 431, 5),  # Networking
    (31, 428, 5),  # Presentation Skills
    (31, 408, 3),  # Leadership
    (31, 425, 5),  # Strategic Thinking
    (31, 423, 3),  # Analytical Thinking

    # ── Role 32 ──
    (32, 265, 4),  # SEO
    (32, 266, 4),  # SEM
    (32, 247, 4),  # Google Ads
    (32, 248, 4),  # Meta Ads
    (32, 268, 4),  # Email Marketing
    (32, 250, 4),  # Klaviyo
    (32, 249, 3),  # Mailchimp
    (32, 198, 5),  # Google Analytics
    (32, 273, 5),  # Conversion Rate Optimization
    (32, 285, 5),  # Funnel Optimization
    (32, 272, 4),  # Marketing Analytics
    (32, 284, 4),  # Customer Segmentation
    (32, 267, 3),  # Content Marketing
    (32, 199, 4),  # Excel
    (32, 8, 3),  # SQL
    (32, 405, 4),  # Communication
    (32, 423, 4),  # Analytical Thinking
    (32, 406, 4),  # Problem Solving
    (32, 413, 4),  # Attention to Detail

    # ── Role 33 ──
    (33, 345, 4),  # Salesforce CRM
    (33, 245, 4),  # HubSpot
    (33, 424, 5),  # Customer Empathy
    (33, 405, 5),  # Communication
    (33, 418, 5),  # Active Listening
    (33, 372, 4),  # Onboarding
    (33, 311, 3),  # Product Analytics
    (33, 292, 4),  # KPI Tracking
    (33, 415, 4),  # Conflict Resolution
    (33, 416, 3),  # Negotiation
    (33, 428, 4),  # Presentation Skills
    (33, 315, 4),  # Stakeholder Management
    (33, 406, 5),  # Problem Solving
    (33, 420, 5),  # Emotional Intelligence
    (33, 411, 4),  # Adaptability
    (33, 429, 4),  # Written Communication
    (33, 409, 4),  # Teamwork

    # ── Role 34 ──
    (34, 305, 5),  # Product Roadmapping
    (34, 306, 5),  # User Story Writing
    (34, 307, 5),  # Backlog Management
    (34, 308, 4),  # Sprint Planning
    (34, 309, 5),  # Customer Discovery
    (34, 310, 5),  # Prioritization Frameworks
    (34, 311, 5),  # Product Analytics
    (34, 312, 5),  # Feature Scoping
    (34, 313, 4),  # Competitive Benchmarking
    (34, 314, 5),  # Product Launch
    (34, 278, 4),  # Go-to-Market Strategy
    (34, 291, 4),  # OKRs
    (34, 292, 5),  # KPI Tracking
    (34, 317, 4),  # JIRA
    (34, 319, 4),  # Notion
    (34, 320, 4),  # Confluence
    (34, 330, 4),  # Agile
    (34, 331, 4),  # Scrum
    (34, 315, 5),  # Stakeholder Management
    (34, 405, 5),  # Communication
    (34, 408, 4),  # Leadership
    (34, 414, 5),  # Decision Making
    (34, 425, 5),  # Strategic Thinking

    # ── Role 35 ──
    (35, 281, 5),  # Community Management
    (35, 269, 5),  # Social Media Marketing
    (35, 279, 5),  # Content Creation
    (35, 267, 4),  # Content Marketing
    (35, 252, 3),  # Hootsuite
    (35, 253, 3),  # Buffer
    (35, 262, 4),  # Sprout Social
    (35, 405, 5),  # Communication
    (35, 429, 5),  # Written Communication
    (35, 424, 5),  # Customer Empathy
    (35, 418, 4),  # Active Listening
    (35, 412, 4),  # Creativity
    (35, 282, 4),  # PR & Communications
    (35, 420, 4),  # Emotional Intelligence
    (35, 431, 4),  # Networking
    (35, 411, 4),  # Adaptability
    (35, 423, 3),  # Analytical Thinking

    # ── Role 36 ──
    (36, 346, 5),  # Financial Modeling
    (36, 347, 5),  # Financial Analysis
    (36, 348, 5),  # Valuation
    (36, 349, 5),  # Budgeting & Forecasting
    (36, 199, 5),  # Excel
    (36, 360, 4),  # Bloomberg Terminal
    (36, 8, 3),  # SQL
    (36, 195, 3),  # Power BI
    (36, 196, 3),  # Tableau
    (36, 356, 4),  # GAAP
    (36, 357, 4),  # IFRS
    (36, 364, 5),  # Financial Reporting
    (36, 361, 5),  # Corporate Finance
    (36, 353, 4),  # Investment Analysis
    (36, 355, 4),  # Risk Assessment
    (36, 366, 4),  # Cash Flow Management
    (36, 423, 5),  # Analytical Thinking
    (36, 413, 5),  # Attention to Detail
    (36, 407, 4),  # Critical Thinking
    (36, 405, 4),  # Communication

    # ── Role 37 ──
    (37, 346, 5),  # Financial Modeling
    (37, 348, 5),  # Valuation
    (37, 362, 5),  # Mergers & Acquisitions
    (37, 361, 5),  # Corporate Finance
    (37, 353, 5),  # Investment Analysis
    (37, 363, 4),  # Private Equity
    (37, 367, 5),  # Equity Research
    (37, 360, 5),  # Bloomberg Terminal
    (37, 199, 5),  # Excel
    (37, 397, 5),  # Due Diligence
    (37, 364, 4),  # Financial Reporting
    (37, 356, 3),  # GAAP
    (37, 357, 3),  # IFRS
    (37, 368, 4),  # Derivatives
    (37, 369, 4),  # Fixed Income
    (37, 416, 5),  # Negotiation
    (37, 405, 5),  # Communication
    (37, 316, 5),  # Executive Presentations
    (37, 423, 5),  # Analytical Thinking
    (37, 413, 5),  # Attention to Detail
    (37, 431, 4),  # Networking

    # ── Role 38 ──
    (38, 350, 5),  # Accounting
    (38, 356, 5),  # GAAP
    (38, 357, 4),  # IFRS
    (38, 364, 5),  # Financial Reporting
    (38, 352, 4),  # Auditing
    (38, 351, 4),  # Tax Compliance
    (38, 365, 5),  # Cost Accounting
    (38, 349, 4),  # Budgeting & Forecasting
    (38, 366, 4),  # Cash Flow Management
    (38, 358, 5),  # QuickBooks
    (38, 359, 4),  # Xero
    (38, 199, 5),  # Excel
    (38, 343, 3),  # SAP
    (38, 342, 3),  # ERP Systems
    (38, 413, 5),  # Attention to Detail
    (38, 423, 5),  # Analytical Thinking
    (38, 405, 3),  # Communication
    (38, 406, 3),  # Problem Solving

    # ── Role 39 ──
    (39, 355, 5),  # Risk Assessment
    (39, 298, 5),  # Risk Management
    (39, 347, 4),  # Financial Analysis
    (39, 346, 4),  # Financial Modeling
    (39, 100, 4),  # Statistics
    (39, 99, 3),  # Data Visualization
    (39, 199, 5),  # Excel
    (39, 360, 3),  # Bloomberg Terminal
    (39, 8, 3),  # SQL
    (39, 356, 3),  # GAAP
    (39, 392, 4),  # Regulatory Compliance
    (39, 423, 5),  # Analytical Thinking
    (39, 413, 5),  # Attention to Detail
    (39, 407, 5),  # Critical Thinking
    (39, 406, 4),  # Problem Solving
    (39, 405, 4),  # Communication

    # ── Role 40 ──
    (40, 100, 5),  # Statistics
    (40, 122, 5),  # Bayesian Statistics
    (40, 17, 4),  # MATLAB
    (40, 9, 5),  # R
    (40, 1, 4),  # Python
    (40, 199, 5),  # Excel
    (40, 346, 4),  # Financial Modeling
    (40, 355, 5),  # Risk Assessment
    (40, 108, 5),  # Predictive Modeling
    (40, 109, 4),  # Time Series Analysis
    (40, 123, 5),  # Hypothesis Testing
    (40, 119, 4),  # Data Modeling
    (40, 423, 5),  # Analytical Thinking
    (40, 413, 5),  # Attention to Detail
    (40, 406, 5),  # Problem Solving
    (40, 407, 5),  # Critical Thinking

    # ── Role 41 ──
    (41, 354, 5),  # Portfolio Management
    (41, 353, 5),  # Investment Analysis
    (41, 346, 5),  # Financial Modeling
    (41, 348, 5),  # Valuation
    (41, 367, 5),  # Equity Research
    (41, 368, 4),  # Derivatives
    (41, 369, 4),  # Fixed Income
    (41, 360, 5),  # Bloomberg Terminal
    (41, 199, 5),  # Excel
    (41, 355, 5),  # Risk Assessment
    (41, 361, 4),  # Corporate Finance
    (41, 287, 4),  # Market Research
    (41, 364, 3),  # Financial Reporting
    (41, 414, 5),  # Decision Making
    (41, 423, 5),  # Analytical Thinking
    (41, 425, 4),  # Strategic Thinking
    (41, 405, 4),  # Communication

    # ── Role 42 ──
    (42, 351, 5),  # Tax Compliance
    (42, 350, 5),  # Accounting
    (42, 356, 4),  # GAAP
    (42, 357, 3),  # IFRS
    (42, 352, 3),  # Auditing
    (42, 364, 4),  # Financial Reporting
    (42, 391, 4),  # Legal Research
    (42, 392, 5),  # Regulatory Compliance
    (42, 358, 4),  # QuickBooks
    (42, 199, 5),  # Excel
    (42, 343, 3),  # SAP
    (42, 413, 5),  # Attention to Detail
    (42, 423, 5),  # Analytical Thinking
    (42, 405, 4),  # Communication
    (42, 430, 4),  # Research Skills

    # ── Role 43 ──
    (43, 347, 5),  # Financial Analysis
    (43, 349, 5),  # Budgeting & Forecasting
    (43, 353, 4),  # Investment Analysis
    (43, 354, 4),  # Portfolio Management
    (43, 355, 4),  # Risk Assessment
    (43, 366, 5),  # Cash Flow Management
    (43, 199, 5),  # Excel
    (43, 358, 3),  # QuickBooks
    (43, 405, 5),  # Communication
    (43, 424, 5),  # Customer Empathy
    (43, 428, 4),  # Presentation Skills
    (43, 418, 5),  # Active Listening
    (43, 423, 4),  # Analytical Thinking
    (43, 413, 4),  # Attention to Detail

    # ── Role 44 ──
    (44, 265, 5),  # SEO
    (44, 266, 4),  # SEM
    (44, 247, 5),  # Google Ads
    (44, 248, 5),  # Meta Ads
    (44, 263, 4),  # LinkedIn Ads
    (44, 264, 3),  # TikTok Ads
    (44, 198, 5),  # Google Analytics
    (44, 258, 4),  # Google Tag Manager
    (44, 272, 5),  # Marketing Analytics
    (44, 267, 4),  # Content Marketing
    (44, 268, 4),  # Email Marketing
    (44, 249, 3),  # Mailchimp
    (44, 250, 3),  # Klaviyo
    (44, 269, 4),  # Social Media Marketing
    (44, 273, 4),  # Conversion Rate Optimization
    (44, 283, 4),  # Growth Marketing
    (44, 107, 4),  # A/B Testing
    (44, 405, 4),  # Communication
    (44, 423, 4),  # Analytical Thinking
    (44, 412, 4),  # Creativity

    # ── Role 45 ──
    (45, 267, 5),  # Content Marketing
    (45, 279, 5),  # Content Creation
    (45, 265, 4),  # SEO
    (45, 271, 4),  # Copywriting
    (45, 277, 4),  # Brand Strategy
    (45, 269, 4),  # Social Media Marketing
    (45, 268, 3),  # Email Marketing
    (45, 245, 3),  # HubSpot
    (45, 198, 4),  # Google Analytics
    (45, 272, 4),  # Marketing Analytics
    (45, 287, 4),  # Market Research
    (45, 284, 3),  # Customer Segmentation
    (45, 282, 3),  # PR & Communications
    (45, 429, 5),  # Written Communication
    (45, 405, 4),  # Communication
    (45, 412, 5),  # Creativity
    (45, 430, 4),  # Research Skills
    (45, 423, 3),  # Analytical Thinking

    # ── Role 46 ──
    (46, 265, 5),  # SEO
    (46, 257, 5),  # Google Search Console
    (46, 254, 5),  # SEMrush
    (46, 255, 5),  # Ahrefs
    (46, 256, 4),  # Moz
    (46, 198, 5),  # Google Analytics
    (46, 267, 4),  # Content Marketing
    (46, 271, 3),  # Copywriting
    (46, 39, 4),  # Web Performance Optimization
    (46, 26, 3),  # HTML
    (46, 99, 3),  # Data Visualization
    (46, 199, 3),  # Excel
    (46, 8, 2),  # SQL
    (46, 423, 5),  # Analytical Thinking
    (46, 413, 5),  # Attention to Detail
    (46, 430, 5),  # Research Skills
    (46, 429, 4),  # Written Communication

    # ── Role 47 ──
    (47, 269, 5),  # Social Media Marketing
    (47, 279, 5),  # Content Creation
    (47, 271, 4),  # Copywriting
    (47, 281, 4),  # Community Management
    (47, 252, 4),  # Hootsuite
    (47, 253, 4),  # Buffer
    (47, 262, 4),  # Sprout Social
    (47, 198, 3),  # Google Analytics
    (47, 272, 4),  # Marketing Analytics
    (47, 277, 4),  # Brand Strategy
    (47, 280, 4),  # Video Marketing
    (47, 217, 4),  # Canva
    (47, 210, 3),  # Adobe Photoshop
    (47, 405, 5),  # Communication
    (47, 412, 5),  # Creativity
    (47, 429, 5),  # Written Communication
    (47, 411, 4),  # Adaptability

    # ── Role 48 ──
    (48, 283, 5),  # Growth Marketing
    (48, 107, 5),  # A/B Testing
    (48, 273, 5),  # Conversion Rate Optimization
    (48, 285, 5),  # Funnel Optimization
    (48, 198, 5),  # Google Analytics
    (48, 201, 4),  # Mixpanel
    (48, 202, 4),  # Amplitude
    (48, 265, 4),  # SEO
    (48, 266, 4),  # SEM
    (48, 270, 4),  # Paid Advertising
    (48, 268, 4),  # Email Marketing
    (48, 272, 5),  # Marketing Analytics
    (48, 8, 3),  # SQL
    (48, 1, 3),  # Python
    (48, 284, 4),  # Customer Segmentation
    (48, 261, 4),  # Segment
    (48, 259, 4),  # Hotjar
    (48, 260, 4),  # Optimizely
    (48, 423, 5),  # Analytical Thinking
    (48, 412, 4),  # Creativity
    (48, 406, 4),  # Problem Solving

    # ── Role 49 ──
    (49, 277, 5),  # Brand Strategy
    (49, 236, 4),  # Brand Identity Design
    (49, 267, 4),  # Content Marketing
    (49, 287, 4),  # Market Research
    (49, 282, 4),  # PR & Communications
    (49, 288, 4),  # Competitive Analysis
    (49, 269, 3),  # Social Media Marketing
    (49, 271, 4),  # Copywriting
    (49, 217, 3),  # Canva
    (49, 211, 3),  # Adobe Illustrator
    (49, 198, 3),  # Google Analytics
    (49, 272, 3),  # Marketing Analytics
    (49, 405, 5),  # Communication
    (49, 412, 5),  # Creativity
    (49, 425, 5),  # Strategic Thinking
    (49, 428, 4),  # Presentation Skills
    (49, 429, 4),  # Written Communication

    # ── Role 50 ──
    (50, 287, 5),  # Market Research
    (50, 288, 5),  # Competitive Analysis
    (50, 300, 4),  # SWOT Analysis
    (50, 284, 4),  # Customer Segmentation
    (50, 100, 4),  # Statistics
    (50, 199, 5),  # Excel
    (50, 8, 3),  # SQL
    (50, 99, 4),  # Data Visualization
    (50, 196, 3),  # Tableau
    (50, 195, 3),  # Power BI
    (50, 430, 5),  # Research Skills
    (50, 423, 5),  # Analytical Thinking
    (50, 413, 5),  # Attention to Detail
    (50, 429, 4),  # Written Communication
    (50, 405, 4),  # Communication
    (50, 407, 4),  # Critical Thinking

    # ── Role 51 ──
    (51, 268, 5),  # Email Marketing
    (51, 249, 5),  # Mailchimp
    (51, 250, 5),  # Klaviyo
    (51, 251, 4),  # ActiveCampaign
    (51, 245, 4),  # HubSpot
    (51, 276, 5),  # Marketing Automation
    (51, 284, 4),  # Customer Segmentation
    (51, 271, 5),  # Copywriting
    (51, 107, 4),  # A/B Testing
    (51, 273, 4),  # Conversion Rate Optimization
    (51, 198, 3),  # Google Analytics
    (51, 272, 4),  # Marketing Analytics
    (51, 26, 3),  # HTML
    (51, 429, 5),  # Written Communication
    (51, 412, 4),  # Creativity
    (51, 423, 4),  # Analytical Thinking
    (51, 413, 4),  # Attention to Detail

    # ── Role 52 ──
    (52, 270, 5),  # Paid Advertising
    (52, 247, 5),  # Google Ads
    (52, 248, 5),  # Meta Ads
    (52, 263, 4),  # LinkedIn Ads
    (52, 264, 4),  # TikTok Ads
    (52, 266, 5),  # SEM
    (52, 272, 5),  # Marketing Analytics
    (52, 198, 5),  # Google Analytics
    (52, 258, 4),  # Google Tag Manager
    (52, 273, 5),  # Conversion Rate Optimization
    (52, 285, 5),  # Funnel Optimization
    (52, 107, 5),  # A/B Testing
    (52, 284, 4),  # Customer Segmentation
    (52, 199, 4),  # Excel
    (52, 8, 3),  # SQL
    (52, 423, 5),  # Analytical Thinking
    (52, 413, 5),  # Attention to Detail
    (52, 406, 4),  # Problem Solving

    # ── Role 53 ──
    (53, 278, 5),  # Go-to-Market Strategy
    (53, 277, 4),  # Brand Strategy
    (53, 287, 5),  # Market Research
    (53, 288, 5),  # Competitive Analysis
    (53, 313, 4),  # Competitive Benchmarking
    (53, 314, 5),  # Product Launch
    (53, 267, 4),  # Content Marketing
    (53, 271, 4),  # Copywriting
    (53, 272, 4),  # Marketing Analytics
    (53, 309, 4),  # Customer Discovery
    (53, 284, 4),  # Customer Segmentation
    (53, 282, 4),  # PR & Communications
    (53, 291, 3),  # OKRs
    (53, 292, 4),  # KPI Tracking
    (53, 315, 4),  # Stakeholder Management
    (53, 405, 5),  # Communication
    (53, 425, 5),  # Strategic Thinking
    (53, 428, 4),  # Presentation Skills
    (53, 429, 4),  # Written Communication
    (53, 423, 4),  # Analytical Thinking

    # ── Role 54 ──
    (54, 370, 4),  # Talent Acquisition
    (54, 371, 4),  # Interviewing
    (54, 372, 5),  # Onboarding
    (54, 373, 4),  # Performance Management
    (54, 374, 5),  # Employee Relations
    (54, 376, 5),  # HR Compliance
    (54, 377, 3),  # Workforce Planning
    (54, 378, 4),  # Learning & Development
    (54, 382, 3),  # Workday
    (54, 383, 4),  # BambooHR
    (54, 384, 3),  # ADP
    (54, 385, 3),  # Greenhouse ATS
    (54, 386, 3),  # Lever ATS
    (54, 405, 5),  # Communication
    (54, 420, 5),  # Emotional Intelligence
    (54, 415, 5),  # Conflict Resolution
    (54, 418, 5),  # Active Listening
    (54, 411, 4),  # Adaptability
    (54, 413, 4),  # Attention to Detail

    # ── Role 55 ──
    (55, 370, 5),  # Talent Acquisition
    (55, 371, 5),  # Interviewing
    (55, 372, 4),  # Onboarding
    (55, 385, 5),  # Greenhouse ATS
    (55, 386, 5),  # Lever ATS
    (55, 263, 4),  # LinkedIn Ads
    (55, 383, 3),  # BambooHR
    (55, 382, 3),  # Workday
    (55, 376, 3),  # HR Compliance
    (55, 374, 3),  # Employee Relations
    (55, 405, 5),  # Communication
    (55, 418, 5),  # Active Listening
    (55, 431, 5),  # Networking
    (55, 416, 4),  # Negotiation
    (55, 420, 4),  # Emotional Intelligence
    (55, 413, 4),  # Attention to Detail
    (55, 411, 3),  # Adaptability

    # ── Role 56 ──
    (56, 378, 5),  # Learning & Development
    (56, 372, 4),  # Onboarding
    (56, 373, 4),  # Performance Management
    (56, 380, 3),  # Organizational Design
    (56, 388, 5),  # Employee Engagement
    (56, 387, 4),  # Culture Amp
    (56, 432, 5),  # Coaching
    (56, 433, 5),  # Facilitation
    (56, 419, 5),  # Mentoring
    (56, 405, 5),  # Communication
    (56, 417, 5),  # Public Speaking
    (56, 428, 5),  # Presentation Skills
    (56, 411, 4),  # Adaptability
    (56, 412, 4),  # Creativity
    (56, 420, 4),  # Emotional Intelligence

    # ── Role 57 ──
    (57, 375, 5),  # Compensation Design
    (57, 376, 4),  # HR Compliance
    (57, 349, 4),  # Budgeting & Forecasting
    (57, 347, 3),  # Financial Analysis
    (57, 199, 5),  # Excel
    (57, 382, 4),  # Workday
    (57, 384, 4),  # ADP
    (57, 377, 3),  # Workforce Planning
    (57, 374, 3),  # Employee Relations
    (57, 413, 5),  # Attention to Detail
    (57, 423, 5),  # Analytical Thinking
    (57, 405, 4),  # Communication
    (57, 406, 3),  # Problem Solving

    # ── Role 58 ──
    (58, 376, 4),  # HR Compliance
    (58, 374, 5),  # Employee Relations
    (58, 373, 5),  # Performance Management
    (58, 370, 3),  # Talent Acquisition
    (58, 377, 5),  # Workforce Planning
    (58, 380, 4),  # Organizational Design
    (58, 297, 5),  # Change Management
    (58, 378, 4),  # Learning & Development
    (58, 381, 4),  # People Analytics
    (58, 291, 3),  # OKRs
    (58, 292, 3),  # KPI Tracking
    (58, 382, 3),  # Workday
    (58, 387, 3),  # Culture Amp
    (58, 405, 5),  # Communication
    (58, 315, 5),  # Stakeholder Management
    (58, 408, 4),  # Leadership
    (58, 425, 4),  # Strategic Thinking
    (58, 420, 5),  # Emotional Intelligence
    (58, 432, 4),  # Coaching

    # ── Role 59 ──
    (59, 380, 5),  # Organizational Design
    (59, 297, 5),  # Change Management
    (59, 388, 5),  # Employee Engagement
    (59, 387, 4),  # Culture Amp
    (59, 377, 4),  # Workforce Planning
    (59, 378, 4),  # Learning & Development
    (59, 432, 5),  # Coaching
    (59, 433, 5),  # Facilitation
    (59, 379, 4),  # Diversity & Inclusion
    (59, 389, 4),  # Succession Planning
    (59, 405, 5),  # Communication
    (59, 417, 4),  # Public Speaking
    (59, 315, 5),  # Stakeholder Management
    (59, 425, 5),  # Strategic Thinking
    (59, 420, 5),  # Emotional Intelligence
    (59, 423, 4),  # Analytical Thinking

    # ── Role 60 ──
    (60, 381, 5),  # People Analytics
    (60, 8, 4),  # SQL
    (60, 1, 4),  # Python
    (60, 9, 3),  # R
    (60, 199, 4),  # Excel
    (60, 195, 4),  # Power BI
    (60, 196, 3),  # Tableau
    (60, 100, 4),  # Statistics
    (60, 99, 4),  # Data Visualization
    (60, 377, 4),  # Workforce Planning
    (60, 376, 3),  # HR Compliance
    (60, 382, 4),  # Workday
    (60, 383, 3),  # BambooHR
    (60, 387, 3),  # Culture Amp
    (60, 423, 5),  # Analytical Thinking
    (60, 413, 4),  # Attention to Detail
    (60, 405, 4),  # Communication
    (60, 430, 4),  # Research Skills

    # ── Role 61 ──
    (61, 379, 5),  # Diversity & Inclusion
    (61, 374, 4),  # Employee Relations
    (61, 380, 4),  # Organizational Design
    (61, 297, 4),  # Change Management
    (61, 376, 4),  # HR Compliance
    (61, 388, 5),  # Employee Engagement
    (61, 377, 3),  # Workforce Planning
    (61, 378, 3),  # Learning & Development
    (61, 405, 5),  # Communication
    (61, 417, 5),  # Public Speaking
    (61, 433, 5),  # Facilitation
    (61, 432, 4),  # Coaching
    (61, 430, 4),  # Research Skills
    (61, 423, 4),  # Analytical Thinking
    (61, 420, 5),  # Emotional Intelligence
    (61, 434, 5),  # Cultural Awareness
    (61, 425, 4),  # Strategic Thinking
    (61, 315, 4),  # Stakeholder Management

    # ── Role 62 ──
    (62, 210, 5),  # Adobe Photoshop
    (62, 211, 5),  # Adobe Illustrator
    (62, 214, 4),  # Adobe InDesign
    (62, 217, 4),  # Canva
    (62, 208, 4),  # Figma
    (62, 239, 5),  # Visual Design
    (62, 234, 5),  # Typography
    (62, 235, 5),  # Color Theory
    (62, 236, 4),  # Brand Identity Design
    (62, 241, 4),  # Design Thinking
    (62, 244, 3),  # Design Critique
    (62, 216, 3),  # Sketch
    (62, 412, 5),  # Creativity
    (62, 413, 5),  # Attention to Detail
    (62, 405, 3),  # Communication
    (62, 411, 3),  # Adaptability

    # ── Role 63 ──
    (63, 213, 5),  # Adobe After Effects
    (63, 212, 4),  # Adobe Premiere Pro
    (63, 219, 4),  # Cinema 4D
    (63, 218, 3),  # Blender
    (63, 225, 3),  # DaVinci Resolve
    (63, 237, 5),  # Motion Design
    (63, 239, 4),  # Visual Design
    (63, 234, 4),  # Typography
    (63, 235, 4),  # Color Theory
    (63, 211, 4),  # Adobe Illustrator
    (63, 210, 3),  # Adobe Photoshop
    (63, 412, 5),  # Creativity
    (63, 413, 5),  # Attention to Detail
    (63, 410, 4),  # Time Management
    (63, 411, 3),  # Adaptability

    # ── Role 64 ──
    (64, 271, 5),  # Copywriting
    (64, 279, 5),  # Content Creation
    (64, 267, 4),  # Content Marketing
    (64, 265, 4),  # SEO
    (64, 277, 3),  # Brand Strategy
    (64, 282, 3),  # PR & Communications
    (64, 269, 3),  # Social Media Marketing
    (64, 268, 3),  # Email Marketing
    (64, 429, 5),  # Written Communication
    (64, 412, 5),  # Creativity
    (64, 430, 4),  # Research Skills
    (64, 413, 5),  # Attention to Detail
    (64, 411, 4),  # Adaptability
    (64, 405, 3),  # Communication

    # ── Role 65 ──
    (65, 239, 5),  # Visual Design
    (65, 236, 5),  # Brand Identity Design
    (65, 210, 5),  # Adobe Photoshop
    (65, 211, 5),  # Adobe Illustrator
    (65, 208, 4),  # Figma
    (65, 214, 4),  # Adobe InDesign
    (65, 234, 5),  # Typography
    (65, 235, 5),  # Color Theory
    (65, 233, 4),  # Design Systems
    (65, 244, 5),  # Design Critique
    (65, 237, 3),  # Motion Design
    (65, 241, 4),  # Design Thinking
    (65, 408, 4),  # Leadership
    (65, 405, 5),  # Communication
    (65, 412, 5),  # Creativity
    (65, 413, 5),  # Attention to Detail
    (65, 425, 3),  # Strategic Thinking

    # ── Role 66 ──
    (66, 212, 5),  # Adobe Premiere Pro
    (66, 225, 5),  # DaVinci Resolve
    (66, 226, 4),  # Final Cut Pro
    (66, 213, 4),  # Adobe After Effects
    (66, 227, 3),  # CapCut
    (66, 210, 3),  # Adobe Photoshop
    (66, 235, 3),  # Color Theory
    (66, 237, 3),  # Motion Design
    (66, 280, 4),  # Video Marketing
    (66, 279, 4),  # Content Creation
    (66, 412, 5),  # Creativity
    (66, 413, 5),  # Attention to Detail
    (66, 410, 4),  # Time Management
    (66, 411, 4),  # Adaptability

    # ── Role 67 ──
    (67, 208, 5),  # Figma
    (67, 209, 4),  # Adobe XD
    (67, 216, 3),  # Sketch
    (67, 220, 3),  # InVision
    (67, 221, 3),  # Zeplin
    (67, 222, 4),  # Framer
    (67, 228, 5),  # User Research
    (67, 229, 5),  # Wireframing
    (67, 230, 5),  # Prototyping
    (67, 231, 5),  # Usability Testing
    (67, 232, 5),  # Information Architecture
    (67, 233, 5),  # Design Systems
    (67, 238, 5),  # Interaction Design
    (67, 239, 5),  # Visual Design
    (67, 240, 4),  # Accessibility Design
    (67, 234, 4),  # Typography
    (67, 235, 4),  # Color Theory
    (67, 241, 5),  # Design Thinking
    (67, 242, 4),  # Heuristic Evaluation
    (67, 26, 3),  # HTML
    (67, 27, 3),  # CSS
    (67, 405, 4),  # Communication
    (67, 424, 5),  # Customer Empathy
    (67, 406, 5),  # Problem Solving
    (67, 412, 5),  # Creativity

    # ── Role 68 ──
    (68, 5, 4),  # C#
    (68, 4, 3),  # C++
    (68, 1, 2),  # Python
    (68, 218, 3),  # Blender
    (68, 238, 4),  # Interaction Design
    (68, 239, 3),  # Visual Design
    (68, 241, 4),  # Design Thinking
    (68, 230, 4),  # Prototyping
    (68, 412, 5),  # Creativity
    (68, 423, 4),  # Analytical Thinking
    (68, 406, 5),  # Problem Solving
    (68, 413, 4),  # Attention to Detail

    # ── Role 69 ──
    (69, 218, 5),  # Blender
    (69, 219, 5),  # Cinema 4D
    (69, 223, 4),  # Spline
    (69, 210, 3),  # Adobe Photoshop
    (69, 211, 3),  # Adobe Illustrator
    (69, 239, 4),  # Visual Design
    (69, 235, 4),  # Color Theory
    (69, 237, 3),  # Motion Design
    (69, 412, 5),  # Creativity
    (69, 413, 5),  # Attention to Detail
    (69, 410, 3),  # Time Management
    (69, 411, 3),  # Adaptability

    # ── Role 70 ──
    (70, 271, 5),  # Copywriting
    (70, 429, 5),  # Written Communication
    (70, 228, 4),  # User Research
    (70, 232, 4),  # Information Architecture
    (70, 208, 3),  # Figma
    (70, 241, 4),  # Design Thinking
    (70, 231, 3),  # Usability Testing
    (70, 267, 4),  # Content Marketing
    (70, 265, 3),  # SEO
    (70, 240, 4),  # Accessibility Design
    (70, 405, 5),  # Communication
    (70, 412, 4),  # Creativity
    (70, 413, 5),  # Attention to Detail
    (70, 424, 5),  # Customer Empathy
    (70, 430, 4),  # Research Skills

    # ── Role 71 ──
    (71, 236, 5),  # Brand Identity Design
    (71, 239, 5),  # Visual Design
    (71, 233, 4),  # Design Systems
    (71, 244, 5),  # Design Critique
    (71, 210, 4),  # Adobe Photoshop
    (71, 211, 4),  # Adobe Illustrator
    (71, 237, 4),  # Motion Design
    (71, 234, 5),  # Typography
    (71, 235, 5),  # Color Theory
    (71, 267, 3),  # Content Marketing
    (71, 271, 3),  # Copywriting
    (71, 408, 5),  # Leadership
    (71, 405, 5),  # Communication
    (71, 425, 5),  # Strategic Thinking
    (71, 412, 5),  # Creativity
    (71, 428, 4),  # Presentation Skills
    (71, 315, 4),  # Stakeholder Management

    # ── Role 72 ──
    (72, 338, 5),  # Logistics Management
    (72, 335, 4),  # Supply Chain Management
    (72, 339, 4),  # Inventory Management
    (72, 337, 3),  # Vendor Management
    (72, 336, 3),  # Procurement
    (72, 342, 4),  # ERP Systems
    (72, 343, 3),  # SAP
    (72, 199, 4),  # Excel
    (72, 413, 5),  # Attention to Detail
    (72, 405, 4),  # Communication
    (72, 406, 4),  # Problem Solving
    (72, 410, 5),  # Time Management
    (72, 411, 4),  # Adaptability
    (72, 423, 3),  # Analytical Thinking

    # ── Role 73 ──
    (73, 336, 5),  # Procurement
    (73, 337, 5),  # Vendor Management
    (73, 304, 5),  # Contract Negotiation
    (73, 335, 4),  # Supply Chain Management
    (73, 342, 4),  # ERP Systems
    (73, 343, 4),  # SAP
    (73, 199, 4),  # Excel
    (73, 349, 3),  # Budgeting & Forecasting
    (73, 298, 3),  # Risk Management
    (73, 288, 3),  # Competitive Analysis
    (73, 416, 5),  # Negotiation
    (73, 405, 4),  # Communication
    (73, 413, 5),  # Attention to Detail
    (73, 423, 4),  # Analytical Thinking

    # ── Role 74 ──
    (74, 340, 5),  # Quality Assurance
    (74, 334, 4),  # Six Sigma
    (74, 333, 4),  # Lean Operations
    (74, 296, 5),  # Process Improvement
    (74, 292, 4),  # KPI Tracking
    (74, 298, 4),  # Risk Management
    (74, 342, 3),  # ERP Systems
    (74, 413, 5),  # Attention to Detail
    (74, 423, 5),  # Analytical Thinking
    (74, 408, 4),  # Leadership
    (74, 405, 4),  # Communication
    (74, 406, 5),  # Problem Solving
    (74, 407, 4),  # Critical Thinking

    # ── Role 75 ──
    (75, 337, 4),  # Vendor Management
    (75, 336, 3),  # Procurement
    (75, 349, 4),  # Budgeting & Forecasting
    (75, 329, 3),  # Project Management
    (75, 298, 3),  # Risk Management
    (75, 342, 3),  # ERP Systems
    (75, 199, 3),  # Excel
    (75, 405, 4),  # Communication
    (75, 406, 4),  # Problem Solving
    (75, 408, 3),  # Leadership
    (75, 413, 4),  # Attention to Detail
    (75, 410, 4),  # Time Management
    (75, 411, 4),  # Adaptability

    # ── Role 76 ──
    (76, 329, 3),  # Project Management
    (76, 319, 4),  # Notion
    (76, 318, 3),  # Asana
    (76, 199, 4),  # Excel
    (76, 200, 3),  # Google Sheets
    (76, 320, 3),  # Confluence
    (76, 342, 3),  # ERP Systems
    (76, 344, 3),  # ServiceNow
    (76, 405, 5),  # Communication
    (76, 410, 5),  # Time Management
    (76, 413, 5),  # Attention to Detail
    (76, 408, 3),  # Leadership
    (76, 411, 4),  # Adaptability
    (76, 409, 4),  # Teamwork

    # ── Role 77 ──
    (77, 329, 5),  # Project Management
    (77, 330, 5),  # Agile
    (77, 331, 5),  # Scrum
    (77, 317, 5),  # JIRA
    (77, 320, 4),  # Confluence
    (77, 319, 4),  # Notion
    (77, 298, 5),  # Risk Management
    (77, 315, 5),  # Stakeholder Management
    (77, 291, 4),  # OKRs
    (77, 292, 4),  # KPI Tracking
    (77, 165, 3),  # System Design
    (77, 8, 3),  # SQL
    (77, 405, 5),  # Communication
    (77, 408, 5),  # Leadership
    (77, 414, 5),  # Decision Making
    (77, 425, 4),  # Strategic Thinking
    (77, 421, 5),  # Cross-functional Collaboration

    # ── Role 78 ──
    (78, 331, 5),  # Scrum
    (78, 330, 5),  # Agile
    (78, 332, 4),  # Kanban
    (78, 317, 5),  # JIRA
    (78, 320, 4),  # Confluence
    (78, 325, 3),  # Linear
    (78, 307, 4),  # Backlog Management
    (78, 308, 5),  # Sprint Planning
    (78, 433, 5),  # Facilitation
    (78, 432, 4),  # Coaching
    (78, 415, 4),  # Conflict Resolution
    (78, 315, 4),  # Stakeholder Management
    (78, 405, 5),  # Communication
    (78, 408, 4),  # Leadership
    (78, 406, 4),  # Problem Solving
    (78, 411, 4),  # Adaptability

    # ── Role 79 ──
    (79, 345, 4),  # Salesforce CRM
    (79, 245, 3),  # HubSpot
    (79, 344, 4),  # ServiceNow
    (79, 424, 5),  # Customer Empathy
    (79, 405, 5),  # Communication
    (79, 418, 5),  # Active Listening
    (79, 415, 5),  # Conflict Resolution
    (79, 406, 5),  # Problem Solving
    (79, 429, 4),  # Written Communication
    (79, 420, 5),  # Emotional Intelligence
    (79, 411, 5),  # Adaptability
    (79, 409, 4),  # Teamwork
    (79, 413, 4),  # Attention to Detail
    (79, 410, 4),  # Time Management

    # ── Role 80 ──
    (80, 345, 5),  # Salesforce CRM
    (80, 245, 4),  # HubSpot
    (80, 8, 4),  # SQL
    (80, 199, 5),  # Excel
    (80, 195, 4),  # Power BI
    (80, 196, 3),  # Tableau
    (80, 272, 4),  # Marketing Analytics
    (80, 292, 5),  # KPI Tracking
    (80, 296, 4),  # Process Improvement
    (80, 99, 4),  # Data Visualization
    (80, 423, 5),  # Analytical Thinking
    (80, 413, 5),  # Attention to Detail
    (80, 405, 4),  # Communication
    (80, 406, 4),  # Problem Solving

    # ── Role 81 ──
    (81, 335, 5),  # Supply Chain Management
    (81, 338, 5),  # Logistics Management
    (81, 339, 5),  # Inventory Management
    (81, 336, 4),  # Procurement
    (81, 337, 5),  # Vendor Management
    (81, 342, 5),  # ERP Systems
    (81, 343, 4),  # SAP
    (81, 333, 4),  # Lean Operations
    (81, 334, 3),  # Six Sigma
    (81, 298, 4),  # Risk Management
    (81, 349, 3),  # Budgeting & Forecasting
    (81, 199, 4),  # Excel
    (81, 99, 3),  # Data Visualization
    (81, 405, 4),  # Communication
    (81, 408, 4),  # Leadership
    (81, 423, 4),  # Analytical Thinking
    (81, 406, 4),  # Problem Solving

    # ── Role 82 ──
    (82, 395, 5),  # Corporate Law
    (82, 390, 5),  # Contract Drafting
    (82, 391, 5),  # Legal Research
    (82, 397, 5),  # Due Diligence
    (82, 362, 4),  # Mergers & Acquisitions
    (82, 392, 4),  # Regulatory Compliance
    (82, 393, 3),  # Intellectual Property Law
    (82, 400, 3),  # Employment Law
    (82, 398, 5),  # Legal Writing
    (82, 403, 4),  # Contract Management
    (82, 416, 5),  # Negotiation
    (82, 405, 5),  # Communication
    (82, 423, 5),  # Analytical Thinking
    (82, 413, 5),  # Attention to Detail
    (82, 430, 5),  # Research Skills
    (82, 407, 5),  # Critical Thinking

    # ── Role 83 ──
    (83, 392, 5),  # Regulatory Compliance
    (83, 376, 4),  # HR Compliance
    (83, 399, 5),  # GDPR Compliance
    (83, 402, 4),  # Anti-money Laundering
    (83, 391, 5),  # Legal Research
    (83, 298, 5),  # Risk Management
    (83, 394, 4),  # Data Privacy Law
    (83, 398, 4),  # Legal Writing
    (83, 403, 3),  # Contract Management
    (83, 352, 4),  # Auditing
    (83, 413, 5),  # Attention to Detail
    (83, 423, 5),  # Analytical Thinking
    (83, 405, 4),  # Communication
    (83, 430, 4),  # Research Skills
    (83, 407, 5),  # Critical Thinking

    # ── Role 84 ──
    (84, 391, 5),  # Legal Research
    (84, 398, 5),  # Legal Writing
    (84, 390, 4),  # Contract Drafting
    (84, 396, 5),  # Litigation Support
    (84, 397, 4),  # Due Diligence
    (84, 392, 3),  # Regulatory Compliance
    (84, 403, 4),  # Contract Management
    (84, 413, 5),  # Attention to Detail
    (84, 429, 5),  # Written Communication
    (84, 423, 4),  # Analytical Thinking
    (84, 430, 5),  # Research Skills
    (84, 410, 5),  # Time Management
    (84, 411, 3),  # Adaptability

    # ── Role 85 ──
    (85, 390, 5),  # Contract Drafting
    (85, 403, 5),  # Contract Management
    (85, 391, 4),  # Legal Research
    (85, 392, 4),  # Regulatory Compliance
    (85, 397, 4),  # Due Diligence
    (85, 395, 3),  # Corporate Law
    (85, 398, 4),  # Legal Writing
    (85, 416, 5),  # Negotiation
    (85, 298, 4),  # Risk Management
    (85, 413, 5),  # Attention to Detail
    (85, 423, 4),  # Analytical Thinking
    (85, 405, 4),  # Communication
    (85, 429, 4),  # Written Communication

    # ── Role 86 ──
    (86, 393, 5),  # Intellectual Property Law
    (86, 391, 5),  # Legal Research
    (86, 398, 5),  # Legal Writing
    (86, 390, 3),  # Contract Drafting
    (86, 392, 4),  # Regulatory Compliance
    (86, 397, 4),  # Due Diligence
    (86, 395, 3),  # Corporate Law
    (86, 413, 5),  # Attention to Detail
    (86, 430, 5),  # Research Skills
    (86, 423, 5),  # Analytical Thinking
    (86, 429, 4),  # Written Communication
    (86, 405, 4),  # Communication
    (86, 407, 4),  # Critical Thinking

    # ── Role 87 ──
    (87, 394, 5),  # Data Privacy Law
    (87, 399, 5),  # GDPR Compliance
    (87, 392, 5),  # Regulatory Compliance
    (87, 391, 4),  # Legal Research
    (87, 398, 4),  # Legal Writing
    (87, 176, 3),  # Cybersecurity
    (87, 182, 3),  # Identity & Access Management
    (87, 298, 4),  # Risk Management
    (87, 403, 3),  # Contract Management
    (87, 402, 3),  # Anti-money Laundering
    (87, 413, 5),  # Attention to Detail
    (87, 423, 5),  # Analytical Thinking
    (87, 405, 4),  # Communication
    (87, 430, 4),  # Research Skills
    (87, 407, 5),  # Critical Thinking

    # ── Role 88 ──
    (88, 392, 5),  # Regulatory Compliance
    (88, 391, 5),  # Legal Research
    (88, 398, 4),  # Legal Writing
    (88, 397, 4),  # Due Diligence
    (88, 298, 4),  # Risk Management
    (88, 394, 3),  # Data Privacy Law
    (88, 395, 3),  # Corporate Law
    (88, 413, 5),  # Attention to Detail
    (88, 430, 5),  # Research Skills
    (88, 423, 5),  # Analytical Thinking
    (88, 429, 4),  # Written Communication
    (88, 405, 4),  # Communication
    (88, 407, 4),  # Critical Thinking

    # ── Role 89 ──
    (89, 404, 5),  # Legal Operations
    (89, 403, 5),  # Contract Management
    (89, 329, 4),  # Project Management
    (89, 296, 4),  # Process Improvement
    (89, 391, 3),  # Legal Research
    (89, 398, 3),  # Legal Writing
    (89, 342, 3),  # ERP Systems
    (89, 319, 3),  # Notion
    (89, 320, 3),  # Confluence
    (89, 349, 3),  # Budgeting & Forecasting
    (89, 292, 3),  # KPI Tracking
    (89, 405, 5),  # Communication
    (89, 408, 4),  # Leadership
    (89, 315, 4),  # Stakeholder Management
    (89, 423, 4),  # Analytical Thinking
    (89, 425, 4),  # Strategic Thinking
    (89, 413, 4),  # Attention to Detail

    # ── Role 90 ──
    (90, 401, 5),  # Environmental Law
    (90, 392, 5),  # Regulatory Compliance
    (90, 391, 4),  # Legal Research
    (90, 398, 4),  # Legal Writing
    (90, 355, 4),  # Risk Assessment
    (90, 112, 3),  # Data Governance
    (90, 352, 3),  # Auditing
    (90, 413, 5),  # Attention to Detail
    (90, 430, 5),  # Research Skills
    (90, 423, 5),  # Analytical Thinking
    (90, 429, 4),  # Written Communication
    (90, 405, 3),  # Communication
    (90, 407, 4),  # Critical Thinking
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