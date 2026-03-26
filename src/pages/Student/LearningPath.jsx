import React, { useState, useEffect } from 'react';
import { useSearchParams } from "react-router-dom";
import { Play, CheckCircle2, Circle, Clock, BookOpen, ExternalLink, ChevronDown, Target, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import './LearningPath.css';

const LearningPath = () => {
    const [roadmap, setRoadmap] = useState([]);
    const [gapData, setGapData] = useState(null);
    const [targetRoleId, setTargetRoleId] = useState(null);
    const [isSettingTarget, setIsSettingTarget] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
    const [searchParams] = useSearchParams();
    const roleIdFromURL = searchParams.get("roleId");

    // Fetch current target role on mount
    useEffect(() => {
        const fetchTargetRole = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("https://careerintel-w10f.onrender.com/user/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const profile = await response.json();
                setTargetRoleId(profile.target_role_id);
            } catch (error) {
                console.error('Error fetching target role:', error);
            }
        };
        fetchTargetRole();
    }, []);

    useEffect(() => {
        const fetchRoadmap = async () => {
            setIsLoading(true);
            setHasAttemptedFetch(true);

            try {
                const token = localStorage.getItem("token");

                // 1️⃣ get user's target role first, then check URL
                const profileRes = await fetch(
                    "https://careerintel-w10f.onrender.com/user/profile",
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const profile = await profileRes.json();

                // Use URL roleId if provided, otherwise use target role
                let roleIdToUse = roleIdFromURL || profile.target_role_id;

                if (!roleIdToUse) {
                    setIsLoading(false);
                    return;
                }

                // 2️⃣ get skill gap for that role (for soft skills display)
                const gapRes = await fetch(
                    `https://careerintel-w10f.onrender.com/career/gap/${roleIdToUse}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const gap = await gapRes.json();
                setGapData(gap);

                // 3️⃣ generate roadmap from backend
                const roadmapRes = await fetch(
                    `https://careerintel-w10f.onrender.com/roadmap/generate/${roleIdToUse}`,
                    {
                        method: "POST",
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const roadmapData = await roadmapRes.json();
                setRoadmap(roadmapData.roadmap || []);

            } catch (err) {
                console.error("Roadmap fetch error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRoadmap();
    }, [roleIdFromURL]);

    const handleSetTargetRole = async () => {
        if (!roleIdFromURL) return;

        setIsSettingTarget(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `https://careerintel-w10f.onrender.com/user/target-role/${roleIdFromURL}`,
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.ok) {
                setTargetRoleId(parseInt(roleIdFromURL));
            }
        } catch (error) {
            console.error('Error setting target role:', error);
        } finally {
            setIsSettingTarget(false);
        }
    };

    const viewingRoleId = roleIdFromURL ? parseInt(roleIdFromURL) : null;
    const isThisRoleTarget = viewingRoleId === targetRoleId;
    const isViewingDifferentRole = roleIdFromURL && targetRoleId && viewingRoleId !== targetRoleId;

    const career = gapData?.career;
    const technical_gaps = gapData?.technical_gaps || [];
    const soft_gaps = gapData?.soft_skill_gaps || [];
    const score = gapData?.score;

    // Problem A: Show correct message when no target career is selected
    // After attempting fetch, if still no roleId and no data, show "no target" message
    const hasTargetRole = roleIdFromURL || targetRoleId;

    if (isLoading) {
        return (
            <div className="learning-path">
                <div className="page-header">
                    <h1 className="page-title">Personalized Learning Roadmap</h1>
                    <p className="page-subtitle">Your step-by-step journey to becoming a <strong>{career || 'your target career'}</strong>.</p>
                </div>
                <Loader message="Generating your personalized roadmap..." size="lg" />
            </div>
        );
    }

    if (hasAttemptedFetch && !hasTargetRole) {
        return (
            <div className="learning-path">
                <div className="page-header">
                    <h1 className="page-title">Personalized Learning Roadmap</h1>
                    <p className="page-subtitle">Your step-by-step journey to becoming a <strong>{career || 'your target career'}</strong>.</p>
                </div>
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                    No target career selected. Please choose a career to generate your learning roadmap.
                </p>
            </div>
        );
    }

    // Problem B: Show message when user already has all required skills
    if (gapData && technical_gaps.length === 0 && roadmap.length === 0) {
        return (
            <div className="learning-path">
                <div className="page-header">
                    <h1 className="page-title">Personalized Learning Roadmap</h1>
                    <p className="page-subtitle">Your step-by-step journey to becoming a <strong>{career}</strong>.</p>
                </div>
                <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
                    You already have all the required skills for this role. You're job-ready! 🚀
                </p>
            </div>
        );
    }

    if (!roadmap.length && !gapData) {
        return (
            <div className="learning-path">
                <div className="page-header">
                    <h1 className="page-title">Personalized Learning Roadmap</h1>
                    <p className="page-subtitle">Your step-by-step journey to becoming a <strong>{career || 'your target career'}</strong>.</p>
                </div>
                <Loader message="Generating your personalized roadmap..." size="lg" />
            </div>
        );
    }

    // Transform backend roadmap to UI format
    const roadmapPhases = roadmap.map((phase, index) => ({
        id: index + 1,
        title: phase.phase,
        duration: `${phase.skills.length} Week${phase.skills.length > 1 ? "s" : ""}`,
        status: index === 0 ? "In Progress" : "Pending",
        progress: index === 0 ? 30 : 0,
        modules: phase.skills.map(skill => ({
            name: `Master ${skill}`,
            duration: "3h",
            completed: false
        }))
    }));

    return (
        <div className="learning-path">
            <div className="page-header">
                <h1 className="page-title">Personalized Learning Roadmap</h1>
                <p className="page-subtitle">Your step-by-step journey to becoming a <strong>{career}</strong>.</p>
            </div>

            {isViewingDifferentRole && (
                <div className="viewing-other-role-banner">
                    <Info size={18} />
                    <span>You are viewing a different role. Your target role remains: <strong>{career}</strong></span>
                </div>
            )}

            {roleIdFromURL && !isThisRoleTarget && (
                <div style={{ marginBottom: '1rem' }}>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSetTargetRole}
                        disabled={isSettingTarget}
                    >
                        {isSettingTarget ? "Setting..." : "Set as Target Role"}
                    </Button>
                </div>
            )}


            <div className="roadmap-container">
                <div className="roadmap-timeline">
                    {roadmapPhases.map((phase) => (
                        <div key={phase.id} className={`roadmap-step ${phase.status.toLowerCase().replace(' ', '-')}`}>
                            <div className="step-marker">
                                {phase.status === 'In Progress' ? <Play size={16} fill="white" /> : phase.status === 'Completed' ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                            </div>
                            <Card className="step-card">
                                <div className="step-header">
                                    <div className="step-title-area">
                                        <span className="step-status-tag">{phase.status}</span>
                                        <h3 className="step-title">{phase.title}</h3>
                                        <div className="step-meta">
                                            <span><Clock size={14} /> {phase.duration}</span>
                                            <span><BookOpen size={14} /> {phase.modules.length} Modules</span>
                                        </div>
                                    </div>
                                    <div className="step-progress-area">
                                        <div className="circular-progress">
                                            <svg viewBox="0 0 36 36" className="circular-chart">
                                                <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                                <path className="circle" strokeDasharray={`${phase.progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                            </svg>
                                            <span className="percentage">{phase.progress}%</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="step-modules">
                                    {phase.modules.map((module, idx) => (
                                        <div key={idx} className={`module-item ${module.completed ? 'completed' : ''}`}>
                                            <div className="module-info">
                                                <div className="module-check">
                                                    {module.completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                                </div>
                                                <span className="module-name">{module.name}</span>
                                            </div>
                                            <div className="module-actions">
                                                <span className="module-duration">{module.duration}</span>
                                                <a href="#" className="resource-link"><ExternalLink size={14} /></a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="roadmap-sidebar">
                    <Card title="Curated Resources">
                        <div className="resource-list">
                            <div className="resource-card">
                                <div className="res-icon"><BookOpen size={18} /></div>
                                <div className="res-info">
                                    <h4>TS Design Patterns</h4>
                                    <p>Advanced patterns for scalable apps.</p>
                                </div>
                            </div>
                            <div className="resource-card">
                                <div className="res-icon"><Play size={18} /></div>
                                <div className="res-info">
                                    <h4>Testing with Jest</h4>
                                    <p>Master integration testing.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Peer Progress" className="mt-6">
                        <div className="peer-progress">
                            <p>You are in the <strong>top 20%</strong> of students following this roadmap.</p>
                            <div className="peer-avatars">
                                <div className="avatar">AM</div>
                                <div className="avatar">SK</div>
                                <div className="avatar">TL</div>
                                <div className="avatar-more">+45</div>
                            </div>
                        </div>
                    </Card>
                    <Card title="Professional Development" className="mt-6">
                        {soft_gaps.length === 0 ? (
                            <p>No soft skill gaps identified 🎉</p>
                        ) : (
                            <div className="soft-skill-list">
                                {soft_gaps.map((skill, idx) => (
                                    <div key={idx} className="soft-skill-card">
                                        <h4 className="soft-skill-title">
                                            {skill.name}
                                        </h4>
                                        <p className="soft-skill-desc">
                                            Improve this through real-world collaboration,
                                            presentations, feedback, and deliberate practice.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LearningPath;
