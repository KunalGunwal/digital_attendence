// public/front-end/src/TeacherDashboard.js
import React, { useState, useEffect } from 'react';

const TeacherDashboard = ({ teacherId, onLogout }) => {
    const [view, setView] = useState('home');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [students, setStudents] = useState([]);
    const [studentAttendanceData, setStudentAttendanceData] = useState({});
    const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

    const MARK_TEACHER_ATTENDANCE_URL = '/api/attendence_tracker/markTeacherAttendence';
    const RETRIEVE_STUDENTS_URL = '/api/attendence_tracker/retriveStudents';
    const MARK_STUDENT_ATTENDANCE_URL = '/api/attendence_tracker/markStuAttendence';

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    const hideMessage = () => {
        setMessage({ text: '', type: '' });
    };

    // --- FIX: handleMarkOwnAttendance function definition re-added ---
    const handleMarkOwnAttendance = async () => {
        hideMessage();
        try {
            const token = localStorage.getItem('teacherAuthToken');
            if (!token) {
                showMessage('Authentication token missing. Please log in again.', 'error');
                onLogout(); // Force logout if token is missing
                return;
            }

            const response = await fetch(MARK_TEACHER_ATTENDANCE_URL, { // Correct variable name used here
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({}) // Backend expects empty object or just headers
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage(data.message, 'success');
            } else {
                showMessage(data.message || 'Failed to mark own attendance.', 'error');
            }
        } catch (error) {
            console.error('Error marking teacher attendance:', error);
            showMessage('Network error while marking own attendance.', 'error');
        }
    };
    // --- END FIX: handleMarkOwnAttendance function definition ---

    // Retrieve Students for Attendance Marking
    const handleRetrieveStudents = async () => {
        hideMessage();
        try {
            const token = localStorage.getItem('teacherAuthToken');
            if (!token) {
                showMessage('Authentication token missing. Please log in again.', 'error');
                onLogout();
                return;
            }

            const response = await fetch(RETRIEVE_STUDENTS_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok && data.success) {
                if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                    setStudents(data.data);
                    setStudentAttendanceData({}); // Reset attendance data
                    setCurrentStudentIndex(0); // Start from the first student
                    setView('markStudents'); // Change view to student attendance form
                    showMessage(`Found ${data.data.length} students for attendance.`, 'success');
                } else {
                    showMessage('No students found for your class or data format incorrect.', 'info');
                    setStudents([]);
                    setView('home');
                }
            } else {
                showMessage(data.message || 'Failed to retrieve students.', 'error');
            }
        } catch (error) {
            console.error('Error retrieving students:', error);
            showMessage('Network error while retrieving students.', 'error');
        }
    };

    // Handle attendance status change for a student
    const handleStudentStatusChange = (studentId, status) => {
        console.log("Attempting to set attendance for:", studentId, "Status:", status);
        if (studentId) {
            setStudentAttendanceData(prevData => ({
                ...prevData,
                [studentId]: status
            }));
        } else {
            console.warn("Attempted to mark attendance with an undefined studentId.");
            showMessage("Error: Invalid student ID encountered.", "error");
        }
    };

    // Navigate to next student
    const handleNextStudent = () => {
        if (currentStudentIndex < students.length - 1) {
            setCurrentStudentIndex(prevIndex => prevIndex + 1);
        } else {
            showMessage('All students processed. Please submit attendance.', 'info');
        }
    };

    // Navigate to previous student
    const handlePreviousStudent = () => {
        if (currentStudentIndex > 0) {
            setCurrentStudentIndex(prevIndex => prevIndex - 1);
        }
    };

    // Submit Student Attendance to Backend
    const handleSubmitStudentAttendance = async () => {
        hideMessage();
        try {
            const token = localStorage.getItem('teacherAuthToken');
            if (!token) {
                showMessage('Authentication token missing. Please log in again.', 'error');
                onLogout();
                return;
            }

            if (Object.keys(studentAttendanceData).length === 0) {
                showMessage('No attendance marked for students.', 'error');
                return;
            }
            console.log("Submitting student attendance data:", studentAttendanceData);
            const response = await fetch(MARK_STUDENT_ATTENDANCE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(studentAttendanceData)
            });

            const data = await response.json();

            if (response.ok && data.success) {
                showMessage(data.message, 'success');
                setStudents([]);
                setStudentAttendanceData({});
                setCurrentStudentIndex(0);
                setView('home');
            } else {
                showMessage(data.message || 'Failed to submit student attendance.', 'error');
            }
        } catch (error) {
            console.error('Error submitting student attendance:', error);
            showMessage('Network error while submitting student attendance.', 'error');
        }
    };

    const currentStudent = students[currentStudentIndex];

    // DEBUG: Log currentStudent and its ID when rendered
    useEffect(() => {
        if (currentStudent) {
            console.log("Current Student being displayed:", currentStudent);
            console.log("Current Student ID:", currentStudent.studentId);
        } else {
            console.log("No current student to display (or students array is empty/loading).");
        }
    }, [currentStudent, students]);

    // --- Inline Styles (mimicking Tailwind classes) ---
    // Refined cardStyle to be applied to the inner card-like div
    const innerCardStyle = {
        background: 'white',
        padding: '2rem',
        borderRadius: '0.75rem',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
        maxWidth: '32rem', // Increased max-width for student list
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid #e5e7eb',
    };

    const buttonBaseStyle = {
        width: '100%',
        fontWeight: 'bold',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease-in-out',
        border: 'none',
        cursor: 'pointer',
    };

    const primaryButton = {
        ...buttonBaseStyle,
        backgroundColor: '#4f46e5', // indigo-600
        color: 'white',
    };
    const primaryButtonHover = { backgroundColor: '#4338ca' }; // indigo-700

    const secondaryButton = {
        ...buttonBaseStyle,
        backgroundColor: '#6b7280', // gray-600
        color: 'white',
    };
    const secondaryButtonHover = { backgroundColor: '#4b5563' }; // gray-700

    const successButton = {
        ...buttonBaseStyle,
        backgroundColor: '#10b981', // green-600
        color: 'white',
    };
    const successButtonHover = { backgroundColor: '#059669' }; // green-700

    const dangerButton = {
        ...buttonBaseStyle,
        backgroundColor: '#ef4444', // red-500
        color: 'white',
    };
    const dangerButtonHover = { backgroundColor: '#dc2626' }; // red-600

    const textInputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        outline: 'none',
        transition: 'box-shadow 0.2s',
        color: '#1f2937',
    };

    const messageBoxStyle = {
        padding: '0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        textAlign: 'center',
    };

    const studentCardStyle = {
        background: '#f9fafb', // gray-50
        padding: '1.5rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb', // gray-200
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', // shadow-sm
    };

    const selectStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        backgroundColor: 'white',
        outline: 'none',
        cursor: 'pointer',
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={innerCardStyle}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937' }}>
                    Teacher Dashboard - {teacherId}
                </h2>

                {message.text && (
                    <div style={{...messageBoxStyle, backgroundColor: message.type === 'error' ? '#fee2e2' : message.type === 'success' ? '#d1fae5' : '#e0f2fe', color: message.type === 'error' ? '#b91c1c' : message.type === 'success' ? '#065f46' : '#2563eb' }}>
                        {message.text}
                    </div>
                )}

                {view === 'home' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <button
                            onClick={handleMarkOwnAttendance}
                            style={primaryButton}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, primaryButtonHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, primaryButton)}
                        >
                            Mark My Own Attendance
                        </button>
                        <button
                            onClick={handleRetrieveStudents}
                            style={primaryButton}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, primaryButtonHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, primaryButton)}
                        >
                            Mark Student Attendance
                        </button>
                        <button
                            onClick={onLogout}
                            style={dangerButton}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, dangerButtonHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, dangerButton)}
                        >
                            Log Out
                        </button>
                    </div>
                )}

                {view === 'markStudents' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#374151' }}>
                            Mark Student Attendance
                        </h3>
                        {students.length > 0 && currentStudent ? (
                            <div style={studentCardStyle}>
                                <p style={{ fontWeight: 'bold', color: '#1f2937', fontSize: '1.125rem' }}>
                                    Student ID: {currentStudent.studentId}
                                </p>
                                <p style={{ color: '#4b5563' }}>
                                    Name: {currentStudent.studentName}
                                </p>
                                <p style={{ color: '#4b5563' }}>
                                    Class: {currentStudent.studentClass}
                                </p>
                                <select
                                    style={selectStyle}
                                    value={studentAttendanceData[currentStudent.studentId] || ''}
                                    onChange={(e) => handleStudentStatusChange(currentStudent.studentId, e.target.value)}
                                >
                                    <option value="">Select Status</option>
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                    <option value="excused">Excused</option>
                                    <option value="holiday">Holiday</option>
                                </select>

                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                                    <button
                                        onClick={handlePreviousStudent}
                                        disabled={currentStudentIndex === 0}
                                        style={{ ...secondaryButton, width: '48%', opacity: currentStudentIndex === 0 ? 0.5 : 1 }}
                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, secondaryButtonHover)}
                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, secondaryButton)}
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={handleNextStudent}
                                        disabled={currentStudentIndex === students.length - 1}
                                        style={{ ...primaryButton, width: '48%', opacity: currentStudentIndex === students.length - 1 ? 0.5 : 1 }}
                                        onMouseOver={(e) => Object.assign(e.currentTarget.style, primaryButtonHover)}
                                        onMouseOut={(e) => Object.assign(e.currentTarget.style, primaryButton)}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: '#4b5563' }}>
                                {students.length === 0 ? 'No students found for your class.' : 'Loading students...'}
                            </p>
                        )}

                        <button
                            onClick={handleSubmitStudentAttendance}
                            style={successButton}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, successButtonHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, successButton)}
                        >
                            Submit All Attendance
                        </button>
                        <button
                            onClick={() => setView('home')}
                            style={secondaryButton}
                            onMouseOver={(e) => Object.assign(e.currentTarget.style, secondaryButtonHover)}
                            onMouseOut={(e) => Object.assign(e.currentTarget.style, secondaryButton)}
                        >
                            Back to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
