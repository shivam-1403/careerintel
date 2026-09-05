import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Briefcase, MapPin, DollarSign, ArrowRight, Star, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import './CareerRecommendations.css';
import API_BASE from '../../config/api';

const CareerRecommendations = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [loadingRole, setLoadingRole] = useState(null);
    const highlightedRoleRef = useRef(null);

    // Get search params from navbar search
    const searchQuery = searchParams.get('search');
    const roleIdParam = searchParams.get('role');

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [userRes, recRes] = await Promise.all([
                    fetch(`${API_BASE}/user/profile`, { headers }),
                    fetch(`${API_BASE}/career/recommend`, { headers })
                ]);

                const userData = userRes.ok ? await userRes.json() : null;
                const recData = recRes.ok ? await recRes.json() : { recommendations: [] };

                setUser(userData);
                setRecommendations(
                    (recData.recommendations || []).sort((a, b) => b.score - a.score)
                );
            } catch (err) {
                console.error("Recommendation error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    // Auto-scroll/highlight when role param is passed from search
    useEffect(() => {
        if (!loading && recommendations.length > 0) {
            if (roleIdParam) {
                const targetIndex = recommendations.findIndex(r => r.role_id === parseInt(roleIdParam));
                if (targetIndex !== -1 && highlightedRoleRef.current) {
                    highlightedRoleRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }
    }, [loading, recommendations, roleIdParam]);

    // Filter recommendations based on search query
    const filteredRecommendations = searchQuery
        ? recommendations.filter(r =>
            r.career?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.matched_skills?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : recommendations;

    const handleExplore = (job) => {
        if (!job.role_id) {
            console.error("Missing role_id for job:", job);
            return;
        }
        viewCareer(job.role_id, "/learning-path");
    };

    const handleSetTargetRole = async (career) => {
        const token = localStorage.getItem("token");
        setLoadingRole(career.role_id);

        try {
            const response = await fetch(`${API_BASE}/user/target-role/${career.role_id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                // Refetch user data and recommendations
                const [userRes, recRes] = await Promise.all([
                    fetch(`${API_BASE}/user/profile`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE}/career/recommend`, { headers: { Authorization: `Bearer ${token}` } })
                ]);

                const userData = userRes.ok ? await userRes.json() : null;
                const recData = recRes.ok ? await recRes.json() : { recommendations: [] };

                setUser(userData);
                setRecommendations((recData.recommendations || []).sort((a, b) => b.score - a.score));
            }
        } catch (err) {
            console.error("Error setting target role:", err);
        } finally {
            setLoadingRole(null);
        }
    };

    const viewCareer = (roleId, redirectPage) => {
        navigate(`${redirectPage}?roleId=${roleId}`);
    };

    const formatSkill = (skill) => {
        if (!skill) return "";

        const upperCases = ["sql", "ai", "ml", "ui", "ux", "api"];

        if (upperCases.includes(skill.toLowerCase())) {
            return skill.toUpperCase();
        }

        if (skill.toLowerCase() === "c++") {
            return "C++";
        }

        if (skill.toLowerCase() === "node.js") {
            return "Node.js";
        }

        return skill.charAt(0).toUpperCase() + skill.slice(1);
    };

    return (
        <div className="career-recommendations">
            <div className="page-header">
                <div className="header-with-badge">
                    <h1 className="page-title">Career Intelligence</h1>
                    <span className="ai-badge"><Sparkles size={14} /> AI Powered</span>
                </div>
                <p className="page-subtitle">Based on your skills, experience, and interests, we've identified these paths for you.</p>
            </div>

            {loading ? (
                <Loader message="Analyzing your profile..." size="lg" />
            ) : recommendations.length === 0 ? (
                <div className="empty-state">
                    <p>No recommendations yet. Add skills to your profile.</p>
                </div>
            ) : (
                <>
                    <div className="recommendations-container">
                        {filteredRecommendations.map((job, index) => {
                            const isHighlighted = roleIdParam && job.role_id === parseInt(roleIdParam);
                            return (
                            <Card
                                key={index}
                                className={`recommendation-card ${isHighlighted ? 'highlighted' : ''}`}
                                ref={isHighlighted ? highlightedRoleRef : null}
                            >
                                <div className="job-header">
                                    <div className="job-title-area">
                                        <div className="job-icon">
                                            <Briefcase size={24} />
                                        </div>
                                        <div>
                                            <h2 className="job-title">{job.career}</h2>
                                            <div className="job-meta">
                                                <span className="job-meta-item">
                                                Matched Skills: {job.matched_skills?.length || 0}
                                                </span>

                                                <span className="job-meta-item">
                                                Missing Skills: {job.missing_skills?.length || 0}
                                                </span>

                                            </div>
                                        </div>
                                    </div>
                                    <div className="match-score-area">
                                        <div className="match-percentage">{job.score}%</div>
                                        <span className="match-label">Match</span>
                                    </div>
                                </div>

                                <div className="job-content">
                                    <div className="job-explanation">
                                        <div className="explanation-label">
                                            <Info size={16} /> Why this career?
                                        </div>
                                        <p>
                                        You match {job.matched_skills?.length || 0} required skills.
                                        To improve your score, learn: {
                                            job.missing_skills?.slice(0,3).map(formatSkill).join(", ") || "None"
                                        }.

                                        </p>

                                    </div>

                                    <div className="job-traits">
                                        {job.matched_skills?.map(skill => (
                                            <span key={skill} className="trait-tag">
                                                {formatSkill(skill)}
                                            </span>
                                        ))}
                                    </div>


                                </div>

                                <div className="job-footer">
                                    <div className="priority-indicator">
                                        <Star
                                        size={16}
                                        fill={job.score > 80 ? 'var(--warning)' : 'none'}
                                        className={job.score > 80 ? 'text-warning' : 'text-muted'}
                                        />
                                        <span>
                                            {job.score >= 80 ? "Top Match" :
                                            job.score >= 60 ? "Strong Fit" :
                                            "Good Opportunity"}
                                        </span>

                                    </div>
                                    <div className="action-buttons">

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSetTargetRole(job)}
                                            disabled={loadingRole === job.role_id}
                                        >
                                            {user?.target_role_id === job.role_id ? "Selected" : loadingRole === job.role_id ? "Setting..." : "Set as Target"}
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewCareer(job.role_id, "/skill-gap")}
                                        >
                                            Skill Gap
                                        </Button>

                                        <Button
                                            size="sm"
                                            onClick={() => handleExplore(job)}
                                        >
                                            Explore Roadmap
                                        </Button>

                                    </div>

                                </div>
                            </Card>
                        );
                        })}
                    </div>

                    <div className="discovery-cta mt-8">
                        <Card className="cta-card glass">
                            <div className="cta-content">
                                <Sparkles size={40} className="text-primary" />
                                <div className="cta-text">
                                    <h3>Didn't find what you're looking for?</h3>
                                    <p>Try refining your profile or uploading an updated resume to get better recommendations.</p>
                                </div>
                                <Button variant="primary" onClick={() => navigate("/profile")} style={{ marginTop: '1rem' }}>
                                    Refine My Profile
                                </Button>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default CareerRecommendations;