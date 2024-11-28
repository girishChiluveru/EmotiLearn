const reports = require('../models/report');

const handleStoreScores = async (req, res) => {
    const { childName, sessionId, scores } = req.body;

    if (!childName || !sessionId || !Array.isArray(scores)) {
        return res.status(400).json({ error: 'childName, sessionId, and scores array are required' });
    }

    try {
        // Find the report document
        const report = await reports.findOne({ childname: childName, sessionid: sessionId });

        if (!report) {
            return res.status(404).json({ error: 'No matching report found' });
        }

        // Update the scores
        report.scores.push(...scores); // Append new scores // Assuming scores is an array of objects with gameType and score
        await report.save();

        res.status(200).json({ message: 'Scores stored successfully', report });
    } catch (error) {
        console.error('Error updating scores:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { handleStoreScores };