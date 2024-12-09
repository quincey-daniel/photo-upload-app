import express from 'express';
import cors from 'cors';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/analyze-image', async (req, res) => {
    console.log('Received image analysis request');
    console.log('API Key check:', {
        exists: !!process.env.VITE_CLAUDE_API_KEY,
        keyLength: process.env.VITE_CLAUDE_API_KEY?.length,
        startsWithCorrectPrefix: process.env.VITE_CLAUDE_API_KEY?.startsWith('sk-ant-api')
    });

    try {
        // Updated the anthropic-version to the correct value
        const response = await axios.post('https://api.anthropic.com/v1/messages', req.body, {
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.VITE_CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'  // Changed this line to use the correct version
            }
        });

        console.log('Successfully received response from Claude API');
        res.json(response.data);

    } catch (error) {
        console.error('Detailed error information:', {
            errorName: error.name,
            errorMessage: error.message,
            apiResponse: error.response?.data,
            apiStatus: error.response?.status,
            apiStatusText: error.response?.statusText
        });

        res.status(500).json({
            error: 'Failed to process image',
            details: error.response?.data || error.message,
            message: `API request failed: ${error.response?.status || 500} - ${error.message}`
        });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Environment configuration check:');
    console.log('- API Key configured:', !!process.env.VITE_CLAUDE_API_KEY);
    console.log('- API Key format:', process.env.VITE_CLAUDE_API_KEY?.startsWith('sk-ant-api') ? 'correct' : 'incorrect');
});