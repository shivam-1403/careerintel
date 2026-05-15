import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, AlertCircle, Target, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './Dashboard.css';
import './CareerDetails.css';

const API_BASE = 'https://careerintel-w10f.onrender.com';

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

const CareerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [career, setCareer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ------ AI Insights state ------
    const [aiInsights, setAiInsights] = useState(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(null);

    const loadCareer = useCallback(async () => {
        if (!id) {
            setError('Invalid career link.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/career/${encodeURIComponent(id)}`, {
                headers: authHeaders()
            });

            if (res.status === 404) {
                setError('Career not found.');
                setCareer(null);
                return;
            }

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || `Request failed (${res.status})`);
            }

            const data = await res.json();
            setCareer(data);
        } catch (e) {
            console.error(e);
            setError(e.message || 'Could not load career details.');
            setCareer(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    // Fetch career on mount
    useEffect(() => {
        loadCareer();
    }, [loadCareer]);

    // AI Insights fetcher
    useEffect(() => {
        // Only attempt if full match data available
        if (
            !career ||
            !career.name ||
            !career.description ||
            typeof career.match_score !== 'number' ||
            !Array.isArray(career.matched_skills) ||
            !Array.isArray(career.missing_skills)
        ) {
            setAiInsights(null);
            setAiLoading(false);
            setAiError(null);
            return;
        }

        let ignore = false;
        setAiLoading(true);
        setAiError(null);
        setAiInsights(null);

        // Prepare AI prompt data
        const payload = {
            role_name: career.name,
            description: career.description,
            match_score: career.match_score,
            matched_skills: career.matched_skills,
            missing_skills: career.missing_skills,
        };

        // Call backend endpoint for AI insight (assuming /career/{id}/ai_insight)
        fetch(`${API_BASE}/career/${encodeURIComponent(id)}/ai_insight`, {
            headers: {
                ...authHeaders(),
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(payload)
        })
            .then(async (res) => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then((data) => {
                if (!ignore) setAiInsights(data);
            })
            .catch((err) => {
                if (!ignore) {
                    setAiError(
                        "AI insights are temporarily unavailable. Please try again later."
                    );
                    setAiInsights(null);
                }
            })
            .finally(() => {
                if (!ignore) setAiLoading(false);
            });

        return () => {
            ignore = true;
        };
    }, [career, id]);

    const matchScore = career?.match_score;
    const hasMatch = career?.is_authenticated && typeof matchScore === 'number';
    const matched = Array.isArray(career?.matched_skills) ? career.matched_skills : [];
    const missing = Array.isArray(career?.missing_skills) ? career.missing_skills : [];
    const description =
        career?.description?.trim() ||
        'No description is available for this role yet. Explore required skills and your match below.';

    if (loading) {
        return (
            <div className="dashboard career-details-page">
                <div className="career-details-loading">
                    <Loader2 size={40} className="career-details-loader-icon" style={{ color: 'var(--primary)' }} />
                    <p>Loading career details…</p>
                </div>
            </div>
        );
    }

    if (error || !career) {
        return (
            <div className="dashboard career-details-page">
                <div className="career-details-error">
                    <AlertCircle size={40} style={{ color: 'var(--destructive)' }} />
                    <h2 className="page-title" style={{ marginTop: '1rem' }}>
                        {error || 'Something went wrong'}
                    </h2>
                    <p>Check the link or try again from career recommendations.</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Button variant="outline" onClick={() => navigate(-1)}>
                            Go back
                        </Button>
                        <Button onClick={() => navigate('/career-recommendations')}>Browse careers</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard career-details-page">
            <div className="career-details-back">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ gap: '0.35rem' }}>
                    <ArrowLeft size={18} />
                    Back
                </Button>
            </div>

            <section className="career-details-hero">
                <Card className="intel-card-elevated">
                    <div className="career-details-hero-grid">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <Briefcase size={22} style={{ color: 'var(--primary)' }} />
                                <span className="career-details-chip career-details-chip--cat">{career.category}</span>
                            </div>
                            <h1 className="page-title" style={{ marginBottom: '0.35rem' }}>
                                {career.name}
                            </h1>
                            <div className="career-details-meta">
                                <span className="career-details-chip">Role ID · {career.id}</span>
                                {hasMatch ? (
                                    <span className="career-details-chip career-details-chip--cat">
                                        Personalized match
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        {hasMatch ? (
                            <div className="career-details-score-card">
                                <div className="career-details-score-label">Readiness</div>
                                <div>
                                    <span className="career-details-score-value">{matchScore}</span>
                                    <span className="career-details-score-suffix">%</span>
                                </div>
                                <div className="career-details-score-hint">Weighted skill alignment</div>
                                <div className="career-details-match-bar">
                                    <div
                                        className="career-details-match-bar-fill"
                                        style={{ width: `${Math.min(100, Math.max(0, matchScore))}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="career-details-score-card">
                                <div className="career-details-score-label">Match</div>
                                <div className="career-details-score-hint" style={{ marginTop: 0 }}>
                                    Sign in and add skills to see your match for this role.
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </section>

            {/* ------ AI Insights Card ------ */}
            {hasMatch && (
                <div style={{ margin: '1.25rem 0 1.5rem 0' }}>
                    <Card
                        title={
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                                AI Career Insights
                            </span>
                        }
                        subtitle="Personalized perspective powered by AI"
                        className="intel-card-elevated"
                    >
                        {aiLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: 60 }}>
                                <Loader2 size={24} className="spin" style={{ color: 'var(--primary)' }} />
                                <span>Generating insights…</span>
                            </div>
                        ) : aiError ? (
                            <div style={{ color: 'var(--muted-foreground)', minHeight: 48 }}>{aiError}</div>
                        ) : aiInsights ? (
                            <div className="ai-career-insight-list">
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Suitability:</span>
                                    <span className="ai-career-insight-value">{aiInsights.suitability || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Top Strength:</span>
                                    <span className="ai-career-insight-value">{aiInsights.strongest_area || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Key Gap:</span>
                                    <span className="ai-career-insight-value">{aiInsights.biggest_gap || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Recommendation:</span>
                                    <span className="ai-career-insight-value">{aiInsights.recommendation || "—"}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: 'var(--muted-foreground)', minHeight: 40 }}>
                                AI insights could not be loaded.
                            </div>
                        )}
                    </Card>
                </div>
            )}

            <div className="career-details-grid" style={{ marginBottom: '1.5rem' }}>
                <Card title="Overview" subtitle="Role summary" className="intel-card-elevated">
                    <p className="career-details-desc">{description}</p>
                </Card>
                {hasMatch ? (
                    <Card title="Match analytics" subtitle="Your profile vs. this role" className="intel-card-elevated">
                        <div className="stat-label" style={{ marginBottom: '0.25rem' }}>
                            Match score
                        </div>
                        <div className="stat-value-row" style={{ marginTop: 0 }}>
                            <span className="stat-value">{matchScore}%</span>
                            <span className="stat-change" style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                Weighted alignment
                            </span>
                        </div>
                        <div className="progress-bar-bg" style={{ marginTop: '1rem' }}>
                            <div
                                className="progress-bar-fill"
                                style={{ width: `${Math.min(100, Math.max(0, matchScore))}%` }}
                            />
                        </div>
                    </Card>
                ) : (
                    <Card title="Match analytics" className="intel-card-elevated">
                        <p className="career-details-desc">
                            Log in with an account that has skills saved to see match percentage and readiness for
                            this career.
                        </p>
                    </Card>
                )}
            </div>

            <div className="career-details-grid">
                <Card title="Matched skills" subtitle="Skills you already have for this role" className="intel-card-elevated">
                    {matched.length === 0 ? (
                        <p className="career-details-desc" style={{ margin: 0 }}>
                            No overlapping skills yet. Add skills to your profile or upload a resume.
                        </p>
                    ) : (
                        <div className="career-details-tag-row">
                            {matched.map((name) => (
                                <span key={name} className="intel-tag intel-tag-matched">
                                    {name}
                                </span>
                            ))}
                        </div>
                    )}
                </Card>
                <Card title="Missing skills" subtitle="Skills to build for this role" className="intel-card-elevated">
                    {missing.length === 0 ? (
                        <p className="career-details-desc" style={{ margin: 0 }}>
                            You cover all mapped skills for this role — outstanding alignment.
                        </p>
                    ) : (
                        <div className="career-details-tag-row">
                            {missing.map((name) => (
                                <span key={name} className="intel-tag intel-tag-missing-tech">
                                    {name}
                                </span>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {Array.isArray(career.required_skills) && career.required_skills.length > 0 ? (
                <div className="career-details-skill-map-wrap">
                    <Card title="Role skill map" subtitle="Required skills (by priority)" className="intel-card-elevated">
                        <div className="career-details-tag-row">
                            {career.required_skills.map((s) => (
                                <span
                                    key={s.id}
                                    className="intel-tag intel-tag-missing-soft"
                                    title={`Priority ${s.priority}`}
                                >
                                    {s.name}
                                    <span style={{ opacity: 0.75, marginLeft: '0.25rem', fontSize: '0.7rem' }}>
                                        · {s.priority}
                                    </span>
                                </span>
                            ))}
                        </div>
                    </Card>
                </div>
            ) : null}

            <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Button variant="outline" onClick={() => navigate('/skill-gap')}>
                    <Target size={18} style={{ marginRight: '0.35rem' }} />
                    Skill gap
                </Button>
                <Button onClick={() => navigate('/career-recommendations')}>More careers</Button>
            </div>
        </div>
    );
};

export default CareerDetails;
