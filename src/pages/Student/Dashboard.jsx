import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Target,
    CheckCircle2,
    CheckCircle,
    Circle,
    ArrowRight,
    ChevronRight,
    Sparkles,
    Zap,
    BarChart3
} from 'lucide-react';

import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import './Dashboard.css';
import API_BASE from '../../config/api';

const authHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
});

function getReadinessStatus(score, hasGap) {
    if (!hasGap) return { label: 'Awaiting analysis', tone: 'muted' };
    if (score < 40) return { label: 'Needs Improvement', tone: 'bad' };
    if (score <= 70) return { label: 'Improving', tone: 'mid' };
    return { label: 'Strong', tone: 'good' };
}

function getMissingSkillNames(gap) {
    if (!gap) return [];
    const tech = (gap.technical_gaps || []).map((g) => g.name);
    const soft = (gap.soft_skill_gaps || []).map((g) => g.name);
    return [...tech, ...soft];
}

function getTopMissingSkills(gap) {
    return getMissingSkillNames(gap).slice(0, 3);
}

function hasRoadmapForTarget(roadmaps, targetRole) {
    if (!targetRole?.name || !Array.isArray(roadmaps) || roadmaps.length === 0) return false;
    return roadmaps.some((r) => r.career === targetRole.name);
}

const Dashboard = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [skills, setSkills] = useState([]);
    const [stats, setStats] = useState(null);
    const [targetRole, setTargetRole] = useState(null);
    const [gap, setGap] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [roadmaps, setRoadmaps] = useState([]);

    useEffect(() => {
        let cancelled = false;

        const loadDashboard = async () => {
            setLoading(true);
            const headers = authHeaders();

            try {
                const [profileRes, skillsRes, statsRes, targetRes, recommendRes] = await Promise.all([
                    fetch(`${API_BASE}/user/profile`, { headers }),
                    fetch(`${API_BASE}/skills`, { headers }),
                    fetch(`${API_BASE}/dashboard/stats`, { headers }),
                    fetch(`${API_BASE}/user/target-role`, { headers }),
                    fetch(`${API_BASE}/career/recommend`, { headers })
                ]);

                const profileData = profileRes.ok ? await profileRes.json() : null;
                const skillsData = skillsRes.ok ? await skillsRes.json() : [];
                const statsData = statsRes.ok ? await statsRes.json() : null;
                const targetData = targetRes.ok ? await targetRes.json() : null;
                const recommendData = recommendRes.ok ? await recommendRes.json() : { recommendations: [] };

                let roadmapsData = [];
                try {
                    const roadmapsRes = await fetch(`${API_BASE}/roadmap/all`, { headers });
                    if (roadmapsRes.ok) {
                        roadmapsData = await roadmapsRes.json();
                    }
                } catch (rmErr) {
                    console.error('Roadmap list fetch error:', rmErr);
                }

                if (cancelled) return;

                setUser(profileData);
                console.log("Dashboard User:", profileData);
                setSkills(skillsData || []);
                console.log("Dashboard Skills:", skillsData);
                setStats(statsData);

                let role = null;
                if (targetData?.id != null) {
                    role = { id: targetData.id, name: targetData.name };
                }
                setTargetRole(role);

                let gapResult = null;
                if (role?.id != null) {
                    const gapRes = await fetch(`${API_BASE}/career/gap/${role.id}`, { headers });
                    if (gapRes.ok) {
                        gapResult = await gapRes.json();
                    }
                }
                if (!cancelled) setGap(gapResult);

                setRecommendations(recommendData.recommendations || []);
                setRoadmaps(Array.isArray(roadmapsData) ? roadmapsData : []);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadDashboard();
        return () => {
            cancelled = true;
        };
    }, []);

    const hasResume = (stats?.total_scans ?? 0) > 0;
    const hasGap = gap != null;
    const hasRoadmap = hasRoadmapForTarget(roadmaps, targetRole);
    // Checklist progress
    const hasSkills = skills.length > 0;
    const hasTargetRole = !!user?.target_role;

    // User state detection
    const skillsCount = skills.length;
    const userState = skillsCount === 0 ? 'new' : !hasTargetRole ? 'hasSkills' : 'full';

    const careerReadinessScore = gap?.score ?? 0;
    const statusMeta = useMemo(
        () => getReadinessStatus(careerReadinessScore, hasGap),
        [careerReadinessScore, hasGap]
    );

    const topMissing = useMemo(() => getTopMissingSkills(gap), [gap]);
    const matchedSkills = gap?.matched_skills || [];
    const technicalGaps = gap?.technical_gaps || [];
    const softGaps = gap?.soft_skill_gaps || [];

    const hasSkillTags =
        matchedSkills.length > 0 || technicalGaps.length > 0 || softGaps.length > 0;

    const primaryAction = useMemo(() => {
        // STATE 1: New user (no skills) - guide to complete profile
        if (userState === 'new') {
            return {
                key: 'profile',
                title: 'Complete Your Profile',
                detail: 'Add your skills to get personalized career recommendations and gap analysis.',
                path: '/profile',
                cta: 'Complete Profile'
            };
        }
        // STATE 2: Has skills, no target role - explore careers
        if (userState === 'hasSkills') {
            return {
                key: 'explore',
                title: 'Explore Careers',
                detail: 'Set a target role to see skill gaps and personalized learning paths.',
                path: '/career-recommendations',
                cta: 'Explore Careers'
            };
        }
        // STATE 3: Full data - follow normal flow
        if (!hasResume) {
            return {
                key: 'resume',
                title: 'Upload Resume',
                detail: 'Add your resume so we can extract skills and align you with target roles.',
                path: '/resume-analyzer',
                cta: 'Upload Resume'
            };
        }
        if (!hasGap) {
            return {
                key: 'gap',
                title: 'Analyze Skills',
                detail: 'Open the skill gap view for your target role and see what to learn next.',
                path: '/skill-gap',
                cta: 'Analyze Skills'
            };
        }
        if (!hasRoadmap) {
            return {
                key: 'roadmap',
                title: 'Generate Learning Path',
                detail: 'Turn your gap analysis into a step-by-step learning roadmap.',
                path: '/learning-path',
                cta: 'Generate Roadmap'
            };
        }
        return {
            key: 'continue',
            title: 'Continue Learning Path',
            detail: 'Resume your personalized roadmap and track progress.',
            path: '/learning-path',
            cta: 'Continue Learning Path'
        };
    }, [userState, hasResume, hasGap, hasRoadmap]);

    if (loading) {
        return (
            <div className="dashboard intelligence-dashboard">
                <div className="page-header intel-page-header">
                    <h1 className="page-title intel-page-title">
                        Welcome back
                    </h1>
                    <p className="page-subtitle intel-page-sub">
                        AI-powered snapshot of your role fit, gaps, and next steps.
                    </p>
                </div>
                <Loader message="Loading your career dashboard..." size="lg" />
            </div>
        );
    }

    return (
        <div className="dashboard intelligence-dashboard">

            <div className="dashboard-header intel-page-header">
                <div>
                    <h1 className="page-title intel-page-title">
                        Welcome back, {user?.first_name || 'User'}
                    </h1>
                    <p className="page-subtitle intel-page-sub">
                        AI-powered snapshot of your role fit, gaps, and next steps.
                    </p>
                </div>

                <Button size="lg" className="intel-header-cta" onClick={() => navigate('/resume-analyzer')}>
                    <Zap size={18} />
                    Analyze Resume
                    <ArrowRight size={18} />
                </Button>
            </div>

            {/* Hero */}
            <section className="intel-hero" aria-label="Career readiness overview">
                <div className="intel-hero-glow" aria-hidden />
                <div className="intel-hero-inner">
                    <div className="intel-hero-top">
                        <span className="intel-hero-badge">
                            <Sparkles size={14} />
                            Career intelligence
                        </span>
                    </div>

                    {/* STATE 1: New User - No skills */}
                    {userState === 'new' ? (
                        <div className="intel-hero-empty">
                            <div className="intel-hero-empty-icon">
                                <Target size={36} strokeWidth={1.5} />
                            </div>
                            <h2 className="intel-hero-empty-title">Set up your profile to get started</h2>
                            <p className="intel-hero-empty-desc">
                                Add your skills in Resume Analyzer to discover career matches and see your readiness for different roles.
                            </p>
                            <div className="intel-hero-empty-actions">
                                <Button onClick={() => navigate('/profile')}>Complete Profile</Button>
                                <Button variant="outline" onClick={() => navigate('/career-recommendations')}>
                                    Browse careers
                                </Button>
                            </div>
                        </div>
                    ) : /* STATE 2: Has skills, no target role */
                    userState === 'hasSkills' ? (
                        <div className="intel-hero-empty">
                            <div className="intel-hero-empty-icon">
                                <Target size={36} strokeWidth={1.5} />
                            </div>
                            <h2 className="intel-hero-empty-title">Select a target role to analyze your fit</h2>
                            <p className="intel-hero-empty-desc">
                                You have {skillsCount} skills. Choose a role to see gaps, readiness score, and personalized recommendations.
                            </p>
                            <div className="intel-hero-empty-actions">
                                <Button onClick={() => navigate('/resume-analyzer')}>Choose role &amp; analyze</Button>
                                <Button variant="outline" onClick={() => navigate('/career-recommendations')}>
                                    Explore Careers
                                </Button>
                            </div>
                        </div>
                    ) : /* STATE 3: Full data */
                    hasTargetRole ? (
                        <div className="intel-hero-main">
                            <div className="intel-hero-primary">
                                <p className="intel-hero-label">Target role</p>
                                <h2 className="intel-hero-role">{targetRole.name}</h2>
                                <p className="intel-hero-sub">
                                    {hasGap ? `Based on ${targetRole.name} requirements` : 'Analysis pending for this role'}
                                </p>
                            </div>
                            <div className="intel-hero-score-block">
                                <p className="intel-hero-label">Career readiness</p>
                                <div className="intel-hero-score-row">
                                    <span className="intel-hero-score-value">
                                        {hasGap ? `${careerReadinessScore}%` : '—'}
                                    </span>
                                </div>
                                <div
                                    className={`intel-status-pill intel-status-${statusMeta.tone} intel-hero-status`}
                                >
                                    {statusMeta.label}
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </section>

            <div className="intel-main-grid">
                <div className="intel-main-col">
                    <Card
                        title="Skill overview"
                        subtitle="What you already bring vs. what the role asks for"
                        className="intel-gap-card intel-card-elevated"
                        headerAction={
                            <div className="intel-card-icon-wrap">
                                <BarChart3 size={20} />
                            </div>
                        }
                    >
                        {/* STATE 1: New User - No skills */}
                        {userState === 'new' ? (
                            <div className="intel-insight-placeholder">
                                <p className="intel-insight-placeholder-text">
                                    No skills added yet. Add your skills to see career matches and readiness analysis.
                                </p>
                                <div className="intel-insight-placeholder-actions">
                                    <Button size="sm" onClick={() => navigate('/resume-analyzer')}>
                                        Add Skills
                                    </Button>
                                </div>
                            </div>
                        ) : /* STATE 2: Has skills, no target role */
                        userState === 'hasSkills' ? (
                            <div className="intel-insight-placeholder">
                                <p className="intel-insight-placeholder-text">
                                    You have {skillsCount} skills. Select a target role to see gap analysis.
                                </p>
                                <div className="intel-insight-placeholder-actions">
                                    <Button size="sm" onClick={() => navigate('/career-recommendations')}>
                                        Explore Careers
                                    </Button>
                                </div>
                            </div>
                        ) : /* STATE 3: Full data */
                        !hasSkillTags ? (
                            <div className="intel-insight-placeholder">
                                <p className="intel-insight-placeholder-text">
                                    Upload resume or analyze skills to see insights.
                                </p>
                                <div className="intel-insight-placeholder-actions">
                                    <Button size="sm" variant="outline" onClick={() => navigate('/resume-analyzer')}>
                                        Upload resume
                                    </Button>
                                    <Button size="sm" onClick={() => navigate(`/skill-gap?roleId=${targetRole?.id}`)}>
                                        Analyze skills
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="intel-gap-section">
                                    <h4 className="intel-gap-heading">
                                        <span className="intel-gap-dot intel-gap-dot--match" />
                                        ✅ Matched skills
                                    </h4>
                                    <div className="intel-tag-row">
                                        {matchedSkills.map((name) => (
                                            <span key={name} className="intel-tag intel-tag-matched">
                                                {name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="intel-gap-section intel-gap-section--border">
                                   <h4 className="intel-gap-heading">
                                        <span className="intel-gap-dot intel-gap-dot--miss" />
                                        ⚠ Missing skills
                                    </h4>
                                    <div className="intel-tag-row">
                                        {technicalGaps.map((g) => (
                                            <span key={`t-${g.name}`} className="intel-tag intel-tag-missing-tech">
                                                {g.name}
                                            </span>
                                        ))}
                                        {softGaps.map((g) => (
                                            <span key={`s-${g.name}`} className="intel-tag intel-tag-missing-soft">
                                                {g.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </Card>

                    <Card title="Priority focus" className="intel-focus-card intel-card-elevated">
                        {userState === 'new' ? (
                            <div className="intel-focus-great">
                                <Sparkles className="intel-focus-sparkle" size={24} />
                                <p className="intel-focus-lead">
                                    Add your skills to get personalized priority recommendations.
                                </p>
                            </div>
                        ) : userState === 'hasSkills' ? (
                            <div className="intel-focus-great">
                                <Target className="intel-focus-check" size={24} />
                                <p className="intel-focus-lead">
                                    Select a target role to see your priority skills to develop.
                                </p>
                            </div>
                        ) : topMissing.length > 0 ? (
                            <div className="intel-focus-positive">
                                <Sparkles className="intel-focus-sparkle" size={22} />
                                <p className="intel-focus-lead">
                                    🎯 Focus next:{' '}
                                    <span className="intel-focus-skills">
                                        {topMissing.join(', ')}
                                    </span>
                                </p>
                            </div>
                        ) : (
                            <div className="intel-focus-great">
                                <CheckCircle2 className="intel-focus-check" size={24} />
                                <p className="intel-focus-lead">
                                    {hasGap
                                        ? "🚀 You're almost job-ready for this role! Keep improving."
                                        : 'Set up your role and skills to see personalized priorities.'}
                                </p>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="intel-side-col">
                    <Card className="intel-action-card intel-action-card--prominent">
                        <div className="intel-action-card-head">
                            <span className="intel-action-chip">Next step</span>
                            <h3 className="intel-primary-title">{primaryAction.title}</h3>
                            <p className="intel-primary-detail">{primaryAction.detail}</p>
                        </div>
                        <Button
                            size="lg"
                            className="intel-primary-cta"
                            onClick={() => navigate(primaryAction.path)}
                        >
                            {primaryAction.cta}
                            <ChevronRight size={20} />
                        </Button>
                        <ul className="intel-task-hints">
                            <li className={hasSkills ? 'done' : ''}>
                                {hasSkills ? <CheckCircle size={16} /> : <Circle size={16} />}
                                Add skills to profile
                            </li>
                            <li className={hasTargetRole ? 'done' : ''}>
                                {hasTargetRole ? <CheckCircle size={16} /> : <Circle size={16} />}
                                Select target role
                            </li>
                        </ul>
                    </Card>

                    <div className="section-title-row intel-rec-heading">
                        <h3 className="intel-section-heading">Recommended careers</h3>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/career-recommendations')}>
                            View all
                        </Button>
                    </div>

                    <div className="career-cards-grid intel-rec-grid">
                        {recommendations.length === 0 ? (
                            <Card className="career-card intel-card-elevated">
                                <p className="career-desc" style={{ margin: 0 }}>
                                    No recommendations yet. Add skills to your profile to discover strong role matches.
                                </p>
                            </Card>
                        ) : (
                            recommendations.slice(0, 2).map((rec) => {
                                const tag = rec.score >= 70 ? 'Recommended' : 'Suggested';
                                const tagClass = rec.score >= 70 ? 'high' : 'med';
                                return (
                                    <Card
                                        key={rec.role_id}
                                        className="career-card intel-card-elevated intel-rec-card"
                                        title={rec.career}
                                    >
                                        <div className="intel-rec-match">
                                            <span className="intel-rec-match-label">Match score</span>
                                            <span className="intel-rec-match-value">{rec.score}%</span>
                                            <div className="intel-rec-bar">
                                                <div 
                                                    className="intel-rec-bar-fill"
                                                    style={{ width: `${rec.score}%` }}
                                                />
                                                </div>
                                        </div>
                                        <p className="career-desc intel-rec-desc">
                                            Based on your current skill profile alignment.
                                        </p>
                                        <div className="intel-rec-footer">
                                            <span className={`match-tag ${tagClass}`}>{tag}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="intel-rec-gap-btn"
                                                onClick={() => navigate(`/skill-gap?roleId=${rec.role_id}`)}
                                            >
                                                View Skill Gap
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
