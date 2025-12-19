import React, { useState, useEffect } from 'react';
import './ProgressPage.css';

const ProgressPage = () => {
    const [selectedClass, setSelectedClass] = useState(7);
    const [assessmentType, setAssessmentType] = useState('mocktest');
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(false);

    const classes = [7, 8, 9, 10];

    useEffect(() => {
        fetchClassInsights();
    }, [selectedClass, assessmentType]);

    const fetchClassInsights = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8000/admin/progress/class-insights/${selectedClass}?assessment_type=${assessmentType}`
            );
            const data = await response.json();
            setClassData(data);
        } catch (error) {
            console.error('Error fetching class insights:', error);
        }
        setLoading(false);
    };

    return (
        <div className="progress-page">
            <div className="progress-header">
                <h1>Class {selectedClass} - Group Insights</h1>
                <div className="controls">
                    <select 
                        value={selectedClass} 
                        onChange={(e) => setSelectedClass(parseInt(e.target.value))}
                        className="class-select"
                    >
                        {classes.map(cls => (
                            <option key={cls} value={cls}>Class {cls}</option>
                        ))}
                    </select>
                    
                    <select 
                        value={assessmentType} 
                        onChange={(e) => setAssessmentType(e.target.value)}
                        className="assessment-select"
                    >
                        <option value="mocktest">Mock Tests</option>
                        <option value="quiz">Quick Practice</option>
                    </select>
                    
                    <button onClick={fetchClassInsights} className="refresh-btn">
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading">Loading insights...</div>
            ) : classData ? (
                <div className="insights-container">
                    {/* Class Summary */}
                    <div className="class-summary">
                        <div className="summary-card">
                            <h3>Total Students</h3>
                            <div className="count">{classData.students.length}</div>
                        </div>
                        <div className="summary-card">
                            <h3>Average Score</h3>
                            <div className="score">
                                {(
                                    classData.students.reduce((sum, student) => sum + student.average_score, 0) / 
                                    classData.students.length || 0
                                ).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="students-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Average Score</th>
                                    <th>Top Subject</th>
                                    <th>Completion Rate</th>
                                    <th>AI Insight</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classData.students.map((student) => (
                                    <tr key={student.student_id}>
                                        <td className="student-name">{student.student_name}</td>
                                        <td>{student.average_score.toFixed(1)}%</td>
                                        <td className="top-subject">{student.top_subject}</td>
                                        <td>{student.completion_rate.toFixed(1)}%</td>
                                        <td className={`ai-insight ${student.ai_insight.toLowerCase().replace(' ', '-')}`}>
                                            {student.ai_insight}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="no-data">No data available</div>
            )}
        </div>
    );
};

export default ProgressPage;