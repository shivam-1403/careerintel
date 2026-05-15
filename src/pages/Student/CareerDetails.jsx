import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import './Dashboard.css';
import './CareerDetails.css';

const API_BASE = 'https://careerintel-w10f.onrender.com';

const CareerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const fetchCareer = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE}/career/${encodeURIComponent(id)}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (!response.ok) throw new Error(await response.text() || "Couldn't fetch career details.");
        const data = await response.json();
        if (!ignore) setCareer(data);
      } catch (e) {
        if (!ignore) {
          setError(e.message || 'Could not load career details.');
          setCareer(null);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    if (id) fetchCareer();
    else {
      setError('Invalid career ID.');
      setCareer(null);
      setLoading(false);
    }
    return () => {
      ignore = true;
    };
  }, [id]);

  // Skill lists
  const matchScore = career?.match_score;
  const readiness = typeof matchScore === 'number' ? matchScore : null;
  const category = career?.category || career?.type || '';
  const name = career?.name || '';
  const matchedSkills = Array.isArray(career?.matched_skills) ? career.matched_skills : [];
  const missingSkills = Array.isArray(career?.missing_skills) ? career.missing_skills : [];
  const description =
    (career?.description && career.description.trim()) ||
    'No description is available for this role yet. Explore matched and missing skills below.';

  // Loading state
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

  // Error state
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
            <Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>
            <Button onClick={() => navigate('/career-recommendations')}>Browse careers</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard career-details-page">
      {/* Back button */}
      <div className="career-details-back">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} style={{ gap: '0.35rem' }}>
          <ArrowLeft size={18} />
          Back
        </Button>
      </div>

      {/* Header / Hero */}
      <section className="career-details-hero">
        <Card className="intel-card-elevated">
          <div className="career-details-hero-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Briefcase size={22} style={{ color: 'var(--primary)' }} />
                <span className="career-details-chip career-details-chip--cat">{category}</span>
              </div>
              <h1 className="page-title" style={{ marginBottom: '0.35rem' }}>{name}</h1>
              <div className="career-details-meta">
                <span className="career-details-chip">Role ID · {career.id}</span>
                {typeof readiness === 'number' && (
                  <span className="career-details-chip career-details-chip--cat">
                    Personalized match
                  </span>
                )}
              </div>
            </div>
            {/* Score Card */}
            <div className="career-details-score-card">
              <div className="career-details-score-label">Readiness</div>
              {typeof readiness === 'number' ? (
                <>
                  <div>
                    <span className="career-details-score-value">{readiness}</span>
                    <span className="career-details-score-suffix">%</span>
                  </div>
                  <div className="career-details-score-hint">Weighted skill alignment</div>
                  <div className="career-details-match-bar">
                    <div
                      className="career-details-match-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
                    />
                  </div>
                </>
              ) : (
                <div className="career-details-score-hint" style={{ marginTop: 0 }}>
                  Sign in and add skills to see your match for this role.
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      {/* Responsive grid for analytics and overview */}
      <div className="career-details-grid" style={{ marginBottom: '1.5rem' }}>
        <Card title="Overview" subtitle="Role summary" className="intel-card-elevated">
          <p className="career-details-desc">{description}</p>
        </Card>
        <Card title="Match analytics" subtitle="Your profile vs. this role" className="intel-card-elevated">
          {typeof readiness === 'number' ? (
            <>
              <div className="stat-label" style={{ marginBottom: '0.25rem' }}>Match score</div>
              <div className="stat-value-row" style={{ marginTop: 0 }}>
                <span className="stat-value">{readiness}%</span>
                <span className="stat-change" style={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                  Weighted alignment
                </span>
              </div>
              <div className="progress-bar-bg" style={{ marginTop: '1rem' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${Math.min(100, Math.max(0, readiness))}%` }}
                />
              </div>
            </>
          ) : (
            <p className="career-details-desc">
              Log in with an account that has skills saved to see match percentage and readiness for this career.
            </p>
          )}
        </Card>
      </div>

      {/* Responsive grid for skills */}
      <div className="career-details-grid">
        <Card title="Matched skills" subtitle="Skills you already have for this role" className="intel-card-elevated">
          {matchedSkills.length === 0 ? (
            <p className="career-details-desc" style={{ margin: 0 }}>
              No overlapping skills yet. Add skills to your profile or upload a resume.
            </p>
          ) : (
            <div className="career-details-tag-row">
              {matchedSkills.map((name) => (
                <span key={name} className="intel-tag intel-tag-matched">{name}</span>
              ))}
            </div>
          )}
        </Card>
        <Card title="Missing skills" subtitle="Skills to build for this role" className="intel-card-elevated">
          {missingSkills.length === 0 ? (
            <p className="career-details-desc" style={{ margin: 0 }}>
              You cover all mapped skills for this role — outstanding alignment.
            </p>
          ) : (
            <div className="career-details-tag-row">
              {missingSkills.map((name) => (
                <span key={name} className="intel-tag intel-tag-missing-tech">{name}</span>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Optional: show required_skills as skill map, if provided */}
      {Array.isArray(career.required_skills) && career.required_skills.length > 0 && (
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
      )}

      <div style={{ marginTop: '1.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button variant="outline" onClick={() => navigate('/skill-gap')}>
          Skill gap
        </Button>
        <Button onClick={() => navigate('/career-recommendations')}>More careers</Button>
      </div>
    </div>
  );
};

export default CareerDetails;
