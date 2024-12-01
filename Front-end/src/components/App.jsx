/* eslint-disable no-unused-vars */
import { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Quiz from './Quiz';
import AnimalGame from './AnimalGame';
import MemoryGame from './MemoryGame';
import Report from './Report';
import ChildReport from './ChildReport';
import ChildLogin from './ChildLogin';
import AdminLogin from './AdminLogin';
import '../styles/App.css';

function App() {
  const [gameStage, setGameStage] = useState('start');
  const [isAdmin, setIsAdmin] = useState(false);
  const [childName, setChildName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [allSessions, setAllSessions] = useState([]);

  const handleAdminLogin = () => setIsAdmin(true);
  const handleStartQuiz = (name, sid) => {
    setChildName(name);
    setSessionId(sid);
    setGameStage('quiz');
  };
  const handleAddSession = (sessionData) => setAllSessions((prev) => [...prev, sessionData]);
  const postScores = async (scores) => {
    try {
      const response = await fetch('http://localhost:3000/store-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          childName,
          sessionId,
          scores, // scores should be an array of objects with gameType and score
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Scores stored successfully:', data);
    } catch (error) {
      console.error('Failed to store scores:', error);
    }
  };
  const renderQuiz = () => (
    <Quiz
      onQuizEnd={(score, expressionTally) => {
        handleAddSession({ childName, sessionId, quizScore: score, expressionTally });
        postScores([{ gameType: 'Quiz Game', score }]);
        setGameStage('animalGame');
      }}
      childName={childName}
      sessionId={sessionId}
    />
  );

  const renderAnimalGame = () => (
    <AnimalGame
      onFinish={(score) => {
        setAllSessions((prev) =>
          prev.map((session) =>
            session.sessionId === sessionId ? { ...session, animalGameScore: score } : session
          )
        );
        postScores([{ gameType: 'Animal Game', score }]);
        setGameStage('memoryGame');
      }}
      childName={childName}
      sessionId={sessionId}
    />
  );

  const renderMemoryGame = () => (
    <MemoryGame
      onFinish={(score) => {
        setAllSessions((prev) =>
          prev.map((session) =>
            session.sessionId === sessionId ? { ...session, memoryGameScore: score } : session
          )
        );
        setGameStage('start');
        postScores([{ gameType: 'Memory Game', score }]);
      }}
      childName={childName}
      sessionId={sessionId}
    />
  );

  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element ={<Navigate to ='/child-login' />}/>
          <Route path="/child-login" element={<ChildLogin onStartQuiz={handleStartQuiz} />} />
          <Route path="/admin-login" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />
          <Route path="/child-report" element={<ChildReport />} />
          <Route path="/quiz" element={renderQuiz()} />
          <Route path="/animal-game" element={renderAnimalGame()} />
          <Route path="/memory-game" element={renderMemoryGame()} />
          <Route path="/report" element={<Report allSessions={allSessions} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
