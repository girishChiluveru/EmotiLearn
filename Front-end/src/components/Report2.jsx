/* eslint-disable react/prop-types */
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import '../styles/Report.css';

function Report({ allSessions, onViewSessionReport, selectedSession, onBackToHome }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSessions = allSessions.filter(session =>
    session.sessionId.includes(searchTerm)
  );

  const getScoreData = (session) => [
    { activity: 'Quiz', value: session.quizScores.reduce((a, b) => a + b, 0) },
    { activity: 'Animal Game', value: session.animalGameScore },
    { activity: 'Memory Game', value: session.memoryGameScore }
  ];

  const getExpressionData = (session) => [
    { activity: 'Quiz', value: session.expressionTally.quiz },
    { activity: 'Animal Game', value: session.expressionTally.animalGame },
    { activity: 'Memory Game', value: session.expressionTally.memoryGame }
  ];

  return (
    <div className="report-container">
      <h2>All Sessions</h2>
      <input
        type="text"
        placeholder="Search by Session ID"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <table className="session-table">
        <thead>
          <tr>
            <th>Session ID</th>
            <th>Quiz Total Score</th>
            <th>Animal Game Score</th>
            <th>Memory Game Score</th>
            <th>Expression Tally</th>
            <th>View Details</th>
          </tr>
        </thead>
        <tbody>
          {filteredSessions.map((session) => (
            <tr key={session.sessionId}>
              <td>{session.sessionId}</td>
              <td>{session.quizScores.reduce((a, b) => a + b, 0)}</td>
              <td>{session.animalGameScore}</td>
              <td>{session.memoryGameScore}</td>
              <td>{session.expressionTally.quiz + session.expressionTally.animalGame + session.expressionTally.memoryGame}</td>
              <td>
                <button onClick={() => onViewSessionReport(session)}>View Report</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {selectedSession && (
        <div className="session-detail">
          <h3>Session ID: {selectedSession.sessionId}</h3>
          <div className="charts">
            <div className="chart">
              <h4>Scores by Activity</h4>
              <BarChart width={400} height={200} data={getScoreData(selectedSession)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </div>
            <div className="chart">
              <h4>Expression Tally by Activity</h4>
              <BarChart width={400} height={200} data={getExpressionData(selectedSession)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="activity" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </div>
          </div>
          <table className="session-detail-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Score</th>
                <th>Expression Tally</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Quiz</td>
                <td>{selectedSession.quizScores.reduce((a, b) => a + b, 0)}</td>
                <td>{selectedSession.expressionTally.quiz}</td>
              </tr>
              <tr>
                <td>Animal Game</td>
                <td>{selectedSession.animalGameScore}</td>
                <td>{selectedSession.expressionTally.animalGame}</td>
              </tr>
              <tr>
                <td>Memory Game</td>
                <td>{selectedSession.memoryGameScore}</td>
                <td>{selectedSession.expressionTally.memoryGame}</td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => onViewSessionReport(null)}>Close Report</button>
        </div>
      )}

      <button onClick={onBackToHome}>Back to Home</button>
    </div>
  );
}

export default Report;
