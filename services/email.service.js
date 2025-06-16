const nodemailer = require('nodemailer');
const { Groq } = require('groq-sdk');

// Initialize Groq
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// Email configuration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    debug: true // Enable debugging
});

// Verify email configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email Config Error:', error);
    } else {
        console.log('SMTP server is ready to send emails');
    }
});

async function getAISuggestions(wrongQuestions) {
    try {
        const prompt = `Based on these incorrect questions, suggest two specific ways the student can improve:
        Wrong Questions: ${wrongQuestions.join('\n')}
        
        Provide clear, actionable suggestions focused on learning strategies.`;

        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: prompt
            }],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.7,
            max_tokens: 200
        });

        return completion.choices[0]?.message?.content?.trim();
    } catch (error) {
        console.error('AI Suggestions Error:', error);
        return 'Unable to generate personalized suggestions at this time.';
    }
}

async function sendQuizResults(userEmail, quizResults) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
        throw new Error('Email configuration missing in .env file');
    }

    try {
        const {
            score,
            total,
            correctAnswers,
            wrongAnswers
        } = quizResults;

        // Generate AI suggestions
        const suggestions = await getAISuggestions(wrongAnswers.map(q => q.questionText));

        // Create email content
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2c3e50; text-align: center;">Your Quiz Results</h1>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #2c3e50; margin-bottom: 10px;">Score Summary</h2>
                    <p style="font-size: 18px; color: #2c3e50;">
                        Score: ${score}/${total} (${((score/total) * 100).toFixed(2)}%)
                    </p>
                </div>

                <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #2e7d32;">Correct Answers (${correctAnswers.length})</h2>
                    ${correctAnswers.map(q => `
                        <div style="margin: 15px 0; padding: 10px; background-color: white; border-radius: 5px;">
                            <p style="margin: 5px 0;"><strong>Question:</strong> ${q.questionText}</p>
                            <p style="margin: 5px 0; color: #2e7d32;"><strong>Your Answer:</strong> ${q.userResponse}</p>
                        </div>
                    `).join('')}
                </div>

                <div style="background-color: #fbe9e7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #c62828;">Areas for Improvement (${wrongAnswers.length})</h2>
                    ${wrongAnswers.map(q => `
                        <div style="margin: 15px 0; padding: 10px; background-color: white; border-radius: 5px;">
                            <p style="margin: 5px 0;"><strong>Question:</strong> ${q.questionText}</p>
                            <p style="margin: 5px 0; color: #c62828;"><strong>Your Answer:</strong> ${q.userResponse}</p>
                            <p style="margin: 5px 0; color: #2e7d32;"><strong>Correct Answer:</strong> ${q.correctAnswer}</p>
                        </div>
                    `).join('')}
                </div>

                <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <h2 style="color: #1565c0;">Study Suggestions</h2>
                    <div style="margin: 10px 0;">
                        <h3 style="color: #1565c0; margin: 10px 0;">Key Areas to Focus On:</h3>
                        <ul style="list-style-type: none; padding-left: 0;">
                            ${wrongAnswers.map(q => `
                                <li style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 5px;">
                                    <p style="margin: 5px 0;"><strong>Topic:</strong> ${q.questionText}</p>
                                    <p style="margin: 5px 0; color: #1565c0;">
                                        <strong>Suggestion:</strong> Review the concepts related to this question and practice similar problems.
                                    </p>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 20px; color: #666;">
                    <p>Keep practicing and you'll improve! 💪</p>
                </div>
            </div>
        `;

        const mailOptions = {
            from: `"Quiz System" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Your Quiz Results',
            html: emailContent
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${userEmail}`);
        return true;

    } catch (error) {
        console.error('Email Send Error:', {
            message: error.message,
            code: error.code,
            response: error.response
        });
        throw new Error(`Failed to send email: ${error.message}`);
    }
}

module.exports = { sendQuizResults };