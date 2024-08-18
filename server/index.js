import express from 'express';
import cors from 'cors';
import Axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;



app.use(cors());
app.use(express.json());

// Validate request data
const validateRequest = (req) => {
    const { code, language, input } = req.body;
    if (!code || !language || !input) {
        return { valid: false, message: "Missing required fields: code, language, or input" };
    }
    return { valid: true };
};

app.post("/compile", async (req, res) => {
    const validation = validateRequest(req);
    if (!validation.valid) {
        return res.status(400).send({ error: validation.message });
    }

    const { code, language, input } = req.body;

    const languageMap = {
        "c": { language: "c", version: "10.2.0" },
        "cpp": { language: "c++", version: "10.2.0" },
        "python": { language: "python", version: "3.10.0" },
        "java": { language: "java", version: "15.0.2" }
    };

    if (!languageMap[language]) {
        return res.status(400).send({ error: "Unsupported language" });
    }

    const data = {
        language: languageMap[language].language,
        version: languageMap[language].version,
        files: [{ name: "main", content: code }],
        stdin: input
    };

    const config = {
        method: 'post',
        url: 'https://emkc.org/api/v2/piston/execute',
        headers: { 'Content-Type': 'application/json' },
        data
    };

    try {
        const response = await Axios(config);
        res.json(response.data.run);
    } catch (error) {
        console.error('Error during code execution:', error.response ? error.response.data : error.message);
        res.status(500).send({ error: "Something went wrong" });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
