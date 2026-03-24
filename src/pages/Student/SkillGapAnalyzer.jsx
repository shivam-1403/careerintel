import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";
import { Target, CheckCircle, XCircle, ArrowRight, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './SkillGapAnalyzer.css';

const SkillGapAnalyzer = () => {
    const navigate = useNavigate();
    const [gapData, setGapData] = useState(null);
    const [targetRoleId, setTargetRoleId] = useState(null);
    const [isSettingTarget, setIsSettingTarget] = useState(false);
    const [searchParams] = useSearchParams();
    const roleIdFromURL = searchParams.get("roleId");

    // Fetch current target role on mount
    useEffect(() => {
        const fetchTargetRole = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("http://127.0.0.1:8000/user/profile", {
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
        const fetchGapData = async () => {
            try {
                const token = localStorage.getItem("token");

                // 1️⃣ Decide role - use URL param first, then fallback to target role
                let roleIdToUse = roleIdFromURL;

                if (!roleIdToUse) {
                    const profileResponse = await fetch(
                        'http://127.0.0.1:8000/user/profile',
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    const profile = await profileResponse.json();
                    roleIdToUse = profile.target_role_id;
                }

                // 2️⃣ No role case
                if (!roleIdToUse) {
                    setGapData({
                        career: null,
                        technical_gaps: [],
                        soft_skill_gaps: [],
                        score: 0
                    });
                    return;
                }

                // 3️⃣ Fetch correct role gap
                const gapResponse = await fetch(
                    `http://127.0.0.1:8000/career/gap/${roleIdToUse}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                const data = await gapResponse.json();
                setGapData(data);

            } catch (error) {
                console.error('Error fetching skill gap data:', error);
            }
        };

        fetchGapData();
    }, [roleIdFromURL]);

    const handleSetTargetRole = async () => {
        if (!roleIdFromURL) return;

        setIsSettingTarget(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `http://127.0.0.1:8000/user/target-role/${roleIdFromURL}`,
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

    const isViewingDifferentRole = roleIdFromURL && targetRoleId && parseInt(roleIdFromURL) !== targetRoleId;

    if (!gapData) {
        return (
            <div className="skill-gap-analyzer">
                <div className="page-header">
                    <h1 className="page-title">Skill Gap Analysis</h1>
                    <p className="page-subtitle">Analyze the distance between your current skills and your target career.</p>
                </div>
                <p>Loading your skill gap analysis...</p>
            </div>
        );
    }

    const career = gapData?.career;
    const technical_gaps = gapData?.technical_gaps || [];
    const soft_skill_gaps = gapData?.soft_skill_gaps || [];
    const score = gapData?.score ?? 0;
    const targetCareer = career;

    const getReadinessLevel = (score) => {
        if (score < 30) return "Early Stage";
        if (score < 50) return "Beginner";
        if (score < 70) return "Intermediate";
        if (score < 85) return "Job Ready";
        return "Industry Ready";
    };

    const viewingRoleId = roleIdFromURL ? parseInt(roleIdFromURL) : null;
    const isThisRoleTarget = viewingRoleId === targetRoleId;

    return (
        <div className="skill-gap-analyzer">
            <div className="page-header">
                <h1 className="page-title">Skill Gap Analysis</h1>
                <p className="page-subtitle">Analyze the distance between your current skills and your target career.</p>
            </div>

            {isViewingDifferentRole && (
                <div className="viewing-other-role-banner">
                    <Info size={18} />
                    <span>You are viewing a different role. Your target role remains: <strong>{targetRoleId ? gapData?.career : 'set'}</strong></span>
                </div>
            )}

            <div className="analyzer-summary-row">
                <Card className="target-card">
                    <div className="target-info">
                        <div className="target-icon">
                            <Target size={24} />
                        </div>
                        <div>
                            <span className="label">Target Career</span>
                            <h3 className="value">{targetCareer || "No target career selected"}</h3>
                        </div>
                    </div>
                    {roleIdFromURL && !isThisRoleTarget ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSetTargetRole}
                            disabled={isSettingTarget}
                        >
                            {isSettingTarget ? "Setting..." : "Set as Target Role"}
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => navigate("/career-recommendations")}>
                            Change Target
                        </Button>
                    )}
                </Card>

                <Card className="match-score-card">
                    <div className="score-info">
                        <span className="label">Total Readiness</span>
                        <div className="score-row">
                            <h3 className="value">
                                {getReadinessLevel(score)} ({score}%)
                            </h3>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="gap-details-grid">
                <Card title="Skill Comparison" subtitle="Detailed breakdown of required vs. current proficiency.">
                    <div className="gap-list">
                        <div className="gap-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
                            <span>Skill Name</span>
                            <span className="text-right">Status</span>
                        </div>
                        {technical_gaps.map((skill, index) => {
                            return (
                            <div key={index} className="gap-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                                <div className="skill-name-col">
                                    <XCircle size={18} className="text-warning" />
                                    <span>{skill.name}</span>
                                </div>
                                <div className="skill-status-col">
                                    <span className="status-badge missing" style={{ whiteSpace: 'nowrap' }}>
                                        Missing
                                    </span>
                                </div>
                            </div>
                            );
                        })}
                    </div>
                </Card>

                {soft_skill_gaps && soft_skill_gaps.length > 0 && (
                    <Card title="Soft Skill Gaps" subtitle="Soft skills you need to develop for this role." className="mt-4">
                        <div className="gap-list">
                            <div className="gap-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto' }}>
                                <span>Skill Name</span>
                                <span className="text-right">Status</span>
                            </div>
                            {soft_skill_gaps.map((skill, index) => {
                                return (
                                <div key={index} className="gap-row" style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center' }}>
                                    <div className="skill-name-col">
                                        <span>{skill.name}</span>
                                    </div>
                                    <div className="skill-status-col">
                                        <span className="status-badge recommended" style={{ whiteSpace: 'nowrap' }}>
                                            Recommended
                                        </span>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </Card>
                )}

                <div className="gap-insights">
                    <Card title="AI Insights" className="insights-card">
                        {gapData.ai_insight ? (
                            <p>{gapData.ai_insight}</p>
                        ) : (
                            <p>No insights available yet.</p>
                        )}
                        <Button className="w-full mt-4" onClick={() => navigate("/learning-path")}>
                            Generate Learning Path <ArrowRight size={18} />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SkillGapAnalyzer;
