// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const { connectToMongoDB } = require('./connection');
const resultRoutes=require('./routes/result');
const loginRoutes = require('./routes/login');
const photoRoutes = require('./routes/photos');
const reportRoutes = require('./routes/report1');
const processRoutes = require('./routes/process');
const analyzeRoutes = require('./routes/analyze');
const emotionRoutes = require('./routes/storeEmotions');
const storeScoresRoutes = require('./routes/storeScores');

const app = express();
const PORT = 3000;

// app.use("/photos",express.static(path.join(__dirname+"photos/")));
app.use('/hyd', express.static(path.join(__dirname, 'photos')));

connectToMongoDB("mongodb+srv://GirishChiluveru:admin@cluster0.ytwmf.mongodb.net/?retryWrites=true&w=majority")
.then(()=>console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));


app.use(cors({
    origin: 'http://localhost:5173'  // Frontend origin
}));



// Middleware setup
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/results',resultRoutes);
app.use('/login', loginRoutes);
app.use('/photos', photoRoutes);
app.use('/reports', reportRoutes);
app.use('/process', processRoutes);
app.use('/analyze', analyzeRoutes);
app.use('/store-emotions', emotionRoutes);
app.use('/store-scores', storeScoresRoutes);
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    
});