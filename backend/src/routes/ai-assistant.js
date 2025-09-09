const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  chatWithAI,
  generateQuiz,
  generateMaterialSummary,
  extractTextFromFile
} = require('../controllers/aiAssistantController');

// All AI assistant routes require authentication
router.use(authenticate);

// POST /api/ai-assistant/chat - Chat with AI assistant
router.post('/chat', chatWithAI);

// POST /api/ai-assistant/generate-quiz - Generate quiz (teachers only)
router.post('/generate-quiz', generateQuiz);

// POST /api/ai-assistant/generate-summary - Generate material summary (teachers only)
router.post('/generate-summary', generateMaterialSummary);

// POST /api/ai-assistant/extract-text - Extract text from uploaded files
router.post('/extract-text', upload.single('file'), extractTextFromFile);

module.exports = router;
