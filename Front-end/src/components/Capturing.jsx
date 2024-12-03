/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import html2canvas from 'html2canvas';

const Capturing = ({ 
    childName, 
    sessionId, 
    gameId, 
    captureInterval = 4000, 
    uploadUrl = 'http://localhost:3000/photos' 
}) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const timerRef = useRef(null);
    const streamRef = useRef(null); // Reference to the video stream
    const [startTime, setStartTime] = useState(Date.now());

    useEffect(() => {
        if (!childName || !sessionId || !gameId) {
            alert("Missing required session information. Please log in again.");
            return;
        }

        navigator.mediaDevices.getUserMedia({ video: true })
            .then((stream) => {
                videoRef.current.srcObject = stream;
                streamRef.current = stream; // Store the stream reference
                setStartTime(Date.now());
                startCapture();
            })
            .catch((error) => console.error("Video capture error:", error));

        return () => stopCapture();
    }, [childName, sessionId, gameId]);

    const startCapture = () => {
        timerRef.current = setInterval(() => {
            captureBoth();
        }, captureInterval);
    };

    const stopCapture = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null; // Clear the stream reference
        }
    };

    const captureBoth = async () => {
        if (canvasRef.current && videoRef.current) {
            // Capture video frame
            const context = canvasRef.current.getContext('2d');
            context.drawImage(videoRef.current, 0, 0, 640, 480);
            const photoData = canvasRef.current.toDataURL('image/png');

            // Capture screenshot
            const screenshotData = await html2canvas(document.body).then((canvas) =>
                canvas.toDataURL('image/png')
            );

            const timeElapsed = Math.floor((Date.now() - startTime) / 1000);
            const photoFilename = `img-${gameId}-${timeElapsed}.png`;
            const screenshotFilename = `screenshot-${gameId}-${timeElapsed}.png`;

            uploadImage(photoData, photoFilename);
            uploadImage(screenshotData, screenshotFilename);
        }
    };

    const uploadImage = (imageData, filename) => {
        fetch(uploadUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imageData,
                filename: filename,
                childName: childName,
                sessionId: sessionId,
                gameId: gameId
            })
        })
            .then((response) => response.json())
            .then((data) => console.log('Upload response:', data))
            .catch((error) => console.error('Upload error:', error));
    };

    return (
        <div>
            <video ref={videoRef} autoPlay style={{ display: 'none' }} />
            <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />
        </div>
    );
};

Capturing.propTypes = {
    childName: PropTypes.string.isRequired,
    sessionId: PropTypes.string.isRequired,
    gameId: PropTypes.string.isRequired,
    captureInterval: PropTypes.number,
    uploadUrl: PropTypes.string
};

export default Capturing;
