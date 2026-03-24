import re
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# -------------------- NLP MODEL --------------------
import spacy
import os

try:
    nlp = spacy.load("en_core_web_sm")
except:
    os.system("python -m spacy download en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


# -------------------- STOPWORDS --------------------
STOPWORDS = set([
    "and", "or", "the", "a", "an", "of", "to", "for", "in", "on", "with",
    "at", "by", "is", "are", "was", "were", "be"
])

TECH_STOPWORDS = STOPWORDS.union(set([
    "skills", "experience", "requirements", "responsibilities",
    "ability", "including", "strong", "team", "work", "knowledge",
    "using", "like", "our", "will", "must", "should", "good",
    "seeking", "preferred"
]))


ACTION_VERBS = [
    "developed", "implemented", "designed", "built",
    "led", "managed", "optimized", "created",
    "analyzed", "improved", "engineered"
]


# -------------------- TEXT CLEANING --------------------
def clean_text(text):
    return re.sub(r'\s+', ' ', text.lower())


# -------------------- ADVANCED KEYWORD EXTRACTION --------------------
def extract_keywords(text):
    doc = nlp(text.lower())
    keywords = []

    for token in doc:
        # Keep only nouns & proper nouns
        if token.pos_ in ["NOUN", "PROPN"]:
            word = token.text.strip()

            if (
                word not in TECH_STOPWORDS and
                len(word) > 3 and
                not word.isdigit()
            ):
                keywords.append(word)

    # Detect 2-word phrases (like machine learning)
    phrases = []
    for chunk in doc.noun_chunks:
        phrase = chunk.text.lower().strip()
        if len(phrase.split()) == 2:
            phrases.append(phrase)

    return list(set(keywords + phrases))


# -------------------- KEYWORD MATCHING --------------------
def keyword_match_score(resume_text, jd_text):
    jd_keywords = extract_keywords(jd_text)
    resume_text = resume_text.lower()

    matched = []
    missing = []

    for kw in jd_keywords:
        # safer boundary matching
        pattern = r'\b' + re.escape(kw) + r'\b'
        if re.search(pattern, resume_text):
            matched.append(kw)
        else:
            missing.append(kw)

    if not jd_keywords:
        return 0, [], []

    score = (len(matched) / len(jd_keywords)) * 100

    return round(score, 2), matched[:20], missing[:20]


# -------------------- SEMANTIC SIMILARITY --------------------
def semantic_similarity_score(resume_text, jd_text):
    vectorizer = TfidfVectorizer(ngram_range=(1, 2))
    vectors = vectorizer.fit_transform([resume_text, jd_text])
    similarity = cosine_similarity(vectors[0:1], vectors[1:2])[0][0]
    return round(similarity * 100, 2)


# -------------------- QUANTIFIED SCORE --------------------
def quantified_score(resume_text):
    count = len(re.findall(r'\d+%|\$\d+|\d+\+|\d+ years', resume_text.lower()))
    return min(count * 10, 100)


# -------------------- ACTION VERB SCORE --------------------
def action_verb_score(resume_text):
    count = sum(1 for verb in ACTION_VERBS if verb in resume_text.lower())
    return min(count * 8, 100)


# -------------------- STRUCTURE SCORE --------------------
def structure_score(resume_text):
    sections = ["skills", "experience", "education", "projects"]
    present = sum(1 for sec in sections if sec in resume_text.lower())
    return (present / len(sections)) * 100


# -------------------- READABILITY SCORE --------------------
def readability_score(resume_text):
    words = resume_text.split()
    length = len(words)

    if length < 200:
        return 40
    elif length < 400:
        return 70
    else:
        return 90


# -------------------- MAIN ATS CALCULATION --------------------
# -------------------- RESUME QUALITY CALCULATION --------------------
def calculate_resume_quality(resume_text):

    resume_text = clean_text(resume_text)

    quant_score = quantified_score(resume_text)
    verb_score = action_verb_score(resume_text)
    struct_score = structure_score(resume_text)
    read_score = readability_score(resume_text)

    overall_quality = (
        struct_score * 0.25 +
        verb_score * 0.25 +
        quant_score * 0.25 +
        read_score * 0.25
    )

    suggestions = []

    if quant_score < 40:
        suggestions.append("Include measurable achievements with numbers or percentages.")

    if verb_score < 40:
        suggestions.append("Use strong action verbs like developed, built, implemented.")

    if struct_score < 80:
        suggestions.append("Ensure resume has Skills, Experience, Education, Projects sections.")

    if read_score < 60:
        suggestions.append("Improve formatting and resume length balance.")

    return {
        "quality_score": round(overall_quality, 2),
        "breakdown": {
            "structure_score": struct_score,
            "action_verb_score": verb_score,
            "quantified_score": quant_score,
            "readability_score": read_score
        },
        "suggestions": suggestions
    }