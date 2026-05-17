from database import SessionLocal
from models import Role

db = SessionLocal()

roles_data = [
    # ── Software & IT (24) ─────────────────────────────────────────────
    ("Data Analyst", "Software & IT", "Analyzes structured data to generate actionable insights."),
    ("Backend Developer", "Software & IT", "Builds server-side applications and APIs."),
    ("Frontend Developer", "Software & IT", "Builds user interfaces and client-side logic."),
    ("Full Stack Developer", "Software & IT", "Works across both frontend and backend systems."),
    ("Machine Learning Engineer", "Software & IT", "Builds ML models and production ML systems."),
    ("DevOps Engineer", "Software & IT", "Manages CI/CD pipelines and infrastructure automation."),
    ("Data Scientist", "Software & IT", "Applies statistical and ML techniques to solve business problems."),
    ("Cloud Engineer", "Software & IT", "Designs and manages cloud infrastructure at scale."),
    ("Cybersecurity Analyst", "Software & IT", "Monitors and defends systems against cyber threats."),
    ("Mobile Developer", "Software & IT", "Builds iOS and Android applications."),
    ("Data Engineer", "Software & IT", "Designs and maintains data pipelines and warehouses."),
    ("AI Research Scientist", "Software & IT", "Conducts research to advance AI and deep learning models."),
    ("QA Engineer", "Software & IT", "Tests software to ensure quality and reliability."),
    ("Blockchain Developer", "Software & IT", "Builds decentralized applications and smart contracts."),
    ("Site Reliability Engineer", "Software & IT", "Ensures reliability and scalability of production systems."),
    ("Embedded Systems Engineer", "Software & IT", "Develops software for hardware and IoT devices."),
    ("Database Administrator", "Software & IT", "Manages and optimizes relational and NoSQL database systems."),
    ("IT Support Specialist", "Software & IT", "Provides technical support and troubleshoots IT issues."),
    ("Solutions Architect", "Software & IT", "Designs scalable system architectures and technical solutions."),
    ("Technical Writer", "Software & IT", "Creates clear documentation for APIs, products, and systems."),
    ("BI Analyst", "Software & IT", "Builds dashboards and reports to support data-driven decisions."),
    ("Prompt Engineer", "Software & IT", "Designs and optimizes prompts for large language model applications."),
    ("AI Product Manager", "Software & IT", "Leads product strategy for AI-powered tools and platforms."),
    ("Security Engineer", "Software & IT", "Designs and implements security systems and protocols."),

    # ── Business & Strategy (11) ───────────────────────────────────────
    ("Business Analyst", "Business & Strategy", "Bridges business needs and technical solutions through data."),
    ("Management Consultant", "Business & Strategy", "Advises organizations on strategy and operational improvement."),
    ("Operations Manager", "Business & Strategy", "Oversees day-to-day business operations and efficiency."),
    ("Startup Founder", "Business & Strategy", "Builds and scales new business ventures from the ground up."),
    ("Strategy Analyst", "Business & Strategy", "Analyzes market trends and develops competitive strategies."),
    ("Project Manager", "Business & Strategy", "Plans, executes, and closes projects on time and budget."),
    ("Business Development Manager", "Business & Strategy", "Identifies growth opportunities and builds strategic partnerships."),
    ("E-commerce Manager", "Business & Strategy", "Manages online sales channels and digital storefronts."),
    ("Customer Success Manager", "Business & Strategy", "Ensures customers achieve measurable value from products or services."),
    ("Product Manager", "Business & Strategy", "Defines product strategy, roadmap, and cross-functional execution."),
    ("Community Manager", "Business & Strategy", "Builds and nurtures brand communities across platforms."),

    # ── Finance (8) ────────────────────────────────────────────────────
    ("Financial Analyst", "Finance", "Evaluates financial data to guide investment and business decisions."),
    ("Investment Banker", "Finance", "Advises on mergers, acquisitions, and capital raising."),
    ("Accountant", "Finance", "Manages financial records, reporting, and regulatory compliance."),
    ("Risk Analyst", "Finance", "Identifies and mitigates financial and operational risks."),
    ("Actuary", "Finance", "Uses statistics to assess financial risk in insurance and pensions."),
    ("Portfolio Manager", "Finance", "Manages investment portfolios to meet long-term financial goals."),
    ("Tax Consultant", "Finance", "Provides tax planning and compliance advisory services."),
    ("Financial Planner", "Finance", "Helps individuals plan savings, investments, and retirement."),

    # ── Marketing (10) ─────────────────────────────────────────────────
    ("Digital Marketing Specialist", "Marketing", "Drives online growth through SEO, paid ads, and content."),
    ("Content Strategist", "Marketing", "Plans and manages content to attract and retain target audiences."),
    ("SEO Specialist", "Marketing", "Optimizes websites to rank higher in search engine results."),
    ("Social Media Manager", "Marketing", "Manages brand presence and engagement on social platforms."),
    ("Growth Marketer", "Marketing", "Runs rapid experiments to accelerate user and revenue growth."),
    ("Brand Manager", "Marketing", "Shapes and maintains the identity and perception of a brand."),
    ("Market Research Analyst", "Marketing", "Gathers and analyzes data on markets and consumer behavior."),
    ("Email Marketing Specialist", "Marketing", "Designs and optimizes email campaigns for engagement and conversion."),
    ("Performance Marketing Manager", "Marketing", "Manages paid acquisition channels for measurable ROI."),
    ("Product Marketing Manager", "Marketing", "Positions products and drives go-to-market strategy execution."),

    # ── Human Resources (8) ────────────────────────────────────────────
    ("HR Generalist", "Human Resources", "Handles recruitment, employee relations, and HR operations."),
    ("Talent Acquisition Specialist", "Human Resources", "Sources and hires top talent for the organization."),
    ("Learning & Development Manager", "Human Resources", "Designs training programs and career development initiatives."),
    ("Compensation & Benefits Analyst", "Human Resources", "Structures employee pay, benefits, and incentive programs."),
    ("HR Business Partner", "Human Resources", "Aligns HR strategy with business goals for specific units."),
    ("Organizational Development Consultant", "Human Resources", "Improves organizational effectiveness and workplace culture."),
    ("People Analytics Specialist", "Human Resources", "Uses data to drive HR decisions and workforce planning."),
    ("Diversity & Inclusion Manager", "Human Resources", "Builds equitable and inclusive workplace programs and policies."),

    # ── Design & Creative (10) ─────────────────────────────────────────
    ("Graphic Designer", "Design & Creative", "Creates visual content for digital and print media."),
    ("Motion Graphics Designer", "Design & Creative", "Produces animated visuals and video graphics for digital platforms."),
    ("Copywriter", "Design & Creative", "Writes persuasive and engaging content for brands and campaigns."),
    ("Art Director", "Design & Creative", "Leads visual direction for creative campaigns and branded content."),
    ("Video Editor", "Design & Creative", "Edits and produces polished video content for various platforms."),
    ("UI & UX Designer", "Design & Creative", "Designs intuitive user interfaces and end-to-end user experiences."),
    ("Game Designer", "Design & Creative", "Designs gameplay mechanics, levels, and interactive player experiences."),
    ("3D Modeler", "Design & Creative", "Creates three-dimensional assets for games, film, and product design."),
    ("UX Writer", "Design & Creative", "Crafts microcopy and interface text to guide digital product users."),
    ("Creative Director", "Design & Creative", "Sets the overarching creative vision for a brand or campaign."),

    # ── Operations (10) ────────────────────────────────────────────────
    ("Logistics Coordinator", "Operations", "Coordinates transportation, warehousing, and delivery of goods."),
    ("Procurement Specialist", "Operations", "Manages vendor relationships and organizational purchasing processes."),
    ("Quality Assurance Manager", "Operations", "Ensures products and services consistently meet quality standards."),
    ("Facilities Manager", "Operations", "Manages physical workspace, maintenance, and workplace safety."),
    ("Administrative Manager", "Operations", "Oversees administrative functions and internal office operations."),
    ("Technical Program Manager", "Operations", "Coordinates large-scale technical programs across multiple teams."),
    ("Scrum Master", "Operations", "Facilitates agile ceremonies and removes blockers for delivery teams."),
    ("Customer Support Specialist", "Operations", "Resolves customer issues and delivers consistent service excellence."),
    ("Sales Operations Analyst", "Operations", "Optimizes sales processes, tooling, and performance reporting."),
    ("Supply Chain Manager", "Operations", "Manages end-to-end supply chain strategy and logistics networks."),

    # ── Legal & Compliance (9) ─────────────────────────────────────────
    ("Corporate Lawyer", "Legal & Compliance", "Advises businesses on legal matters, risk, and transactions."),
    ("Compliance Officer", "Legal & Compliance", "Ensures the organization adheres to relevant laws and regulations."),
    ("Paralegal", "Legal & Compliance", "Supports lawyers with research, documentation, and case preparation."),
    ("Contract Manager", "Legal & Compliance", "Drafts, reviews, negotiates, and manages legal contracts."),
    ("Intellectual Property Specialist", "Legal & Compliance", "Protects and manages trademarks, patents, and copyrights."),
    ("Data Privacy Officer", "Legal & Compliance", "Ensures compliance with data protection laws such as GDPR and CCPA."),
    ("Regulatory Affairs Specialist", "Legal & Compliance", "Navigates industry regulations to support product approvals."),
    ("Legal Operations Manager", "Legal & Compliance", "Optimizes efficiency and technology within legal department workflows."),
    ("Environmental Compliance Analyst", "Legal & Compliance", "Monitors and reports on adherence to environmental laws and standards."),
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