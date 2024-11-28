const reports = require('../models/report'); 
const handleStoreEmotions = async (req, res) => {
    const { childName, sessionId, result } = req.body;

    if (!childName || !sessionId || !Array.isArray(result)) {
        return res.status(400).json({ error: 'childName, sessionId, and result array are required' });
    }

    try {
        // Find the report document
        const report = await reports.findOne({ childname: childName, sessionid: sessionId });

        if (!report) {
            return res.status(404).json({ error: 'No matching report found' });
        }

        // Update emotions for matching images
        result.forEach(({ file, emotions = {}, dominant_emotion, dominant_score }) => {
            const imagePath = `photos\\${childName}\\${sessionId}\\${file}`;
        
            // Find the corresponding image by imgpath
            const image = report.images.find(img => img.imgpath === imagePath);
        
            if (image) {
                // Safely parse emotion values with defaults
                image.emotions = {
                    angry: parseFloat(emotions.angry) || 0,
                    disgust: parseFloat(emotions.disgust) || 0,
                    fear: parseFloat(emotions.fear) || 0,
                    happy: parseFloat(emotions.happy) || 0,
                    sad: parseFloat(emotions.sad) || 0,
                    surprise: parseFloat(emotions.surprise) || 0,
                    neutral: parseFloat(emotions.neutral) || 0
                };
        
                // Handle max_emotion_img with default values
                image.max_emotion_img = {
                    emotion: dominant_emotion || 'neutral', // Default to 'neutral' if undefined
                    score: parseFloat(dominant_score) || 0 // Default to 0 if undefined
                };
            } else {
                console.warn(`Image not found for path: ${imagePath}`);
            }
        });
        

        // Mark the report as processed
        report.isProcessed = true;

        // Save the updated report document
        await report.save();

        res.status(200).json({ message: 'Emotions stored successfully and marked as processed', report });
    } catch (error) {
        console.error('Error updating emotions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { handleStoreEmotions };
