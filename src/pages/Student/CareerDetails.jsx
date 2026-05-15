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

        // Call backend endpoint for AI insight
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

    // ----- DATA SELECT/COMPUTED -----
    const matchScore = career?.match_score;
    const hasMatch = career?.is_authenticated && typeof matchScore === 'number';
    const matched = Array.isArray(career?.matched_skills) ? career.matched_skills : [];
    const missing = Array.isArray(career?.missing_skills) ? career.missing_skills : [];
    const description =
        career?.description?.trim() ||
        'No description available for this role yet.';

    // Advanced polished fallback states
    const EmptyMatchedSkills = () => (
        <div className="career-details-empty-state">
            <div className="empty-circle-score empty-matched">
                <Target size={24} />
            </div>
            <div>
                <div className="empty-label">No skills matched yet</div>
                <div className="empty-desc">Add skills to your profile or upload your resume to discover overlap.</div>
            </div>
        </div>
    );

    const EmptyMissingSkills = () => (
        <div className="career-details-empty-state">
            <div className="empty-circle-score empty-missing">
                <Sparkles size={20} />
            </div>
            <div>
                <div className="empty-label">Outstanding alignment!</div>
                <div className="empty-desc">You cover all currently mapped skills for this role.</div>
            </div>
        </div>
    );

    const EmptyAnalytics = () => (
        <div className="career-details-empty-state" style={{ minHeight: 90 }}>
            <div className="empty-circle-score">
                <AlertCircle size={24} />
            </div>
            <div>
                <div className="empty-label">No analytics yet</div>
                <div className="empty-desc">
                    Sign in and add skills to view personalized analysis for this career.
                </div>
            </div>
        </div>
    );

    const EmptyAIInsights = ({ message }) => (
        <div className="career-details-empty-state" style={{ minHeight: 64 }}>
            <div className="empty-circle-score" style={{ background: 'var(--muted)' }}>
                <Sparkles size={18} style={{ color: 'var(--muted-foreground)' }}/>
            </div>
            <div>
                <div className="empty-label" style={{ color: 'var(--muted-foreground)' }}>
                    {message || "AI insights unavailable."}
                </div>
            </div>
        </div>
    );

    // ----- RENDER -----
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
                        {error || 'Could not load career'}
                    </h2>
                    <p style={{ marginBottom: 12 }}>Check your link or try browsing careers.</p>
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

            {/* NAV BACK */}
            <div className="career-details-back">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ gap: '0.35rem' }}>
                    <ArrowLeft size={18} />
                    Back
                </Button>
            </div>

            {/* HERO */}
            <section className="career-details-hero">
                <Card className="intel-card-elevated">
                    <div className="career-details-hero-grid">
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                                <Briefcase size={22} style={{ color: 'var(--primary)' }} />
                                <span className="career-details-chip career-details-chip--cat">{career.category || "Uncategorized"}</span>
                            </div>
                            <h1 className="page-title" style={{ marginBottom: '0.35rem' }}>
                                {career.name}
                            </h1>
                            <div className="career-details-meta" style={{ marginBottom: 2 }}>
                                <span className="career-details-chip">Role ID · {career.id}</span>
                                {hasMatch ? (
                                    <span className="career-details-chip career-details-chip--cat">
                                        Personalized match
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        {/* Match Score Card */}
                        {hasMatch ? (
                            <div className="career-details-score-card">
                                <div className="career-details-score-label">Readiness</div>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                                    <span className="career-details-score-value">{matchScore != null ? Math.round(matchScore) : '--'}</span>
                                    <span className="career-details-score-suffix">%</span>
                                </div>
                                <div className="career-details-score-hint">Weighted skill alignment</div>
                                <div className="career-details-match-bar" style={{ marginTop: 10 }}>
                                    <div
                                        className="career-details-match-bar-fill"
                                        style={{ width: `${Math.min(100, Math.max(0, matchScore || 0))}%` }}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="career-details-score-card">
                                <div className="career-details-score-label">Readiness</div>
                                <div className="career-details-score-hint" style={{ marginTop: 4, color: 'var(--muted-foreground)' }}>
                                    <span>Sign in &amp; add skills to view your personalized readiness.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </section>

            {/* ------ AI Insights Card ------ */}
            <div style={{ margin: hasMatch ? '1.25rem 0 1.5rem 0' : '1.5rem 0 1rem 0' }}>
                <Card
                    title={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Sparkles size={20} style={{ color: 'var(--primary)' }} />
                            AI Career Insights
                        </span>
                    }
                    subtitle={hasMatch ? "Personalized perspective powered by AI" : "View tailored insights after login"}
                    className="intel-card-elevated"
                >
                    {hasMatch ? (
                        aiLoading ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minHeight: 64 }}>
                                <Loader2 size={24} className="spin" style={{ color: 'var(--primary)' }} />
                                <span>Analyzing your profile…</span>
                            </div>
                        ) : aiError ? (
                            <EmptyAIInsights message={aiError} />
                        ) : aiInsights ? (
                            <div className="ai-career-insight-list" style={{ minHeight: 64 }}>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Suitability</span>
                                    <span className="ai-career-insight-value">{aiInsights.suitability || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Top strength</span>
                                    <span className="ai-career-insight-value">{aiInsights.strongest_area || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">Key gap</span>
                                    <span className="ai-career-insight-value">{aiInsights.biggest_gap || "—"}</span>
                                </div>
                                <div className="ai-career-insight-pair">
                                    <span className="ai-career-insight-label">AI recommendation</span>
                                    <span className="ai-career-insight-value">{aiInsights.recommendation || "—"}</span>
                                </div>
                            </div>
                        ) : (
                            <EmptyAIInsights message={"AI insights not available."} />
                        )
                    ) : (
                        <EmptyAIInsights message="Sign in and add skills to unlock personalized AI insights." />
                    )}
                </Card>
            </div>

            {/* DETAILS GRID: Overview / Analytics */}
            <div className="career-details-grid" style={{ marginBottom: '1.5rem' }}>
                <Card title="Overview" subtitle="Role summary" className="intel-card-elevated">
                    <div className="career-details-desc">
                        {description.length === 0 ? (
                            <span style={{ color: 'var(--muted-foreground)' }}>No description has been added for this role yet.</span>
                        ) : (
                            description
                        )}
                    </div>
                </Card>

                <Card title="Match analytics" subtitle={hasMatch ? "Your profile × this role" : undefined} className="intel-card-elevated">
                    {hasMatch ? (
                        <React.Fragment>
                            <div className="stat-label" style={{ marginBottom: '0.25rem' }}>
                                Readiness percentage
                            </div>
                            <div className="stat-value-row">
                                <span className="stat-value">{matchScore != null ? Math.round(matchScore) : '--'}%</span>
                                <span className="stat-change" style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                                    Weighted skill alignment
                                </span>
                            </div>
                            <div className="progress-bar-bg" style={{ marginTop: '1rem' }}>
                                <div
                                    className="progress-bar-fill"
                                    style={{ width: `${Math.min(100, Math.max(0, matchScore || 0))}%` }}
                                />
                            </div>
                        </React.Fragment>
                    ) : (
                        <EmptyAnalytics />
                    )}
                </Card>
            </div>

            {/* SKILL MATCHING */}
            <div className="career-details-grid">
                <Card
                    title="Matched skills"
                    subtitle="Skills you already have that align with this role"
                    className="intel-card-elevated"
                >
                    {hasMatch ? (
                        matched.length === 0 ? (
                            <EmptyMatchedSkills />
                        ) : (
                            <div className="career-details-tag-row">
                                {matched.map((name) => (
                                    <span key={name} className="intel-tag intel-tag-matched">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        )
                    ) : (
                        <div style={{ color: 'var(--muted-foreground)', fontSize: 15, minHeight: 32 }}>
                            Sign in and add skills to visualize matched skills for this career.
                        </div>
                    )}
                </Card>
                <Card
                    title="Missing skills"
                    subtitle="Skills recommended to build for this role"
                    className="intel-card-elevated"
                >
                    {hasMatch ? (
                        missing.length === 0 ? (
                            <EmptyMissingSkills />
                        ) : (
                            <div className="career-details-tag-row">
                                {missing.map((name) => (
                                    <span key={name} className="intel-tag intel-tag-missing-tech">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        )
                    ) : (
                        <div style={{ color: 'var(--muted-foreground)', fontSize: 15, minHeight: 32 }}>
                            Sign in and add skills to review your biggest skill gaps for this role.
                        </div>
                    )}
                </Card>
            </div>

            {/* REQUIRED SKILL MAP */}
            {Array.isArray(career.required_skills) && career.required_skills.length > 0 ? (
                <div className="career-details-skill-map-wrap">
                    <Card title="Role skill map" subtitle="Required skills (priority order)" className="intel-card-elevated">
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

            {/* ACTIONS */}
            <div style={{
                marginTop: '1.75rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap'
            }}>
                <Button
                    variant="outline"
                    onClick={() => navigate('/skill-gap')}
                >
                    <Target size={18} style={{ marginRight: '0.35rem' }} />
                    Skill gap
                </Button>
                <Button onClick={() => navigate('/career-recommendations')}>More careers</Button>
            </div>
        </div>
    );
};

export default CareerDetails;
