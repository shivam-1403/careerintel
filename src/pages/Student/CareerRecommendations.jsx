import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Sparkles, Briefcase, MapPin, DollarSign, ArrowRight, Star, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './CareerRecommendations.css';

const CareerRecommendations = () => {
    const navigate = useNavigate();
    const [recommendations, setRecommendations] = useState([]);
    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/career/recommend", {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`
                    }
                });

                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();
                setRecommendations(
                (data.recommendations || []).sort((a, b) => b.score - a.score)
                );
            } catch (err) {
                console.error("Recommendation error:", err);
            }
        };

        fetchRecommendations();
    }, []);

    const handleExplore = (job) => {
        if (!job.role_id) {
            console.error("Missing role_id for job:", job);
            return;
        }
        viewCareer(job.role_id, "/learning-path");
    };

    const viewCareer = (roleId, redirectPage) => {
        // Navigate to the page with roleId in URL (does NOT update target role)
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

        // Default: Capitalize first letter
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
            {recommendations.length === 0 && (
                <p>No recommendations yet. Add skills to your profile.</p>
            )}

            <div className="recommendations-container">
                {recommendations.map((job, index) => (
                    <Card key={index} className="recommendation-card">
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
                                    onClick={() => viewCareer(job.role_id, "/skill-gap")}
                                >
                                    Skill Gap Analysis
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
                ))}
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
        </div>
    );
};

export default CareerRecommendations;
