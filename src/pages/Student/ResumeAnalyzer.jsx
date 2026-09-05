import React, { useState, useEffect } from 'react';
import { Upload, FileText, RefreshCcw, Sparkles } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import './ResumeAnalyzer.css';
import API_BASE from '../../config/api';

const ResumeAnalyzer = () => {
    const toast = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [careerSwitchPrompt, setCareerSwitchPrompt] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                // Fetch roles
                const rolesRes = await fetch(`${API_BASE}/roles`);
                const rolesData = await rolesRes.json();
                setRoles(rolesData);

                // Fetch user's target role
                const profileRes = await fetch(`${API_BASE}/user/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await profileRes.json();

                // Auto-select target role if exists
                if (profile.target_role_id) {
                    setSelectedRole(profile.target_role_id);
                } else if (rolesData.length > 0) {
                    setSelectedRole(rolesData[0].id);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    const handleUpload = async (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedRole) {
            toast.error("Please select a target career first.");
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await fetch(
                `${API_BASE}/resume/analyze/${selectedRole}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    },
                    body: formData
                }
            );

            const data = await res.json();
            setAnalysis(data);
            setCareerSwitchPrompt(false);

        } catch (err) {
            console.error(err);
        }

        setIsUploading(false);
    };

    const handleCareerChange = (e) => {
        const next = e.target.value;
        const hadAnalysis = analysis !== null;
        setSelectedRole(next);
        setCareerSwitchPrompt(hadAnalysis);
        setAnalysis(null);
    };

    // Section headings (bold)
    const sectionTitleStyle = {
        fontWeight: 700,
        fontSize: '1.05rem',
        marginBottom: 16,
        color: 'var(--card-foreground)',
        letterSpacing: '-0.01rem',
        lineHeight: 1.35
    };

    // Body / descriptions
    const subTextStyle = {
        fontWeight: 400,
        color: 'var(--muted-foreground)',
        fontSize: '0.94rem',
        marginBottom: 14,
        marginTop: 2,
        lineHeight: 1.65
    };

    // Form labels
    const formLabelStyle = {
        fontWeight: 500,
        fontSize: 13,
        color: 'var(--muted-foreground)',
        marginBottom: 8,
        display: 'block'
    };

    // Card padding — clean dashboard spacing
    const cardPadding = {
        padding: '2rem 1.75rem 1.85rem 1.75rem'
    };

    const analysisCardPadding = {
        padding: '1.75rem 1.65rem 1.65rem 1.65rem'
    };

    const sectionSpacing = {
        marginBottom: 36
    };

    const skillTagStyle = {
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: 6,
        fontWeight: 500,
        fontSize: 12,
        letterSpacing: '0.01em',
        margin: 0,
        boxSizing: 'border-box'
    };

    const tagWrapperStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 14,
        rowGap: 14,
        columnGap: 14,
        alignItems: 'center'
    };

    // Insight sorting order
    const insightOrder = {
        POSITIVE: 1,
        IMPROVEMENT: 2,
        WARNING: 3
    };

    // Semantic, theme-adaptive insight colors
    const insightTypeColors = {
        POSITIVE: {
            badgeBg: 'rgba(16, 185, 129, 0.15)',
            badgeColor: '#10b981',
            border: '3px solid #10b981',
            cardBg: 'rgba(16, 185, 129, 0.08)',
            cardTitle: '#10b981',
        },
        IMPROVEMENT: {
            badgeBg: 'rgba(245, 158, 11, 0.15)',
            badgeColor: '#f59e0b',
            border: '3px solid #f59e0b',
            cardBg: 'rgba(245, 158, 11, 0.08)',
            cardTitle: '#f59e0b',
        },
        WARNING: {
            badgeBg: 'rgba(239, 68, 68, 0.15)',
            badgeColor: '#ef4444',
            border: '3px solid #ef4444',
            cardBg: 'rgba(239, 68, 68, 0.08)',
            cardTitle: '#ef4444',
        }
    };

    const insightBadgeStyle = (type) => ({
        display: 'inline-block',
        minWidth: 0,
        lineHeight: 1,
        textAlign: 'center',
        padding: '4px 9px',
        fontWeight: 600,
        fontSize: '10.5px',
        textTransform: 'uppercase',
        borderRadius: 999,
        letterSpacing: '0.04em',
        marginRight: 8,
        background: insightTypeColors[type]?.badgeBg || 'var(--input)',
        color: insightTypeColors[type]?.badgeColor || 'var(--foreground)',
        border: 'none'
    });

    const readinessStatusPillBase = {
        display: 'inline-flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        borderRadius: 9999,
        padding: '5px 12px',
        letterSpacing: '0.01em',
        border: 'none',
        lineHeight: 1.35,
        fontSize: 12.5,
        fontWeight: 600,
        margin: 0,
        textAlign: 'left',
        boxSizing: 'border-box'
    };

    const readinessSummaryRowStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        width: '100%'
    };

    const readinessTextColumnStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 4,
        minWidth: 0,
        flex: '1 1 auto',
        margin: 0,
        padding: 0,
        width: '100%',
        boxSizing: 'border-box'
    };

    const readinessScoreLineStyle = {
        fontWeight: 400,
        fontSize: 13.25,
        color: 'var(--muted-foreground)',
        lineHeight: 1.45,
        margin: 0,
        padding: 0,
        width: '100%',
        textAlign: 'left',
        boxSizing: 'border-box'
    };

    return (
        <div className="resume-analyzer modern-dashboard" style={{ minHeight: '100vh' }}>
            {/* Header Section */}
            <div className="page-header dashboard-header" style={{ marginBottom: 32 }}>
                <h1
                    className="page-title"
                    style={{
                        fontWeight: 700,
                        fontSize: 26,
                        letterSpacing: '-0.02em',
                        marginBottom: 10,
                        color: 'var(--foreground)',
                        textAlign: 'center'
                    }}
                >
                    Resume ATS Analyzer
                </h1>
                <p className="page-subtitle" style={{ ...subTextStyle, marginLeft: 'auto', marginRight: 'auto', textAlign: 'center', maxWidth: 480, fontSize: '0.92rem', marginBottom: 0 }}>
                    Assess your resume’s readiness for your targeted role.<br />
                    Upload a PDF to receive AI-powered insights and a readiness score.
                </p>
            </div>

            <div className="analyzer-dashboard-grid" style={{ display: 'flex', gap: 28, alignItems: 'flex-start' }}>
                {/* Left Panel */}
                <div className="dashboard-left" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                    <Card className="dashboard-card upload-section" style={{ ...cardPadding, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: 16 }}>
                        {/* Target Career */}
                        <div style={{ ...sectionSpacing, marginBottom: 36 }}>
                            <div className="section-header" style={{ marginBottom: 8 }}>
                                <span className="section-title" style={sectionTitleStyle}>Target Career</span>
                            </div>
                            <div className="career-select-row" style={{ marginBottom: 0 }}>
                                <label
                                    htmlFor="career-dropdown"
                                    className="career-label"
                                    style={formLabelStyle}
                                >
                                    Select Target Career
                                </label>
                                <select
                                    id="career-dropdown"
                                    value={selectedRole}
                                    onChange={handleCareerChange}
                                    className="career-dropdown"
                                    style={{
                                        width: '100%',
                                        padding: '0.65rem 1rem',
                                        borderRadius: 8,
                                        fontSize: 14,
                                        outline: 'none',
                                    }}
                                >
                                    <option value="">-- Select Career --</option>
                                    {roles.map(role => (
                                        <option key={role.id} value={role.id}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Resume Upload */}
                        <div style={{ ...sectionSpacing, marginBottom: 36 }}>
                            <div className="section-header" style={{ marginBottom: 8 }}>
                                <span className="section-title" style={sectionTitleStyle}>Resume Upload</span>
                            </div>
                            {!analysis ? (
                                <div className="upload-area modern-upload-area" style={{ textAlign: 'center', padding: '2.2rem 0 1.7rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    {careerSwitchPrompt && selectedRole && (
                                        <p
                                            className="career-change-notice"
                                            style={{
                                                width: '100%',
                                                maxWidth: 400,
                                                marginBottom: 16,
                                                marginTop: 0,
                                                padding: '10px 12px',
                                                borderRadius: 8,
                                                background: 'var(--input)',
                                                border: '1px solid var(--border)',
                                                color: 'var(--muted-foreground)',
                                                fontSize: 13,
                                                fontWeight: 400,
                                                lineHeight: 1.5,
                                                textAlign: 'center'
                                            }}
                                        >
                                            Please re-upload your resume to analyze for this role.
                                        </p>
                                    )}
                                    <div className="upload-icon" style={{ marginBottom: 13 }}>
                                        {isUploading ? (
                                            <RefreshCcw className="spinning" size={48} />
                                        ) : (
                                            <Upload size={48} />
                                        )}
                                    </div>
                                    <h3 className="upload-heading" style={{ fontWeight: 600, fontSize: 18, marginBottom: 12, letterSpacing: '-0.01em', color: 'var(--card-foreground)', lineHeight: 1.35 }}>
                                        {isUploading ? 'Analyzing Resume...' : 'Upload your Resume'}
                                    </h3>
                                    <input
                                        type="file"
                                        hidden
                                        accept=".pdf"
                                        onChange={handleUpload}
                                    />
                                    <Button
                                        className="upload-btn"
                                        onClick={() => document.querySelector('input[type="file"]').click()}
                                        disabled={isUploading}
                                        style={{
                                            marginBottom: 13,
                                            fontWeight: 600,
                                            fontSize: 15,
                                            padding: '10px 28px'
                                        }}
                                    >
                                        Select PDF
                                    </Button>
                                    <p className="upload-hint" style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 400, marginTop: 3, marginBottom: 0, letterSpacing: '0.01em', lineHeight: 1.5 }}>
                                        PDF only • Max 5MB
                                    </p>
                                </div>
                            ) : (
                                <div className="resume-preview completed-area"
                                    style={{
                                        padding: '1.2rem 1.32rem',
                                        background: 'var(--input)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 14,
                                        marginBottom: 0,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}
                                >
                                    <div className="file-info" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <FileText size={26} style={{ color: 'var(--primary)' }} />
                                        <div>
                                            <h4 className="completed-title" style={{ fontWeight: 600, fontSize: 15, marginBottom: 4, color: 'var(--card-foreground)', letterSpacing: '-0.01em' }}>
                                                Analysis Complete
                                            </h4>
                                            <span className="completed-sub" style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 400, lineHeight: 1.45 }}>Role-based analysis completed</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setAnalysis(null);
                                            setCareerSwitchPrompt(false);
                                        }}
                                        style={{ fontWeight: 500, fontSize: 12, padding: '6px 14px', borderRadius: 6, height: 'auto' }}
                                    >
                                        Re-upload
                                    </Button>
                                </div>
                            )}
                        </div>

                        {analysis && (
                            <>
                                {/* Matched Skills */}
                                {analysis.matched_skills?.length > 0 && (
                                    <div style={{ ...sectionSpacing, marginBottom: 32 }}>
                                        <h4 className="skills-title matched-skills-title" style={{ ...sectionTitleStyle, marginBottom: 12, marginTop: 0 }}>
                                            Matched Role Skills
                                        </h4>
                                        <div className="tags-wrapper" style={tagWrapperStyle}>
                                            {analysis.matched_skills.map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="keyword-tag matched"
                                                    style={{
                                                        ...skillTagStyle,
                                                        background: 'rgba(16, 185, 129, 0.15)',
                                                        color: 'var(--success)',
                                                        border: '1px solid rgba(16, 185, 129, 0.3)'
                                                    }}
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {/* Missing Skills */}
                                {analysis.missing_skills?.length > 0 && (
                                    <div style={{ ...sectionSpacing, marginBottom: 0 }}>
                                        <h4 className="skills-title missing-skills-title" style={{ ...sectionTitleStyle, marginBottom: 12, marginTop: 0 }}>
                                            Missing Role Skills
                                        </h4>
                                        <div className="tags-wrapper" style={tagWrapperStyle}>
                                            {analysis.missing_skills.map((k, i) => (
                                                <span
                                                    key={i}
                                                    className="keyword-tag missing"
                                                    style={{
                                                        ...skillTagStyle,
                                                        background: 'rgba(245, 158, 11, 0.15)',
                                                        color: 'var(--warning)',
                                                        border: '1px solid rgba(245, 158, 11, 0.3)'
                                                    }}
                                                >
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>

                {/* Right Panel */}
                <div className="dashboard-right" style={{ flex: 2, minWidth: 0 }}>
                    <Card
                        title={
                            <div style={{
                                ...sectionTitleStyle,
                                fontSize: '1.02rem',
                                marginBottom: 0,
                                textAlign: 'left',
                                color: 'var(--card-foreground)'
                            }}>
                                Career Readiness Analysis
                            </div>
                        }
                        className={`dashboard-card analysis-section ${!analysis ? 'blurred' : ''}`}
                        style={{
                            ...analysisCardPadding,
                            minHeight: 560,
                            borderRadius: 16
                        }}
                    >
                        {analysis ? (
                            <div className="readiness-dashboard-details" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                                {/* Score ring + summary */}
                                <div
                                    className="score-and-summary-row"
                                    style={{
                                        marginBottom: 32,
                                        width: '100%'
                                    }}
                                >
                                    <div style={readinessSummaryRowStyle}>
                                        <div
                                            style={{
                                                position: 'relative',
                                                width: 82,
                                                height: 82,
                                                flexShrink: 0
                                            }}
                                        >
                                            <svg
                                                viewBox="0 0 36 36"
                                                className="circular-chart"
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'block'
                                                }}
                                                aria-hidden
                                            >
                                                <path
                                                    className="circle-bg"
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                    stroke="var(--border)"
                                                    strokeWidth="2.8"
                                                    fill="none"
                                                />
                                                <path
                                                    className="circle"
                                                    stroke="var(--primary)"
                                                    strokeWidth="2.8"
                                                    fill="none"
                                                    strokeLinecap="round"
                                                    strokeDasharray={`${analysis.final_readiness_score ? analysis.final_readiness_score.toFixed(1) : 0}, 100`}
                                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                />
                                            </svg>
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    pointerEvents: 'none',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        fontWeight: 700,
                                                        fontSize: 14,
                                                        color: 'var(--card-foreground)',
                                                        letterSpacing: '-0.02em',
                                                        lineHeight: 1.15
                                                    }}
                                                >
                                                    {analysis.final_readiness_score
                                                        ? `${analysis.final_readiness_score.toFixed(1)}%`
                                                        : '0%'}
                                                </span>
                                            </div>
                                        </div>
                                        <div
                                            className="readiness-score-text-block"
                                            style={readinessTextColumnStyle}
                                        >
                                            {analysis.final_readiness_score >= 75 ? (
                                                <span
                                                    className="readiness-label readiness-status-strong"
                                                    style={{
                                                        ...readinessStatusPillBase,
                                                        color: 'var(--success)',
                                                        background: 'rgba(16, 185, 129, 0.15)'
                                                    }}
                                                >
                                                    Strong Candidate
                                                </span>
                                            ) : analysis.final_readiness_score >= 50 ? (
                                                <span
                                                    className="readiness-label readiness-status-moderate"
                                                    style={{
                                                        ...readinessStatusPillBase,
                                                        color: 'var(--warning)',
                                                        background: 'rgba(245, 158, 11, 0.15)'
                                                    }}
                                                >
                                                    Moderate Readiness
                                                </span>
                                            ) : (
                                                <span
                                                    className="readiness-label readiness-status-needs"
                                                    style={{
                                                        ...readinessStatusPillBase,
                                                        color: 'var(--destructive)',
                                                        background: 'rgba(239, 68, 68, 0.15)'
                                                    }}
                                                >
                                                    Needs Improvement
                                                </span>
                                            )}
                                            <div style={readinessScoreLineStyle}>
                                                Skill Evidence:{' '}
                                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                    {analysis.resume_skill_evidence_score}%
                                                </span>
                                            </div>
                                            <div style={readinessScoreLineStyle}>
                                                Resume Quality:{' '}
                                                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                                    {analysis.resume_quality_score}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Insight */}
                                {analysis.ai_insight && (
                                    <div className="ai-insight-card" style={{
                                        background: 'var(--input)',
                                        borderRadius: 10,
                                        padding: '1rem 1.1rem',
                                        marginBottom: 26,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 8,
                                        border: '1px solid var(--border)'
                                    }}>
                                        <div className="ai-insight-header"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontWeight: 600,
                                                fontSize: 13.25,
                                                marginBottom: 0,
                                                color: 'var(--primary)'
                                            }}
                                        >
                                            <Sparkles size={17} strokeWidth={2} />
                                            <span>AI Career Advisor</span>
                                        </div>
                                        <p
                                            className="ai-insight-text"
                                            style={{
                                                ...subTextStyle,
                                                marginBottom: 0,
                                                marginTop: 0,
                                                color: 'var(--muted-foreground)',
                                                fontSize: 13.25,
                                                lineHeight: 1.65,
                                                maxWidth: '100%',
                                                fontWeight: 400
                                            }}
                                        >
                                            {analysis.ai_insight}
                                        </p>
                                    </div>
                                )}

                                {/* Insights */}
                                <div className="insights-section" style={{ width: '100%' }}>
                                    <h4 className="insights-header" style={{ ...sectionTitleStyle, marginBottom: 14, color: 'var(--card-foreground)' }}>
                                        Analysis Insights
                                    </h4>
                                    {analysis.insights && analysis.insights.length > 0 ? (
                                        <div
                                            className="resume-suggestions modern-grid-list"
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(3, 1fr)',
                                                gap: 16,
                                                alignItems: 'stretch',
                                                width: '100%'
                                            }}
                                        >
                                            {analysis.insights
                                                .slice()
                                                .sort((a, b) => {
                                                    const getOrder = (type) =>
                                                        insightOrder[type?.toUpperCase()] ||
                                                        (type?.toUpperCase() === "IMPROVEMENT" ? 2 : 999);
                                                    return getOrder(a.type) - getOrder(b.type);
                                                })
                                                .map((insight, index) => {
                                                    const typ = (insight.type || '').toUpperCase();
                                                    const colorStyles = insightTypeColors[typ] || {};
                                                    return (
                                                        <div
                                                            key={index}
                                                            className={`insight-card insight-${typ.toLowerCase()}`}
                                                            style={{
                                                                background: colorStyles.cardBg || 'var(--input)',
                                                                borderRadius: 12,
                                                                padding: '1rem 1rem 0.95rem',
                                                                boxShadow: 'none',
                                                                border: '1px solid var(--border)',
                                                                borderLeftWidth: '4px',
                                                                borderLeftColor: (colorStyles.border?.split(' ')[2]) || 'var(--border)',
                                                                borderLeftStyle: 'solid',
                                                                minWidth: 0,
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'flex-start',
                                                                alignItems: 'flex-start',
                                                                gap: 0,
                                                                marginBottom: 0,
                                                                height: '100%',
                                                            }}
                                                        >
                                                            <div
                                                                className="insight-header"
                                                                style={{
                                                                    display: 'flex',
                                                                    alignItems: 'flex-start',
                                                                    marginBottom: 6,
                                                                    gap: 6,
                                                                    flexWrap: 'wrap'
                                                                }}
                                                            >
                                                                <span
                                                                    className="insight-badge"
                                                                    style={insightBadgeStyle(typ)}
                                                                >
                                                                    {typ === 'POSITIVE' ? 'Positive'
                                                                        : typ === 'IMPROVEMENT' ? 'Improvement'
                                                                            : typ === 'WARNING' ? 'Warning'
                                                                                : typ}
                                                                </span>
                                                                <h4
                                                                    className="insight-title"
                                                                    style={{
                                                                        fontWeight: 600,
                                                                        fontSize: 14,
                                                                        marginBottom: 0,
                                                                        color: colorStyles.cardTitle || 'var(--card-foreground)',
                                                                        lineHeight: 1.4,
                                                                        letterSpacing: '-0.01em'
                                                                    }}
                                                                >
                                                                    {insight.title}
                                                                </h4>
                                                            </div>
                                                            <p
                                                                className="insight-message"
                                                                style={{
                                                                    ...subTextStyle,
                                                                    marginBottom: 0,
                                                                    marginTop: 4,
                                                                    color: 'var(--muted-foreground)',
                                                                    fontSize: 13.25,
                                                                    lineHeight: 1.6,
                                                                    minHeight: 0,
                                                                    fontWeight: 400
                                                                }}
                                                            >
                                                                {insight.description}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    ) : (
                                        <p className="no-insights-msg" style={{
                                            ...subTextStyle,
                                            marginTop: 10,
                                            lineHeight: 1.65,
                                            textAlign: 'center'
                                        }}>
                                            No improvement insights available.
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="awaiting-analysis" style={{
                                textAlign: 'center',
                                color: 'var(--muted-foreground)',
                                fontSize: 14,
                                padding: '2rem 0 1.25rem 0',
                                fontWeight: 400,
                                lineHeight: 1.6
                            }}>
                                <p style={{ margin: 0, lineHeight: 1.57 }}>Select a target career and upload your resume to get your career readiness analysis.</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ResumeAnalyzer;