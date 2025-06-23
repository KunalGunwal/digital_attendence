// public/front-end/src/Login.js
import React, { useState, useEffect } from 'react';
import TeacherDashboard from './teacherDashboard.jsx'; // IMPORTANT: Make sure this path is correct

const Login = () => {
    // State variables for form inputs
    const [teacherId, setTeacherId] = useState('');
    const [password, setPassword] = useState('');

    // State variables for UI feedback and authentication status
    const [message, setMessage] = useState({ text: '', type: '' });
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInTeacherId, setLoggedInTeacherId] = useState('');

    // Backend API endpoint for login
    const LOGIN_API_URL = '/api/attendence_tracker/loginTeacher';

    // --- Utility Functions ---

    // Function to display messages to the user
    const showMessage = (text, type) => {
        setMessage({ text, type });
        // Optional: clear message after some time (already implemented in TeacherDashboard too)
        setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    };

    // Function to clear messages
    const hideMessage = () => {
        setMessage({ text: '', type: '' });
    };

    // Function to update authentication state and UI based on localStorage
    const updateAuthState = () => {
        const token = localStorage.getItem('teacherAuthToken');
        const storedTeacherId = localStorage.getItem('loggedInTeacherId');

        if (token && storedTeacherId) {
            setIsLoggedIn(true);
            setLoggedInTeacherId(storedTeacherId);
        } else {
            setIsLoggedIn(false);
            setLoggedInTeacherId('');
            // Clear form inputs only when logging out or not logged in initially
            setTeacherId('');
            setPassword('');
        }
        hideMessage(); // Clear messages on state change
    };

    // Effect hook to run once on component mount to check initial login status
    useEffect(() => {
        updateAuthState();
    }, []); // Empty dependency array means this runs only once after initial render

    // --- Event Handlers ---

    // Handles the login button click
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        hideMessage(); // Clear previous messages

        if (!teacherId || !password) {
            showMessage('Please enter both Teacher ID and Password.', 'error');
            return;
        }

        try {
            // Send login request to your Node.js backend
            const response = await fetch(LOGIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teacherId, password }),
            });

            const data = await response.json(); // Parse the JSON response

            if (response.ok) { // Check if the HTTP status code is 2xx
                if (data.success) {
                    // Login successful: Store token and teacher ID
                    localStorage.setItem('teacherAuthToken', data.data.token);
                    localStorage.setItem('loggedInTeacherId', data.data.teacher.teacherId);
                    showMessage(data.message, 'success');
                    updateAuthState(); // Update UI to show logged-in state
                } else {
                    // API returned success: false (e.g., custom error from ApiError)
                    showMessage(data.message || 'Login failed: Unknown error.', 'error');
                }
            } else {
                // HTTP error status (e.g., 400, 401, 404, 500)
                showMessage(data.message || `Login failed with status: ${response.status}`, 'error');
            }
        } catch (error) {
            // Network error or other unexpected issues
            console.error('Login request failed:', error);
            showMessage('Network error. Please check your connection or server status.', 'error');
        }
    };

    // Passed to TeacherDashboard for logout functionality
    const handleLogout = () => {
        localStorage.removeItem('teacherAuthToken'); // Remove token
        localStorage.removeItem('loggedInTeacherId'); // Remove teacher ID
        showMessage('You have been logged out successfully.', 'success');
        updateAuthState(); // Update UI to show logged-out state
    };

    // --- Render Logic ---
    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #e0e7ff, #ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: 'white', padding: '2rem', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', maxWidth: '24rem', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid #e5e7eb' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#1f2937', marginBottom: '1rem' }}>
                    Teacher Login
                </h1>
                <p style={{ color: '#4b5563', fontSize: '1.125rem' }}>
                    Access your attendance management system.
                </p>

                {message.text && (
                    <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', textAlign: 'center', backgroundColor: message.type === 'error' ? '#fee2e2' : '#d1fae5', color: message.type === 'error' ? '#b91c1c' : '#065f46' }}>
                        {message.text}
                    </div>
                )}

                {!isLoggedIn ? (
                    // Login Form
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            id="teacherId"
                            placeholder="Teacher ID"
                            required
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 0.2s', color: '#1f2937' }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                        <input
                            type="password"
                            id="password"
                            placeholder="Password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', outline: 'none', transition: 'box-shadow 0.2s', color: '#1f2937' }}
                            onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.5)'}
                            onBlur={(e) => e.target.style.boxShadow = 'none'}
                        />
                        <button
                            type="submit"
                            style={{ width: '100%', backgroundColor: '#4f46e5', color: 'white', fontWeight: 'bold', padding: '0.75rem 1rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', transition: 'all 0.3s ease-in-out', border: 'none', cursor: 'pointer' }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
                        >
                            Log In
                        </button>
                    </form>
                ) : (
                    // Render TeacherDashboard if logged in
                    <TeacherDashboard teacherId={loggedInTeacherId} onLogout={handleLogout} />
                )}
            </div>
        </div>
    );
};

export default Login;