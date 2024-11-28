import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import "../styles/ChildLogin.css"; // In ChildLogin.js



const ChildLogin = ({ onStartQuiz }) => {
  const navigate = useNavigate();
  const [childName, setChildName] = useState('');

  const handlePlayGame = async (e) => {
    e.preventDefault();
    if (childName.trim() !== '') {
      const sessionId = uuidv4(); // Generate unique session ID using UUID
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            childName,
            sessionId,
          }),
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Session started successfully:', data);
        onStartQuiz(childName, sessionId); // Call the onStartQuiz function after successful API call
        navigate('/quiz');
      } catch (error) {
        console.error('Failed to start session:', error);
      }
    }
  };

  const navigateToAdmin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="start-screen">
      <h1>Child Login</h1>
      <form onSubmit={handlePlayGame}>
        <label htmlFor="childName">Enter child name:</label>
        <input
          type="text"
          id="childName"
          name="childName"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <button
        type="button"
        className="admin-login-button"
        onClick={navigateToAdmin}
      >
        Navigate to Admin Login
      </button>
    </div>
  );
};

export default ChildLogin;
