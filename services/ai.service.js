const { Groq } = require('groq-sdk');
require('dotenv').config();

// Initialize Groq with explicit API key
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || ''
});

// Verify API key is available
if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables');
    process.exit(1);
}

const QUIZ_PROMPT_TEMPLATE = `
Generate a quiz with the following specifications:
- Grade Level: {grade}
- Subject: {subject}
- Difficulty: {difficulty}
- Number of Questions: {totalQuestions}

Return ONLY a JSON object with this exact structure:
{
  "title": "{subject} Quiz - Grade {grade}",
  "questions": [
    {
      "questionText": "Question here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": "Correct option here"
    }
  ]
}`;

async function generateQuiz(grade, subject, difficulty, totalQuestions) {
    try {
        const prompt = QUIZ_PROMPT_TEMPLATE
            .replace('{grade}', grade)
            .replace('{subject}', subject)
            .replace('{difficulty}', difficulty)
            .replace('{totalQuestions}', totalQuestions);

        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: prompt
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 2048,
            stream: false,
            response_format: { type: "json_object" }
        });

        const result = completion.choices[0]?.message?.content;
        return JSON.parse(result);
    } catch (error) {
        console.error('Quiz Generation Error:', error);
        throw new Error('Failed to generate quiz: ' + error.message);
    }
}

module.exports = { generateQuiz };