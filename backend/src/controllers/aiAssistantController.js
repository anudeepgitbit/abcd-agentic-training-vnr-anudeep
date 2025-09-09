const geminiService = require('../services/geminiService');
const pdf = require('pdf-parse');
const fs = require('fs').promises;

const chatWithAI = async (req, res) => {
  try {
    const { message, context } = req.body;
    const user = req.user;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Prepare context for AI with file attachments
    let enhancedMessage = message;
    
    // Process file attachments if present
    if (context?.attachments && context.attachments.length > 0) {
      const attachmentContext = context.attachments.map(attachment => {
        if (attachment.type.startsWith('image/')) {
          return `[Image: ${attachment.name}] - Please analyze this image and answer questions about it.`;
        } else if (attachment.type === 'application/pdf') {
          return `[PDF Document: ${attachment.name}]\nContent: ${attachment.content.substring(0, 4000)}...`;
        }
        return `[File: ${attachment.name}]`;
      }).join('\n\n');
      
      enhancedMessage = `${attachmentContext}\n\nUser Question: ${message}`;
    }

    const aiContext = {
      userRole: user.role,
      subject: context?.subject,
      previousMessages: context?.previousMessages || [],
      hasAttachments: context?.attachments && context.attachments.length > 0
    };

    // Generate AI response
    const response = await geminiService.generateResponse(enhancedMessage, aiContext);

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate AI response'
    });
  }
};

const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty = 'medium', questionCount = 5 } = req.body;
    const user = req.user;

    // Only teachers can generate quizzes
    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can generate quizzes'
      });
    }

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }

    const quiz = await geminiService.generateQuiz(topic, difficulty, questionCount);

    res.json({
      success: true,
      data: quiz
    });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate quiz'
    });
  }
};

const generateMaterialSummary = async (req, res) => {
  try {
    const { content, materialType } = req.body;
    const user = req.user;

    if (user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can generate material summaries'
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const summary = await geminiService.generateMaterialSummary(content, materialType);

    res.json({
      success: true,
      data: {
        summary,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Material summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate material summary'
    });
  }
};

const extractTextFromFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const file = req.file;
    let extractedText = '';

    if (file.mimetype === 'application/pdf') {
      try {
        // Download file from Cloudinary if it's stored there
        let fileBuffer;
        if (file.path && file.path.startsWith('http')) {
          // File is stored in Cloudinary, download it
          const response = await fetch(file.path);
          const arrayBuffer = await response.arrayBuffer();
          fileBuffer = Buffer.from(arrayBuffer);
        } else {
          // File is local, read it
          fileBuffer = await fs.readFile(file.path);
        }

        const pdfData = await pdf(fileBuffer);
        extractedText = pdfData.text;
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return res.status(500).json({
          success: false,
          message: 'Failed to extract text from PDF'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Only PDF files are supported for text extraction.'
      });
    }

    res.json({
      success: true,
      data: {
        text: extractedText,
        filename: file.originalname,
        fileSize: file.size
      }
    });
  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process file'
    });
  }
};

module.exports = {
  chatWithAI,
  generateQuiz,
  generateMaterialSummary,
  extractTextFromFile
};
