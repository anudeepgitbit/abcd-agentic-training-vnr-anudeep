import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bot, 
  Send, 
  User, 
  BookOpen, 
  Brain, 
  Target, 
  Trophy,
  Clock,
  CheckCircle,
  Star,
  Lightbulb,
  MessageCircle,
  Sparkles,
  FileText
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'quiz' | 'summary';
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Quiz {
  id: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
  score?: number;
  totalQuestions: number;
}

const studyTips = {
  mathematics: [
    "Practice problems daily to build muscle memory 📊",
    "Break complex problems into smaller steps 🔢",
    "Use visual aids like graphs and diagrams 📈",
    "Review formulas regularly and understand their derivations 📝"
  ],
  physics: [
    "Visualize concepts with real-world examples 🌍",
    "Practice dimensional analysis for problem-solving ⚖️",
    "Draw free body diagrams for mechanics problems 📐",
    "Connect mathematical equations to physical phenomena 🔬"
  ],
  chemistry: [
    "Use mnemonics for periodic table trends 🧪",
    "Practice balancing equations regularly ⚗️",
    "Understand reaction mechanisms step by step 🔄",
    "Connect molecular structure to properties 🧬"
  ],
  history: [
    "Create timelines to understand chronological order 📅",
    "Connect events to understand cause and effect 🔗",
    "Use maps to understand geographical context 🗺️",
    "Read primary sources for deeper understanding 📜"
  ]
};

const mockQuizzes: { [key: string]: { [key: string]: QuizQuestion[] } } = {
  mathematics: {
    calculus: [
      {
        id: '1',
        question: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: 1,
        explanation: 'Using the power rule: d/dx(x²) = 2x¹ = 2x'
      },
      {
        id: '2',
        question: 'What is ∫2x dx?',
        options: ['x²', 'x² + C', '2x²', '2x² + C'],
        correctAnswer: 1,
        explanation: 'The integral of 2x is x² + C, where C is the constant of integration'
      }
    ],
    algebra: [
      {
        id: '1',
        question: 'Solve for x: 2x + 5 = 15',
        options: ['5', '10', '7.5', '20'],
        correctAnswer: 0,
        explanation: '2x + 5 = 15 → 2x = 10 → x = 5'
      }
    ]
  },
  physics: {
    mechanics: [
      {
        id: '1',
        question: 'What is Newton\'s second law?',
        options: ['F = ma', 'E = mc²', 'v = u + at', 'P = mv'],
        correctAnswer: 0,
        explanation: 'Newton\'s second law states that Force equals mass times acceleration (F = ma)'
      }
    ]
  },
  chemistry: {
    'atomic structure': [
      {
        id: '1',
        question: 'How many electrons can the first shell hold?',
        options: ['2', '8', '18', '32'],
        correctAnswer: 0,
        explanation: 'The first electron shell (K shell) can hold a maximum of 2 electrons'
      }
    ]
  }
};

const Chatbot: React.FC = () => {
  const location = useLocation();
  const materialContext = location.state?.materialContext;
  
  const getInitialMessage = () => {
    if (materialContext) {
      return `Hello! I'm your AI study assistant. I can see you want to discuss "${materialContext.title}" from ${materialContext.subject}. I can help you understand concepts, create practice questions, or explain any topics from this material. What would you like to know? 📚✨`;
    }
    return 'Hello! I\'m your AI study assistant. I can help you with study tips, create practice quizzes, and answer questions about your materials. How can I help you today? 🤖✨';
  };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: getInitialMessage(),
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Handle material-specific questions
    if (materialContext) {
      const { title, subject, description, type } = materialContext;
      
      if (message.includes('explain') || message.includes('what is') || message.includes('how')) {
        return `Based on "${title}" from ${subject}:\n\n${description}\n\nThis ${type} material covers important concepts. Here are some key points to focus on:\n\n• Understanding the fundamental principles\n• Connecting theory to practical applications\n• Identifying key formulas or concepts\n• Practice with related problems\n\nWould you like me to create a practice quiz on this topic or explain any specific concept in more detail? 🎯`;
      }
      
      if (message.includes('quiz') || message.includes('test') || message.includes('practice')) {
        return `I can create a practice quiz based on "${title}"! This will help you test your understanding of the ${subject} concepts covered in this material.\n\nWould you like me to generate:\n• Multiple choice questions\n• Conceptual questions\n• Problem-solving exercises\n\nJust say "create quiz" and I'll generate one for you! 📝`;
      }
      
      if (message.includes('summary') || message.includes('summarize')) {
        return `Here's a summary of "${title}" from ${subject}:\n\n📋 **Material Overview:**\n${description}\n\n🎯 **Key Learning Points:**\n• Master the core concepts presented\n• Understand practical applications\n• Connect to broader ${subject} principles\n• Practice with examples and exercises\n\n💡 **Study Tips:**\n• Review the material multiple times\n• Take notes on key concepts\n• Create your own examples\n• Test your understanding with practice problems\n\nWould you like me to create practice questions or explain any specific topic? 🤔`;
      }
    }
    
    if (message.includes('study tips') || message.includes('tip')) {
      return 'I can provide study tips for different subjects! Which subject would you like tips for?\n\n📚 Mathematics\n🔬 Physics\n🧪 Chemistry\n📜 History\n\nJust ask me like "Give me mathematics study tips" or "Physics study tips please!"';
    }
    
    if (message.includes('mathematics') && message.includes('tip')) {
      return `Here are some effective Mathematics study tips:\n\n${studyTips.mathematics.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nWould you like me to create a practice quiz for any specific math topic? 🧮`;
    }
    
    if (message.includes('physics') && message.includes('tip')) {
      return `Here are some effective Physics study tips:\n\n${studyTips.physics.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nWould you like me to create a practice quiz for any specific physics topic? ⚛️`;
    }
    
    if (message.includes('chemistry') && message.includes('tip')) {
      return `Here are some effective Chemistry study tips:\n\n${studyTips.chemistry.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nWould you like me to create a practice quiz for any specific chemistry topic? 🧪`;
    }
    
    if (message.includes('history') && message.includes('tip')) {
      return `Here are some effective History study tips:\n\n${studyTips.history.map((tip, i) => `${i + 1}. ${tip}`).join('\n')}\n\nWould you like me to create a practice quiz for any specific history topic? 📚`;
    }
    
    if (message.includes('quiz') || message.includes('practice')) {
      return 'I can create a practice quiz for you! Which subject and topic would you like to practice?\n\n📊 Mathematics: Calculus, Algebra\n⚛️ Physics: Mechanics\n🧪 Chemistry: Atomic Structure\n\nJust say something like "Create a calculus quiz" or "I want to practice mechanics"!';
    }
    
    if (message.includes('calculus') && (message.includes('quiz') || message.includes('practice'))) {
      return 'GENERATE_QUIZ:mathematics:calculus';
    }
    
    if (message.includes('algebra') && (message.includes('quiz') || message.includes('practice'))) {
      return 'GENERATE_QUIZ:mathematics:algebra';
    }
    
    if (message.includes('mechanics') && (message.includes('quiz') || message.includes('practice'))) {
      return 'GENERATE_QUIZ:physics:mechanics';
    }
    
    if (message.includes('atomic') && (message.includes('quiz') || message.includes('practice'))) {
      return 'GENERATE_QUIZ:chemistry:atomic structure';
    }
    
    if (message.includes('summary') || message.includes('summarize')) {
      return 'I can generate AI-powered summaries of your learning materials! 📝✨\n\nTo create a summary:\n1. Go to your Materials page\n2. Select the materials you want summarized\n3. Click "Generate Summary for Selected Materials"\n\nI\'ll analyze the content and provide key insights, main concepts, and important points in an easy-to-understand format, just like NotebookLM! 🤖📚';
    }
    
    // Default responses for common questions
    if (message.includes('hello') || message.includes('hi')) {
      return 'Hello! 👋 I\'m here to help you with your studies. I can provide study tips, create practice quizzes, and help you understand your materials better!';
    }
    
    if (message.includes('help')) {
      return 'I can help you with:\n\n🎯 Study Tips - Get personalized tips for any subject\n📝 Practice Quizzes - Create quizzes to test your knowledge\n📚 Material Summaries - Generate AI summaries of your study materials\n❓ Q&A - Answer questions about your subjects\n\nWhat would you like to explore?';
    }
    
    // Enhanced default responses
    if (message.includes('what') || message.includes('how') || message.includes('why')) {
      return 'Great question! I can help explain concepts, provide study guidance, and create practice materials. Here are some ways I can assist:\n\n📚 **Subject Help**: Ask about Mathematics, Physics, Chemistry, or History\n🎯 **Practice**: "Create a quiz on [topic]" or "Test me on [subject]"\n💡 **Study Tips**: "Give me study tips for [subject]"\n📝 **Explanations**: "Explain [concept]" or "How does [topic] work?"\n\nWhat specific topic would you like to explore?';
    }
    
    return 'I\'m here to help with your studies! Try asking me:\n\n• "Give me physics study tips"\n• "Create a calculus quiz"\n• "Explain photosynthesis"\n• "Help me with chemistry"\n\nWhat subject are you working on today? 🚀';
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Generate bot response immediately
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage);
      
      if (botResponse.startsWith('GENERATE_QUIZ:')) {
        const [, subject, topic] = botResponse.split(':');
        generateQuiz(subject, topic);
      } else {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }
    }, 300);

    setInputMessage('');
  };

  const generateQuiz = (subject: string, topic: string) => {
    const questions = mockQuizzes[subject]?.[topic] || [];
    
    if (questions.length === 0) {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: `Sorry, I don't have quiz questions for ${topic} in ${subject} yet. But I'm learning! Try asking for study tips instead! 🤖📚`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      return;
    }

    const quiz: Quiz = {
      id: Date.now().toString(),
      subject,
      topic,
      questions,
      totalQuestions: questions.length
    };

    setCurrentQuiz(quiz);
    setQuizAnswers({});
    setShowQuizResult(false);

    const botMessage: Message = {
      id: Date.now().toString(),
      content: `Great! I've created a ${topic} quiz for you with ${questions.length} questions. Let's test your knowledge! 🎯`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'quiz'
    };
    setMessages(prev => [...prev, botMessage]);
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const submitQuiz = () => {
    if (!currentQuiz) return;

    let correctAnswers = 0;
    currentQuiz.questions.forEach(question => {
      if (quizAnswers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    const updatedQuiz = { ...currentQuiz, score };
    setCurrentQuiz(updatedQuiz);
    setShowQuizResult(true);

    const grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F';
    const emoji = score >= 90 ? '🏆' : score >= 80 ? '🎉' : score >= 70 ? '👍' : score >= 60 ? '📈' : '💪';

    const resultMessage: Message = {
      id: Date.now().toString(),
      content: `Quiz Complete! ${emoji}\n\nYour Results:\n• Score: ${score}%\n• Grade: ${grade}\n• Correct: ${correctAnswers}/${currentQuiz.questions.length}\n\n${score >= 80 ? 'Excellent work! You\'ve mastered this topic! 🌟' : score >= 60 ? 'Good job! Review the explanations to improve further. 📚' : 'Keep practicing! Review the material and try again. 💪'}`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, resultMessage]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Bot className="h-8 w-8 text-primary" />
          AI Study Assistant
        </h1>
        <p className="text-muted-foreground">Your intelligent companion for learning and practice</p>
      </div>

      {/* Quick Actions */}
      {/* Material Context Display */}
      {materialContext && (
        <Card className="shadow-card bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-blue-600" />
              Discussing Material
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <h3 className="font-medium text-base">{materialContext.title}</h3>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">{materialContext.subject}</Badge>
                <Badge variant="outline" className="text-xs">{materialContext.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{materialContext.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-2"
              onClick={() => setInputMessage(materialContext ? `Give me study tips for ${materialContext.title}` : 'Give me study tips')}
            >
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <span className="text-sm">Study Tips</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-2"
              onClick={() => setInputMessage(materialContext ? `Create a practice quiz for ${materialContext.title}` : 'Create a practice quiz')}
            >
              <Target className="h-5 w-5 text-orange-500" />
              <span className="text-sm">Practice Quiz</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-2"
              onClick={() => setInputMessage(materialContext ? `Explain concepts from ${materialContext.title}` : 'Help me understand concepts')}
            >
              <Brain className="h-5 w-5 text-purple-500" />
              <span className="text-sm">Explain Concept</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-2"
              onClick={() => setInputMessage(materialContext ? `Summarize ${materialContext.title}` : 'Generate material summary')}
            >
              <BookOpen className="h-5 w-5 text-blue-500" />
              <span className="text-sm">Summarize</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Messages */}
          <div className="h-80 overflow-y-auto space-y-3 mb-4 p-3 border rounded-lg bg-muted/10">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`p-2 rounded-full ${message.sender === 'user' ? 'bg-primary' : 'bg-secondary'}`}>
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-secondary-foreground" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="whitespace-pre-line text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Quiz Display */}
            {currentQuiz && !showQuizResult && (
              <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-4 rounded-lg border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  {currentQuiz.subject} - {currentQuiz.topic} Quiz
                </h3>
                
                <div className="space-y-6">
                  {currentQuiz.questions.map((question, qIndex) => (
                    <div key={question.id} className="space-y-3">
                      <h4 className="font-medium">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {question.options.map((option, oIndex) => (
                          <Button
                            key={oIndex}
                            variant={quizAnswers[question.id] === oIndex ? "default" : "outline"}
                            className="justify-start text-left h-auto py-2"
                            onClick={() => handleQuizAnswer(question.id, oIndex)}
                          >
                            {String.fromCharCode(65 + oIndex)}. {option}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    onClick={submitQuiz}
                    className="w-full bg-gradient-primary"
                    disabled={Object.keys(quizAnswers).length !== currentQuiz.questions.length}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </div>
            )}

            {/* Quiz Results */}
            {currentQuiz && showQuizResult && (
              <div className="bg-gradient-to-r from-success/5 to-primary/5 p-4 rounded-lg border">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  Quiz Results
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Score:</span>
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {currentQuiz.score}%
                    </Badge>
                  </div>
                  
                  <Progress value={currentQuiz.score} className="h-3" />
                  
                  <div className="space-y-3">
                    {currentQuiz.questions.map((question, index) => (
                      <div key={question.id} className="p-3 rounded-lg bg-muted/30">
                        <div className="flex items-start gap-2">
                          {quizAnswers[question.id] === question.correctAnswer ? (
                            <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                          ) : (
                            <Star className="h-5 w-5 text-warning mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {question.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me anything about your studies..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chatbot;
