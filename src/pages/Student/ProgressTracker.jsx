import React, { useState, useEffect } from 'react';
import {
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Award, Target, TrendingUp, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Loader from '../../components/ui/Loader';
import './ProgressTracker.css';

const BASE_URL = "https://careerintel-w10f.onrender.com";

// Colors for charts
const COLORS = {
    matched: '#22c55e',
    missing: '#f59e0b',
    primary: '#4f46e5',
    secondary: '#8b5cf6'
};

const ProgressTracker = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Data states
    const [profile, setProfile] = useState(null);
    const [userSkills, setUserSkills] = useState([]);
    const [roleSkills, setRoleSkills] = useState([]);
    const [resumeHistory, setResumeHistory] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);

    // Computed values
    const [skillMatchPercent, setSkillMatchPercent] = useState(0);
    const [resumeScorePercent, setResumeScorePercent] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [matchedSkills, setMatchedSkills] = useState([]);
    const [missingSkills, setMissingSkills] = useState([]);
    const [performanceSummary, setPerformanceSummary] = useState({
        best: 0,
        average: 0,
        latest: 0,
        improvement: 0
    });

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error("Please login first");
            }

            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch user profile (for target_role_id)
            const profileRes = await fetch(`${BASE_URL}/user/profile`, { headers });
            if (!profileRes.ok) throw new Error("Failed to fetch profile");
            const profileData = await profileRes.json();
            setProfile(profileData);

            // 2. Fetch user's skills
            const skillsRes = await fetch(`${BASE_URL}/user/skills`, { headers });
            let skillsData = [];
            if (skillsRes.ok) {
                const skillsJson = await skillsRes.json();
                skillsData = skillsJson.skills || [];
            }
            const userSkillNames = skillsData.map(s => (s.name || s).toLowerCase());
            setUserSkills(userSkillNames);

            // 3. If target role exists, fetch skill gap data
            if (profileData.target_role_id) {
                const gapRes = await fetch(`${BASE_URL}/career/gap/${profileData.target_role_id}`, { headers });
                if (gapRes.ok) {
                    const gapData = await gapRes.json();

                    // Get matched skills from API
                    const matched = (gapData.matched_skills || []).map(s => s.toLowerCase());

                    // Get missing skills from technical_gaps and soft_skill_gaps
                    const technicalGaps = gapData.technical_gaps || [];
                    const softGaps = gapData.soft_skill_gaps || [];
                    const missing = [...technicalGaps, ...softGaps].map(s => s.name.toLowerCase());

                    setRoleSkills([...matched, ...missing]);
                    setMatchedSkills(matched);
                    setMissingSkills(missing);

                    // Skill Match %
                    const totalRequired = matched.length + missing.length;
                    const matchPercent = totalRequired > 0
                        ? Math.round((matched.length / totalRequired) * 100)
                        : 0;
                    setSkillMatchPercent(matchPercent);
                }
            } else {
                setSkillMatchPercent(0);
                setMatchedSkills([]);
                setMissingSkills([]);
                setRoleSkills([]);
            }

            // 4. Fetch resume history - sorted by date ascending (oldest first)
            const historyRes = await fetch(`${BASE_URL}/resume/history`, { headers });
            let historyData = [];
            if (historyRes.ok) {
                const historyJson = await historyRes.json();
                // Sort by created_at ascending (oldest first)
                const sorted = [...historyJson].sort((a, b) =>
                    new Date(a.created_at) - new Date(b.created_at)
                );
                // Transform to chart-friendly format with scan index
                historyData = sorted.map((scan, index) => ({
                    scan: index + 1,
                    score: scan.score,
                    date: new Date(scan.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                    })
                }));
            }
            setResumeHistory(historyData);

            // 5. Fetch dashboard stats
            const statsRes = await fetch(`${BASE_URL}/dashboard/stats`, { headers });
            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setDashboardStats(statsData);
                setResumeScorePercent(statsData.latest_score || 0);

                // Calculate performance summary
                const scores = historyData.map(h => h.score);
                const best = Math.max(...scores, 0);
                const avg = scores.length > 0
                    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                    : 0;
                const latest = scores[scores.length - 1] || 0;
                const first = scores[0] || 0;
                const improvement = latest - first;

                setPerformanceSummary({
                    best,
                    average: avg,
                    latest,
                    improvement
                });
            }

            // 6. Calculate overall progress
            // Assuming roadmap completion = 0 (not tracked yet)
            const roadmapCompletion = 0;
            const overall = Math.round(
                (0.4 * skillMatchPercent) +
                (0.3 * resumeScorePercent) +
                (0.3 * roadmapCompletion)
            );
            setOverallProgress(overall);

        } catch (err) {
            console.error("Error fetching progress data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="progress-tracker">
                <div className="page-header">
                    <h1 className="page-title">Progress Insights</h1>
                    <p className="page-subtitle">Track your career improvement over time.</p>
                </div>
                <Loader message="Loading your insights..." size="lg" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="progress-tracker">
                <div className="page-header">
                    <h1 className="page-title">Progress Insights</h1>
                    <p className="page-subtitle">Track your career improvement over time.</p>
                </div>
                <Card>
                    <div style={{ textAlign: 'center', padding: '40px', color: '#ef4444' }}>
                        <p>{error}</p>
                        <button onClick={fetchAllData} style={{ marginTop: '12px', padding: '8px 16px', cursor: 'pointer' }}>
                            Try Again
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // No target role set
    if (!profile?.target_role) {
        return (
            <div className="progress-tracker">
                <div className="page-header">
                    <h1 className="page-title">Progress Insights</h1>
                    <p className="page-subtitle">Track your career improvement over time.</p>
                </div>
                <Card>
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Target size={48} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                        <h3>No Target Role Set</h3>
                        <p style={{ color: '#64748b', marginTop: '8px' }}>
                            Set a target role to start tracking your career insights.
                        </p>
                        <button
                            onClick={() => window.location.href = '/career-recommendations'}
                            style={{
                                marginTop: '16px',
                                padding: '10px 20px',
                                background: '#4f46e5',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer'
                            }}
                        >
                            Choose Target Role
                        </button>
                    </div>
                </Card>
            </div>
        );
    }

    // Prepare chart data
    const skillDistributionData = [
        { name: 'Matched', value: matchedSkills.length, color: COLORS.matched },
        { name: 'Missing', value: missingSkills.length, color: COLORS.missing }
    ];

    return (
        <div className="progress-tracker">
            <div className="page-header">
                <h1 className="page-title">Progress Insights</h1>
                <p className="page-subtitle">
                    {profile?.target_role
                        ? `Insights for your ${profile.target_role} journey`
                        : "Track your career improvement over time"}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="progress-overview-grid">
                <Card className="overview-card">
                    <div className="ov-item">
                        <div className="ov-icon green"><Award size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Skill Match</span>
                            <h3 className="ov-value">{skillMatchPercent}%</h3>
                        </div>
                    </div>
                    <div className="ov-divider"></div>
                    <div className="ov-item">
                        <div className="ov-icon purple"><Target size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Latest Resume Score</span>
                            <h3 className="ov-value">{resumeScorePercent}%</h3>
                        </div>
                    </div>
                    <div className="ov-divider"></div>
                    <div className="ov-item">
                        <div className="ov-icon blue"><TrendingUp size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Overall Progress</span>
                            <h3 className="ov-value">{overallProgress}%</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Row 1: Resume Trend + Skill Distribution */}
            <div className="insights-charts-grid">
                {/* Resume Score Trend */}
                <Card title="Resume Score Trend" subtitle="Your resume improvement over time">
                    {resumeHistory.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={resumeHistory}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="scan"
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        tickFormatter={(val) => `Scan ${val}`}
                                    />
                                    <YAxis
                                        domain={[0, 100]}
                                        tick={{ fontSize: 12, fill: '#94a3b8' }}
                                        tickFormatter={(val) => `${val}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: 'none',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                        }}
                                        formatter={(value) => [`${value}%`, 'Score']}
                                        labelFormatter={(label) => `Scan #${label}`}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke={COLORS.primary}
                                        strokeWidth={3}
                                        dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <p>No resume scans yet</p>
                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                Upload a resume to see your score trend
                            </p>
                        </div>
                    )}
                </Card>

                {/* Skill Distribution */}
                <Card title="Skill Distribution" subtitle="Matched vs missing skills for your target role">
                    {roleSkills.length > 0 ? (
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={skillDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, value }) => `${name}: ${value}`}
                                        labelLine={false}
                                    >
                                        {skillDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} skills`, '']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <p>Please select a target role to see insights</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Charts Row 2: Top Missing Skills + Performance Summary */}
            <div className="insights-charts-grid">
                {/* Top Missing Skills - Simple List */}
                <Card title="Skills to Develop" subtitle="Focus on these to improve your profile">
                    {missingSkills.length > 0 ? (
                        <div className="missing-skills-list">
                            {missingSkills.slice(0, 10).map((skill) => (
                                <div key={skill} className="missing-skill-item">
                                    <span className="skill-name">{skill.charAt(0).toUpperCase() + skill.slice(1)}</span>
                                    <span className="skill-status">Not learned</span>
                                </div>
                            ))}
                            {missingSkills.length > 10 && (
                                <p className="more-skills">+{missingSkills.length - 10} more skills</p>
                            )}
                        </div>
                    ) : (
                        <div className="empty-chart">
                            <p style={{ color: '#22c55e' }}>
                                {matchedSkills.length > 0
                                    ? "All required skills acquired!"
                                    : "No target role selected"}
                            </p>
                        </div>
                    )}
                </Card>

                {/* Performance Summary */}
                <Card title="Performance Summary">
                    <div className="performance-stats">
                        <div className="stat-item">
                            <span className="stat-label">Best Score</span>
                            <span className="stat-value best">{performanceSummary.best}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Average Score</span>
                            <span className="stat-value">{performanceSummary.average}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Latest Score</span>
                            <span className="stat-value">{performanceSummary.latest}%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Improvement</span>
                            <span className={`stat-value ${performanceSummary.improvement > 0 ? 'positive' : performanceSummary.improvement < 0 ? 'negative' : ''}`}>
                                {performanceSummary.improvement > 0 ? (
                                    <><ArrowUp size={16} /> +{performanceSummary.improvement}%</>
                                ) : performanceSummary.improvement < 0 ? (
                                    <><ArrowDown size={16} /> {performanceSummary.improvement}%</>
                                ) : (
                                    <><Minus size={16} /> 0%</>
                                )}
                            </span>
                        </div>
                    </div>

                    {dashboardStats && (
                        <div className="additional-stats">
                            <div className="stat-row">
                                <span>Total Resume Scans</span>
                                <span>{dashboardStats.total_scans}</span>
                            </div>
                            <div className="stat-row">
                                <span>Skills Acquired</span>
                                <span>{userSkills.length}</span>
                            </div>
                            <div className="stat-row">
                                <span>Required Skills</span>
                                <span>{roleSkills.length}</span>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProgressTracker;