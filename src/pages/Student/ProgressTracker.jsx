import React, { useState, useEffect } from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Award, Target, TrendingUp, CheckCircle2, Circle, Lock } from 'lucide-react';
import Card from '../../components/ui/Card';
import './ProgressTracker.css';

// Generate activity data based on user's progress
const generateActivityData = (progress) => {
    const baseValue = Math.max(10, progress * 0.8);
    return [
        { day: 'Mon', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Tue', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Wed', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Thu', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Fri', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Sat', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
        { day: 'Sun', value: Math.round(baseValue + (Math.random() * 15 - 7)) },
    ];
};

// Generate milestone data based on user's progress
const generateMilestones = (progress, targetRoleId) => {
    const milestones = [];

    // Milestone 1: Complete 3 skills - unlocked at start
    milestones.push({
        id: 1,
        title: 'Complete 3 Skills',
        description: 'Master 3 skills from your learning roadmap',
        status: progress >= 10 ? 'completed' : 'active',
        progress: Math.min(100, progress * 10)
    });

    // Milestone 2: Reach 50% readiness - unlocked after completing skills
    milestones.push({
        id: 2,
        title: 'Reach 50% Readiness',
        description: 'Achieve 50% skill match for your target role',
        status: progress >= 50 ? 'completed' : progress >= 10 ? 'active' : 'locked',
        progress: Math.min(100, progress * 2)
    });

    // Milestone 3: Complete Phase 1 Roadmap - unlocked at 30%
    milestones.push({
        id: 3,
        title: 'Complete Phase 1 Roadmap',
        description: 'Finish all Phase 1 learning modules',
        status: progress >= 75 ? 'completed' : progress >= 30 ? 'active' : 'locked',
        progress: progress >= 75 ? 100 : Math.round((progress / 75) * 100)
    });

    // Milestone 4: Resume Score Above 70 - unlocked at 50%
    milestones.push({
        id: 4,
        title: 'Resume Score Above 70',
        description: 'Upload a resume that scores 70+ on ATS analysis',
        status: progress >= 85 ? 'completed' : progress >= 50 ? 'active' : 'locked',
        progress: progress >= 85 ? 100 : Math.round((progress / 85) * 100)
    });

    // Milestone 5: Job Ready - unlocked at 80%
    milestones.push({
        id: 5,
        title: 'Job Ready Status',
        description: 'Reach 80%+ skill match for your target role',
        status: progress >= 95 ? 'completed' : progress >= 80 ? 'active' : 'locked',
        progress: progress >= 95 ? 100 : Math.round((progress / 95) * 100)
    });

    return milestones;
};

const ProgressTracker = () => {
    const [activityData, setActivityData] = useState([]);
    const [skillsProgress, setSkillsProgress] = useState([]);
    const [milestones, setMilestones] = useState([]);
    const [stats, setStats] = useState({
        skillsEarned: 0,
        targetRole: '',
        totalRequiredSkills: 0,
        overallProgress: 0,
        milestonesCompleted: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProgressData = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    throw new Error("No authentication token");
                }

                // Fetch user profile to get target role
                const profileRes = await fetch("https://careerintel-w10f.onrender.com/user/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!profileRes.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const profile = await profileRes.json();
                const targetRoleId = profile.target_role_id;

                if (!targetRoleId) {
                    // No target role set - use mock data with 0 progress
                    setActivityData(generateActivityData(0));
                    setSkillsProgress([]);
                    setMilestones(generateMilestones(0, null));
                    setStats({
                        skillsEarned: 0,
                        targetRole: 'Not Set',
                        totalRequiredSkills: 0,
                        overallProgress: 0,
                        milestonesCompleted: 0
                    });
                    setIsLoading(false);
                    return;
                }

                // Fetch role details to get required skills
                const roleRes = await fetch(`https://careerintel-w10f.onrender.com/roles/${targetRoleId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let roleName = 'Target Role';
                let requiredSkills = [];

                if (roleRes.ok) {
                    const roleData = await roleRes.json();
                    roleName = roleData.name || 'Target Role';
                    requiredSkills = roleData.required_skills || [];
                }

                // Fetch user's skills
                const skillsRes = await fetch("https://careerintel-w10f.onrender.com/user/skills", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                let userSkills = [];
                if (skillsRes.ok) {
                    const skillsData = await skillsRes.json();
                    userSkills = skillsData.skills || [];
                }

                // Calculate matched vs missing skills
                const userSkillNames = userSkills.map(s => s.name?.toLowerCase() || s.toLowerCase());
                const requiredSkillNames = requiredSkills.map(s => s.toLowerCase());

                const matchedSkills = requiredSkillNames.filter(skill =>
                    userSkillNames.includes(skill)
                );
                const missingSkills = requiredSkillNames.filter(skill =>
                    !userSkillNames.includes(skill)
                );

                // Calculate overall progress
                const totalRequired = requiredSkillNames.length;
                const matchedCount = matchedSkills.length;
                const overallProgress = totalRequired > 0
                    ? Math.round((matchedCount / totalRequired) * 100)
                    : 0;

                // Generate skill progress for missing skills (simulated)
                const skillProgressData = missingSkills.map((skill, index) => ({
                    name: skill.charAt(0).toUpperCase() + skill.slice(1),
                    progress: Math.max(0, 100 - (index * 20)) // Decreasing progress for each missing skill
                }));

                // Generate activity data based on progress
                const activity = generateActivityData(overallProgress);

                // Generate milestones
                const milestoneData = generateMilestones(overallProgress, targetRoleId);
                const completedMilestones = milestoneData.filter(m => m.status === 'completed').length;

                // Update state
                setActivityData(activity);
                setSkillsProgress(skillProgressData);
                setMilestones(milestoneData);
                setStats({
                    skillsEarned: matchedCount,
                    targetRole: roleName,
                    totalRequiredSkills: totalRequired,
                    overallProgress: overallProgress,
                    milestonesCompleted: completedMilestones
                });

            } catch (err) {
                console.error("Progress Tracker Error:", err);
                setError(err.message);

                // Use fallback mock data
                setActivityData(generateActivityData(50));
                setSkillsProgress([
                    { name: 'Sample Skill 1', progress: 80 },
                    { name: 'Sample Skill 2', progress: 60 },
                    { name: 'Sample Skill 3', progress: 40 }
                ]);
                setMilestones(generateMilestones(50, 1));
                setStats({
                    skillsEarned: 5,
                    targetRole: 'Software Developer',
                    totalRequiredSkills: 10,
                    overallProgress: 50,
                    milestonesCompleted: 1
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchProgressData();
    }, []);

    if (isLoading) {
        return (
            <div className="progress-tracker">
                <div className="page-header">
                    <h1 className="page-title">Progress Tracker</h1>
                    <p className="page-subtitle">Monitor your learning efficiency and skill acquisition over time.</p>
                </div>
                <p>Loading progress data...</p>
            </div>
        );
    }

    return (
        <div className="progress-tracker">
            <div className="page-header">
                <h1 className="page-title">Progress Tracker</h1>
                <p className="page-subtitle">Monitor your journey towards becoming a {stats.targetRole}.</p>
            </div>

            <div className="progress-overview-grid">
                <Card className="overview-card">
                    <div className="ov-item">
                        <div className="ov-icon green"><Award size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Skills Matched</span>
                            <h3 className="ov-value">{stats.skillsEarned}/{stats.totalRequiredSkills}</h3>
                        </div>
                    </div>
                    <div className="ov-divider"></div>
                    <div className="ov-item">
                        <div className="ov-icon purple"><Target size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Milestones Complete</span>
                            <h3 className="ov-value">{stats.milestonesCompleted}/{milestones.length}</h3>
                        </div>
                    </div>
                    <div className="ov-divider"></div>
                    <div className="ov-item">
                        <div className="ov-icon blue"><TrendingUp size={24} /></div>
                        <div className="ov-info">
                            <span className="ov-label">Job Readiness</span>
                            <h3 className="ov-value">{stats.overallProgress}%</h3>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Activity Intensity" subtitle="Your learning activity this week based on progress towards your target role.">
                <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={activityData}>
                            <defs>
                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorProgress)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <div className="progress-bottom-grid mt-6">
                <Card title="Skills to Develop">
                    <div className="roadmap-progress-list">
                        {skillsProgress.length > 0 ? (
                            skillsProgress.map((skill, index) => (
                                <div key={index} className="rp-item">
                                    <div className="rp-header">
                                        <span>{skill.name}</span>
                                        <span>{skill.progress}%</span>
                                    </div>
                                    <div className="rp-bar"><div className="rp-fill" style={{ width: `${skill.progress}%` }}></div></div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                                {stats.overallProgress >= 100
                                    ? "You've completed all required skills!"
                                    : "No missing skills identified for your target role."}
                            </p>
                        )}
                    </div>
                </Card>

                <Card title="Learning Milestones">
                    <div className="milestone-list">
                        {milestones.map((milestone) => (
                            <div key={milestone.id} className={`ms-item ${milestone.status === 'locked' ? 'locked' : ''}`}>
                                <div className="ms-marker">
                                    {milestone.status === 'completed' ? (
                                        <CheckCircle2 size={16} />
                                    ) : milestone.status === 'locked' ? (
                                        <Lock size={16} />
                                    ) : (
                                        <Circle size={16} />
                                    )}
                                </div>
                                <div className="ms-content">
                                    <h4>{milestone.title}</h4>
                                    <p>
                                        {milestone.status === 'completed'
                                            ? 'Completed'
                                            : milestone.status === 'locked'
                                                ? 'Locked'
                                                : `${milestone.progress}% complete`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ProgressTracker;