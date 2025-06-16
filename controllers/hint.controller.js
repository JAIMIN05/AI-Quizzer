const { Groq } = require('groq-sdk');

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

async function generateHint(req, res) {
    try {
        const { questionText } = req.body;

        if (!questionText) {
            return res.status(400).json({
                success: false,
                message: 'Question text is required'
            });
        }

        const prompt = `Generate a concise and helpful hint for the following question:
        Question: "${questionText}"

        Provide a clear hint that:
        1. Guides student's thinking
        2. Does not reveal the answer
        3. Is under 2-3 sentences
        4. Focuses on key concepts

        Return only the hint text without any additional formatting.`;

        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: prompt
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.5,
            max_tokens: 150,
            stream: false
        });

        const hint = completion.choices[0]?.message?.content?.trim();

        // Format the response in a cleaner way
        res.json({
            success: true,
            data: {
                question: {
                    text: questionText,
                    hint: hint
                }
            }
        });

    } catch (error) {
        console.error('Hint Generation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating hint',
            error: error.message
        });
    }
}

module.exports = { generateHint };