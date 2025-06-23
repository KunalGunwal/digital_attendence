import React, { useState, useEffect, useRef } from 'react';

// MarkAttendance React Component
const MarkAttendance = ({ teacherJwtToken, loggedInTeacherId, onLogout }) => {
    // Refs for DOM elements
    const webcamVideoRef = useRef(null);
    const webcamCanvasRef = useRef(null);

    // State for UI messages
    const [message, setMessage] = useState({ text: '', type: '' });
    // State for camera stream management
    const [currentStream, setCurrentStream] = useState(null);
    // State for button loading/disabled states
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Utility Functions ---
    const displayMessage = (msg, type = 'info') => {
        setMessage({ text: msg, type: type });
    };

    const clearMessage = () => {
        setMessage({ text: '', type: '' });
    };

    // --- Camera Control Functions ---

    /**
     * Starts the device camera and displays the feed.
     */
    const startWebcam = async () => {
        clearMessage();
        displayMessage("Starting camera...", 'info');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (webcamVideoRef.current) {
                webcamVideoRef.current.srcObject = stream;
                webcamVideoRef.current.play();
            }
            setCurrentStream(stream);
            displayMessage("Camera ready. Click 'Mark My Attendance' to verify your face and mark attendance.", 'info');
        } catch (err) {
            console.error("Error accessing webcam:", err);
            displayMessage(
                "Error accessing camera: " + (err.name === "NotAllowedError" ? "Permission denied. Please allow camera access in your browser settings." : err.message || "Unknown error."),
                'error'
            );
        }
    };

    /**
     * Stops the device camera and releases resources.
     */
    const stopWebcam = () => {
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
            if (webcamVideoRef.current) {
                webcamVideoRef.current.srcObject = null;
            }
            setCurrentStream(null);
            displayMessage("Camera stopped.", 'info');
        }
    };

    /**
     * Effect to start webcam on component mount and stop on unmount.
     */
    useEffect(() => {
        startWebcam(); // Start camera automatically when component mounts

        // Cleanup function: stop camera when component unmounts
        return () => {
            stopWebcam();
        };
    }, []); // Empty dependency array ensures this runs once on mount/unmount

    // --- Attendance Marking Function ---

    /**
     * Captures a still image from the video feed and sends it to the backend for verification/attendance.
     */
    const captureAndSendAttendance = async () => {
        if (!currentStream || !webcamVideoRef.current || !webcamCanvasRef.current) {
            displayMessage("Camera not active. Please ensure camera is started.", 'error');
            return;
        }

        clearMessage();
        displayMessage("Capturing photo and sending for verification...", 'info');
        setIsProcessing(true); // Disable button during processing

        const video = webcamVideoRef.current;
        const canvas = webcamCanvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas dimensions to match the video stream's dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the current frame of the video onto the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get the image data from the canvas as a Base64 encoded JPEG string
        const capturedImageDataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 is quality (0-1)

        console.log("Captured image Base64 length:", capturedImageDataUrl.length, "bytes");

        // --- Backend API call details ---
        const verifyEndpoint = '/api/attendence_tracker/teacher/mark-attendance';

        if (!teacherJwtToken) {
            displayMessage("Authentication token missing. Please log in.", 'error');
            setIsProcessing(false);
            return;
        }

        const payload = {
            liveImage: capturedImageDataUrl, // The backend expects 'liveImage'
        };

        try {
            const response = await fetch(verifyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${teacherJwtToken}`
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                displayMessage(`Attendance Marked: ${data.message}`, 'success');
                console.log("Backend success:", data);
                stopWebcam(); // Stop camera after successful attendance marking
            } else {
                displayMessage(`Verification/Attendance Failed: ${data.message || 'Unknown error'} (Status: ${response.status})`, 'error');
                console.error("Backend error:", data);
                // If authentication error, prompt logout
                if (response.status === 401 || response.status === 403) {
                    displayMessage("Session expired or invalid. Please log in again.", 'error');
                    onLogout(); // Trigger logout in parent component
                }
            }
        } catch (error) {
            displayMessage("Network error or server unreachable. Check console for details.", 'error');
            console.error("Fetch error:", error);
        } finally {
            setIsProcessing(false); // Re-enable button
        }
    };

    return (
        <div className="container">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Mark My Attendance</h1>
            <p className="text-gray-700 text-base mb-4">Logged in as: <span className="font-semibold text-indigo-700">{loggedInTeacherId}</span></p>

            <div className="video-feed-wrapper">
                <video id="webcamVideo" ref={webcamVideoRef} autoPlay playsInline className="rounded-lg shadow-inner"></video>
                <canvas id="webcamCanvas" ref={webcamCanvasRef} className="hidden"></canvas>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
                <button
                    id="markAttendanceBtn"
                    className="btn-primary"
                    onClick={captureAndSendAttendance}
                    disabled={isProcessing || !currentStream} // Disable if processing or camera not active
                >
                    {isProcessing ? 'Processing...' : 'Mark My Attendance'}
                </button>
                <button
                    id="stopWebcamBtn"
                    className="btn-secondary"
                    onClick={stopWebcam}
                    disabled={!currentStream} // Disable if no stream is active
                >
                    Stop Camera
                </button>
            </div>

            {message.text && (
                <div className={`message-box mt-6 ${message.type === 'error' ? 'error' : (message.type === 'success' ? 'success' : 'info')}`}>
                    {message.text}
                </div>
            )}
        </div>
    );
};

export default MarkAttendance;
