// services/geminiService.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * For general chat conversations. Responds in Markdown.
   */
  async generateResponse(message, context = {}) {
    try {
      const { userRole, subject, previousMessages, hasAttachments } = context;
      const markdownInstruction = `\n\n**IMPORTANT**: Always format your response using Markdown. Use headings, bold text, lists, and other formatting elements to create a clear, readable, and well-structured response.`;

      let systemPrompt = '';
      if (userRole === 'teacher') {
        systemPrompt = `You are an AI assistant helping a teacher with educational tasks. You can help with creating assignments, generating quiz questions, explaining concepts, providing teaching strategies, and analyzing student performance. Be professional and educational.`;
        if (hasAttachments) {
          systemPrompt += ` You can also analyze uploaded files including PDFs and images to help with educational content.`;
        }
        systemPrompt += markdownInstruction;
      } else {
        systemPrompt = `You are an AI tutor helping a student learn. You can explain concepts, help with homework, provide study tips, and answer questions. Be encouraging, clear, and educational. Break down complex topics into simple steps.`;
        if (hasAttachments) {
          systemPrompt += ` You can analyze uploaded files like PDFs and images to help explain concepts and answer questions about the content.`;
        }
        systemPrompt += markdownInstruction;
      }

      // Add context about file analysis if attachments are present
      if (hasAttachments) {
        systemPrompt += `\n\n**File Analysis Instructions**: When analyzing uploaded files, provide detailed explanations about the content. For PDFs, summarize key points and answer questions about the text. For images, describe what you see and relate it to the educational context.`;
      }

      const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

      const result = await this.model.generateContent(fullPrompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * [NEW AND IMPROVED] Generates quiz questions as a structured JSON array, personalized for the teacher.
   */
  async generateQuizQuestionsAsJson(topic, questionCount = 5, teacherContext = {}) {
    try {
      let contextInstruction = "You are an expert quiz generator for a sophisticated educational platform.";
      if (teacherContext.name) {
        contextInstruction += ` You are assisting a teacher named ${teacherContext.name}.`;
      }
      if (teacherContext.subjects && teacherContext.subjects.length > 0) {
        contextInstruction += ` They primarily teach ${teacherContext.subjects.join(' and ')}.`;
      }
      if (teacherContext.gradeLevels && teacherContext.gradeLevels.length > 0) {
        contextInstruction += ` The quiz must be tailored for ${teacherContext.gradeLevels.join(' and ')} grade students.`;
      } else {
        contextInstruction += ` The quiz should be tailored for a general high school level.`;
      }

      const prompt = `
        ${contextInstruction}

        Generate a quiz about the topic: "${topic}".
        Create exactly ${questionCount} multiple-choice questions. The difficulty, vocabulary, and complexity of the questions must be appropriate for the specified grade level(s).

        **CRITICAL**: Your output must be ONLY a single, valid JSON array of objects. Do not include any other text, explanation, or markdown formatting like \`\`\`json. Your entire response must start with '[' and end with ']'.
        
        The JSON array must follow this exact structure:
        [
          {
            "question": "The text of the first question",
            "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
            "correctAnswerIndex": 0
          }
        ]
      `;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      } else {
        console.error("Invalid JSON response from AI:", text);
        throw new Error('Failed to generate valid JSON for the quiz.');
      }
    } catch (error) {
      console.error('Quiz JSON generation error:', error);
      throw new Error('Failed to generate quiz questions as JSON');
    }
  }

  /**
   * Generates a quiz with formatted text and structured questions
   */
  async generateQuiz(topic, difficulty = 'medium', questionCount = 5) {
    try {
      const prompt = `
        Generate a ${difficulty} difficulty quiz about "${topic}" with ${questionCount} questions.
        
        Create a comprehensive quiz that includes:
        1. A mix of multiple choice questions (4 options each)
        2. Short answer questions
        3. Clear, educational content appropriate for the difficulty level
        
        Format your response as a well-structured quiz with:
        - A title for the quiz
        - Clear question numbering
        - Multiple choice options labeled A, B, C, D
        - Correct answers provided at the end
        
        Make the quiz engaging and educational, suitable for classroom use.
        
        **IMPORTANT**: Format your response in clean, readable text that can be easily displayed to students.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Return structured response
      return {
        quiz: text,
        topic: topic,
        difficulty: difficulty,
        questionCount: questionCount,
        timestamp: new Date().toISOString(),
        message: `Generated ${questionCount} ${difficulty} difficulty questions about ${topic}`
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error('Failed to generate quiz');
    }
  }

  /**
   * [Original Function - Kept for reference or other uses]
   */
  async generateMaterialSummary(materialContent, materialType) {
    try {
      const prompt = `Please provide a concise summary of this ${materialType} content...\n\n${materialContent.substring(0, 2000)}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Material summary error:', error);
      return 'Summary generation failed.';
    }
  }
}

module.exports = new GeminiService();