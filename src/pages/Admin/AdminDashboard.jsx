import React from 'react';
import {
    Brain,
    Sparkles,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    FileText,
    Zap
} from 'lucide-react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import Card from '../../components/ui/Card';
import './AdminDashboard.css';

const careerStats = [
    { name: 'Data Scientist', value: 450 },
    { name: 'AI Engineer', value: 380 },
    { name: 'Cloud Architect', value: 290 },
    { name: 'Product Manager', value: 200 },
];

const skillGapData = [
    { name: 'Cloud Computing', gaps: 85 },
    { name: 'TypeScript', gaps: 70 },
    { name: 'Testing', gaps: 65 },
    { name: 'System Design', gaps: 50 },
    { name: 'Docker', gaps: 45 },
];

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'];

const AdminDashboard = () => {
    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Platform Intelligence Dashboard</h1>
                    <p className="page-subtitle">AI Career Intelligence Control Center for platform insights and growth.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Search insights..." />
                    </div>
                </div>
            </div>

            <div className="admin-stats-grid">
                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon purple"><Brain size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 12%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Total Career Analyses</span>
                        <h2 className="asc-value">12,845</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon blue"><Target size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 4%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Average Readiness Score</span>
                        <h2 className="asc-value">72%</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon green"><FileText size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 18%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Resume Scans This Week</span>
                        <h2 className="asc-value">3,420</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon orange"><Sparkles size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 24%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">AI Insights Generated</span>
                        <h2 className="asc-value">15,200</h2>
                    </div>
                </Card>
            </div>

            <div className="admin-charts-grid">
                <Card title="Trending AI Career Paths" subtitle="Fastest-growing career ecosystems by target volume." className="admin-card-glass">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={careerStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={65}
                                    outerRadius={90}
                                    paddingAngle={6}
                                    dataKey="value"
                                    stroke="transparent"
                                >
                                    {careerStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="chart-legend">
                            {careerStats.map((entry, index) => (
                                <div key={entry.name} className="legend-item">
                                    <span className="dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                    <span className="name">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                <Card title="Workforce Skill Gap Intelligence" subtitle="AI-identified missing capabilities across student roadmap trajectories." className="admin-card-glass">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={skillGapData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} width={120} />
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--card-foreground)' }} />
                                <Bar dataKey="gaps" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Recent AI Platform Activity" className="mt-6 admin-card-glass">
                <div className="admin-table-container">
                    <table className="admin-table ai-feed-table">
                        <thead>
                            <tr>
                                <th>Insight Event</th>
                                <th>Target Role</th>
                                <th>Intelligence Result</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm bg-purple-light"><Sparkles size={14} className="purple" /></div>
                                        <span>Roadmap Generation</span>
                                    </div>
                                </td>
                                <td>Data Scientist</td>
                                <td><span className="ai-badge ai-badge-success">Score +12%</span></td>
                                <td>2 mins ago</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm bg-blue-light"><FileText size={14} className="blue" /></div>
                                        <span>Resume Analysis</span>
                                    </div>
                                </td>
                                <td>Cloud Engineer</td>
                                <td><span className="ai-badge ai-badge-info">Gaps identified</span></td>
                                <td>15 mins ago</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm bg-orange-light"><Zap size={14} className="orange" /></div>
                                        <span>Career Recommendation</span>
                                    </div>
                                </td>
                                <td>AI Engineer</td>
                                <td><span className="ai-badge ai-badge-warning">New match</span></td>
                                <td>1 hour ago</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm bg-green-light"><Target size={14} className="green" /></div>
                                        <span>Readiness Check</span>
                                    </div>
                                </td>
                                <td>Product Manager</td>
                                <td><span className="ai-badge ai-badge-success">Ready</span></td>
                                <td>3 hours ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
