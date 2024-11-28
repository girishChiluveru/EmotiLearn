import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const ChildResult = () => {
  const location = useLocation();
  const { childName, sessionId } = location.state;

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/reports/${childName}/${sessionId}`);
        setReport(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load report data.");
        setLoading(false);
      }
    };

    fetchReport();
  }, [childName, sessionId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  // Extract game scores and overall emotions
  const gameScores = report.scores.map(score => ({
    gameType: score.gameType,
    score: score.score,
  }));

  const overallEmotions = Object.entries(
    report.images.reduce((acc, image) => {
      Object.entries(image.emotions).forEach(([emotion, value]) => {
        acc[emotion] = (acc[emotion] || 0) + value;
      });
      return acc;
    }, {})
  ).map(([emotion, value]) => ({
    emotion,
    value,
  }));

  return (
    <div>
      <h1>Child Report</h1>
      <p><strong>Child Name:</strong> {childName}</p>
      <p><strong>Session ID:</strong> {sessionId}</p>

      <h2>Game Scores</h2>
      <BarChart width={600} height={300} data={gameScores}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="gameType" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="score" fill="#8884d8" />
      </BarChart>

      <h2>Overall Emotions</h2>
      <BarChart width={600} height={300} data={overallEmotions}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="emotion" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#82ca9d" />
      </BarChart>
    </div>
  );
};

export default ChildResult;
