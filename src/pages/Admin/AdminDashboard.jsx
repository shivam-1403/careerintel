import React from 'react';
import {
    Users,
    Briefcase,
    Target,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter
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
    { name: 'Software Eng', value: 400 },
    { name: 'Data Sci', value: 300 },
    { name: 'UI/UX Design', value: 200 },
    { name: 'Product Mgmt', value: 150 },
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
                    <h1 className="page-title">Admin Command Center</h1>
                    <p className="page-subtitle">Monitoring platform growth and student career trends.</p>
                </div>
                <div className="header-actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input type="text" placeholder="Search students..." />
                    </div>
                    <button className="icon-btn"><Filter size={20} /></button>
                </div>
            </div>

            <div className="admin-stats-grid">
                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon purple"><Users size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 12%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Total Active Students</span>
                        <h2 className="asc-value">12,845</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon blue"><Briefcase size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 8%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Learning Paths Generated</span>
                        <h2 className="asc-value">45,210</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon green"><Target size={20} /></div>
                        <span className="asc-trend negative"><ArrowDownRight size={14} /> 3%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Avg Skill Gap Score</span>
                        <h2 className="asc-value">42%</h2>
                    </div>
                </Card>

                <Card className="admin-stat-card">
                    <div className="asc-header">
                        <div className="asc-icon orange"><Activity size={20} /></div>
                        <span className="asc-trend positive"><ArrowUpRight size={14} /> 24%</span>
                    </div>
                    <div className="asc-content">
                        <span className="asc-label">Monthly Active Users</span>
                        <h2 className="asc-value">8,920</h2>
                    </div>
                </Card>
            </div>

            <div className="admin-charts-grid">
                <Card title="Popular Career Choices" subtitle="The most frequent target careers selected by students.">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={careerStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {careerStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
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

                <Card title="Common Missing Skills" subtitle="The most frequent gaps identified across all students.">
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={skillGapData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
                                <RechartsTooltip />
                                <Bar dataKey="gaps" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Recent Platform Activity" className="mt-6">
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Action</th>
                                <th>Target Career</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm">AS</div>
                                        <span>Alice Smith</span>
                                    </div>
                                </td>
                                <td>Generated Roadmap</td>
                                <td>Data Scientist</td>
                                <td>2 mins ago</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm">BJ</div>
                                        <span>Bob Johnson</span>
                                    </div>
                                </td>
                                <td>Uploaded Resume</td>
                                <td>Backend Engineer</td>
                                <td>15 mins ago</td>
                            </tr>
                            <tr>
                                <td>
                                    <div className="student-info">
                                        <div className="avatar sm">CH</div>
                                        <span>Charlie Hill</span>
                                    </div>
                                </td>
                                <td>Skill Assessment</td>
                                <td>UX Designer</td>
                                <td>1 hour ago</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard;
