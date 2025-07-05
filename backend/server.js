// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.post('/generate-mcq', async (req, res) => {
  const topic = req.body.topic;

  const prompt = `Generate 200 tough, NEET-level multiple choice questions on the topic "${topic}". Each question must have 4 options, only one correct answer. Return as a JSON array like:
[
  {
    "question": "What is ...?",
    "options": ["A", "B", "C", "D"],
    "answer": "B"
  }
]`;

  try {
    const response = await axios.post("https://openrouter.ai/api/v1/chat/completions", {
      model: "deepseek/deepseek-r1-0528:free",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const reply = response.data.choices[0].message.content;
    const mcqs = JSON.parse(reply);
    res.json({ mcqs });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate MCQs." });
  }
});

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
