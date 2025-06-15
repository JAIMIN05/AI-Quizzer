const Submission = require('../models/submission.model');
const Quiz = require('../models/quiz.model');
const redisService = require('../services/redis.service');

async function getQuizHistory(req, res) {
    try {
        const { grade, subject, minScore, from, to, userId } = req.query;

        // Generate cache key including userId if provided
        const cacheKey = `quizHistory:${userId || 'all'}:${JSON.stringify(req.query)}`;

        // Check cache first
        const cachedResult = await redisService.getCachedHistory(cacheKey);
        if (cachedResult) {
            return res.json({
                success: true,
                data: cachedResult,
                source: 'cache'
            });
        }

        // Build query filters
        const filters = {};
        
        // Add userId filter if provided
        if (userId) {
            filters.userId = userId;
        }

        // Add date range filters if provided
        if (from || to) {
            filters.submittedAt = {};
            if (from) filters.submittedAt.$gte = new Date(from);
            if (to) filters.submittedAt.$lte = new Date(to);
        }

        // Add score filter if provided
        if (minScore) {
            filters.score = { $gte: parseInt(minScore) };
        }

        // Fetch submissions with quiz details
        const submissions = await Submission.find(filters)
            .sort({ submittedAt: -1 })
            .lean();

        // Get unique quiz IDs
        const quizIds = [...new Set(submissions.map(s => s.quizId))];
        
        // Fetch quiz details with grade and subject filters
        const quizzesFilter = {
            _id: { $in: quizIds }
        };
        
        if (grade) quizzesFilter.grade = parseInt(grade);
        if (subject) quizzesFilter.subject = subject;

        const quizzes = await Quiz.find(quizzesFilter, 'subject grade difficulty')
            .lean();

        // Map quiz details to submissions
        const history = submissions.map(submission => {
            const quiz = quizzes.find(q => q._id.equals(submission.quizId));
            if (!quiz) return null;

            return {
                submissionId: submission._id,
                quizId: submission.quizId,
                userId: submission.userId, // Include userId in response
                submittedAt: submission.submittedAt,
                score: submission.score,
                total: submission.total,
                percentage: ((submission.score / submission.total) * 100).toFixed(2),
                subject: quiz.subject,
                grade: quiz.grade,
                difficulty: quiz.difficulty
            };
        }).filter(Boolean);

        // Cache the result
        await redisService.setCachedHistory(cacheKey, history);

        res.json({
            success: true,
            data: history,
            source: 'database'
        });

    } catch (error) {
        console.error('Quiz History Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz history',
            error: error.message
        });
    }
}

module.exports = { getQuizHistory };