import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Bot, 
  Send, 
  Lightbulb, 
  BookOpen, 
  ClipboardList, 
  Wand2,
  MessageCircle,
  Sparkles,
  Brain,
  Users,
  Loader2,
  Mic,
  MicOff,
  Upload,
  FileText,
  Image,
  X,
  Paperclip,
  Calendar,
  Clock,
  Award,
  Plus,
  Check
} from 'lucide-react';

interface ChatMessage {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  attachments?: {
    name: string;
    type: string;
    url?: string;
    content?: string;
  }[];
}

interface UploadedFile {
  name: string;
  type: string;
  content: string;
  url?: string;
}

const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'ai',
      content: `Hello ${user?.name}! I'm your AI learning assistant. I can help you with homework questions, generate quizzes, explain concepts, and much more. You can also upload PDFs or images and ask questions about them, or use voice input. How can I assist you today?`,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [quizTopic, setQuizTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [assignmentData, setAssignmentData] = useState({
    classroomId: '',
    title: '',
    description: '',
    dueDate: '',
    points: 100,
    timeLimit: 60
  });
  
  // Speech-to-text states
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeacher = user?.role === 'teacher';

  // Fetch classrooms for teachers
  useEffect(() => {
    if (isTeacher) {
      fetchClassrooms();
    }
  }, [isTeacher]);

  const fetchClassrooms = async () => {
    try {
      const response = await apiService.getClassrooms();
      if (response.success && response.data) {
        setClassrooms(response.data);
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setSpeechSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => prev + (prev ? ' ' : '') + transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition failed. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  // Speech-to-text functions
  const toggleListening = () => {
    if (!speechSupported) {
      toast.error('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // File upload functions
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type ${file.type} is not supported. Please upload PDF or image files.`);
          continue;
        }

        if (file.type === 'application/pdf') {
          // For PDFs, we'll send the file to backend for text extraction
          try {
            const result = await apiService.extractTextFromFile(file);
            
            if (result.success && result.data) {
              setUploadedFiles(prev => [...prev, {
                name: file.name,
                type: file.type,
                content: result.data.text
              }]);
            } else {
              toast.error(`Failed to extract text from ${file.name}`);
            }
          } catch (error) {
            toast.error(`Error processing ${file.name}`);
          }
        } else {
          // For images, convert to base64
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setUploadedFiles(prev => [...prev, {
              name: file.name,
              type: file.type,
              content: base64,
              url: base64
            }]);
          };
          reader.readAsDataURL(file);
        }
      }
      
      toast.success('Files uploaded successfully!');
    } catch (error) {
      toast.error('Error uploading files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && uploadedFiles.length === 0) || isLoading) return;

    const userMessage = inputMessage;
    const attachments = uploadedFiles.map(file => ({
      name: file.name,
      type: file.type,
      content: file.content
    }));
    
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      type: 'user',
      content: userMessage || 'Uploaded files for analysis',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage('');
    setUploadedFiles([]);
    setIsLoading(true);

    try {
      const response = await apiService.chatWithAI(userMessage, {
        role: user?.role,
        userId: user?.id,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      if (response.success && response.data) {
        const aiResponse: ChatMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: response.data.response || response.data.message || 'I apologize, but I encountered an issue processing your request.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: 'I apologize, but I encountered an error. Please try again later.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I encountered a network error. Please check your connection and try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = isTeacher ? [
    { icon: ClipboardList, label: "Generate Quiz", action: "quiz" },
    { icon: BookOpen, label: "Create Materials", action: "materials" },
    { icon: Users, label: "Student Analytics", action: "analytics" },
    { icon: Lightbulb, label: "Teaching Tips", action: "tips" }
  ] : [
    { icon: Lightbulb, label: "Homework Help", action: "homework" },
    { icon: BookOpen, label: "Explain Concept", action: "explain" },
    { icon: Brain, label: "Study Tips", action: "study" },
    { icon: ClipboardList, label: "Practice Quiz", action: "practice" }
  ];

  const handleQuickAction = (action: string) => {
    const actionMessages = {
      homework: "I need help with my homework assignment. Can you guide me through the problem-solving process?",
      explain: "Can you explain a complex concept in simple terms with examples?",
      study: "What are the best study strategies for my upcoming exams?",
      practice: "Can you create a practice quiz to test my knowledge?",
      quiz: "Help me generate quiz questions for my students.",
      materials: "Suggest engaging learning materials for my classroom.",
      analytics: "How can I better understand my students' learning patterns?",
      tips: "What are effective teaching strategies for engaging students?"
    };

    const message = actionMessages[action as keyof typeof actionMessages];
    if (message) {
      setInputMessage(message);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!quizTopic.trim() || quizLoading) return;

    setQuizLoading(true);

    try {
      const response = await apiService.generateQuiz({
        topic: quizTopic,
        difficulty: 'medium',
        questionCount: 5,
        questionTypes: ['mcq', 'short_answer']
      });

      if (response.success && response.data) {
        // Store the generated quiz
        setGeneratedQuiz(response.data);
        
        // Add the generated quiz as an AI message with assignment option
        const quizMessage: ChatMessage = {
          id: Date.now(),
          type: 'ai',
          content: `I've generated a quiz on "${quizTopic}":\n\n${response.data.quiz || response.data.message}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, quizMessage]);
        
        // Set default assignment title
        setAssignmentData(prev => ({
          ...prev,
          title: `${quizTopic} Quiz`,
          description: `Auto-generated quiz on ${quizTopic}`
        }));
        
        toast.success('Quiz generated successfully! You can now assign it to a classroom.');
        
        // Show assignment modal for teachers
        if (isTeacher && classrooms.length > 0) {
          setShowAssignmentModal(true);
        }
      } else {
        toast.error('Failed to generate quiz. Please try again.');
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
      toast.error('Error generating quiz. Please check your connection and try again.');
    } finally {
      setQuizLoading(false);
    }
  };

  const handleAssignQuiz = async () => {
    // More detailed validation with specific error messages
    if (!assignmentData.classroomId) {
      toast.error('Please select a classroom.');
      return;
    }
    if (!assignmentData.title || !assignmentData.title.trim()) {
      toast.error('Please enter an assignment title.');
      return;
    }
    if (!assignmentData.dueDate) {
      toast.error('Please select a due date.');
      return;
    }

    try {
      // Find the selected classroom to get its subject
      const selectedClassroom = classrooms.find(c => c._id === assignmentData.classroomId);
      
      // Create FormData for assignment creation
      const formData = new FormData();
      formData.append('title', assignmentData.title);
      formData.append('description', assignmentData.description);
      formData.append('subject', selectedClassroom?.subject || 'General');
      formData.append('classroomId', assignmentData.classroomId);
      formData.append('dueDate', assignmentData.dueDate);
      formData.append('points', assignmentData.points.toString());
      formData.append('timeLimit', assignmentData.timeLimit.toString());
      formData.append('type', 'quiz');
      
      // Add the generated quiz content
      if (generatedQuiz) {
        formData.append('quizData', JSON.stringify(generatedQuiz));
      }

      const response = await apiService.createAssignment(formData);

      if (response.success) {
        toast.success('Quiz assigned successfully!');
        setShowAssignmentModal(false);
        setQuizTopic('');
        setGeneratedQuiz(null);
        setAssignmentData({
          classroomId: '',
          title: '',
          description: '',
          dueDate: '',
          points: 100,
          timeLimit: 60
        });
      } else {
        toast.error('Failed to assign quiz. Please try again.');
      }
    } catch (error) {
      console.error('Assignment creation error:', error);
      toast.error('Error creating assignment. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-gradient-primary">
          <Bot className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Assistant</h1>
          <p className="text-muted-foreground">
            {isTeacher 
              ? "Generate quizzes, get teaching insights, and create engaging content"
              : "Get homework help, explanations, and personalized learning support"
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="shadow-card h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Assistant
              </CardTitle>
              <CardDescription>Ask questions, get explanations, and receive personalized help</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 p-0 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-96">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="space-y-2">
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="space-y-2">
                            {message.attachments.map((attachment, idx) => (
                              <div key={idx} className="flex items-center gap-2 text-xs bg-background/50 rounded p-2">
                                {attachment.type.startsWith('image/') ? (
                                  <>
                                    <Image className="h-3 w-3" />
                                    {attachment.content && (
                                      <img 
                                        src={attachment.content} 
                                        alt={attachment.name}
                                        className="max-w-32 max-h-32 object-cover rounded"
                                      />
                                    )}
                                  </>
                                ) : (
                                  <FileText className="h-3 w-3" />
                                )}
                                <span className="truncate">{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* File Attachments Preview */}
              {uploadedFiles.length > 0 && (
                <div className="border-t p-4 bg-muted/50">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 bg-background border rounded-lg px-3 py-2">
                        {file.type.startsWith('image/') ? (
                          <Image className="h-4 w-4 text-blue-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm truncate max-w-32">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerFileUpload}
                      disabled={isLoading || isUploading}
                      className="px-3"
                    >
                      {isUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Paperclip className="h-4 w-4" />
                      )}
                    </Button>
                    
                    {speechSupported && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleListening}
                        disabled={isLoading}
                        className={`px-3 ${isListening ? 'bg-red-100 text-red-600' : ''}`}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={isListening ? 'Listening...' : 'Ask me anything...'}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                    disabled={isLoading || isListening}
                  />
                  
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-gradient-primary"
                    disabled={isLoading || (!inputMessage.trim() && uploadedFiles.length === 0)}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start gap-2 h-auto py-3"
                  onClick={() => handleQuickAction(action.action)}
                >
                  <action.icon className="h-4 w-4" />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quiz Generator (Teacher Only) */}
          {isTeacher && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-secondary" />
                  Quiz Generator
                </CardTitle>
                <CardDescription>Generate quizzes instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  placeholder="Enter topic (e.g., Calculus)"
                />
                <Button 
                  onClick={handleGenerateQuiz}
                  className="w-full bg-gradient-secondary"
                  disabled={!quizTopic.trim() || quizLoading}
                >
                  {quizLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Generate Quiz
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* AI Features */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  📚 Concept Explanations
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🧮 Problem Solving
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📝 Essay Writing Help
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🎯 Study Planning
                </Badge>
                <Badge variant="outline" className="text-xs">
                  🎤 Voice Input
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📄 File Analysis
                </Badge>
                {isTeacher && (
                  <>
                    <Badge variant="outline" className="text-xs">
                      📊 Student Analytics
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      🎓 Curriculum Design
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assignment Modal */}
      <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Assign Quiz to Classroom
            </DialogTitle>
            <DialogDescription>
              Configure assignment details for your generated quiz
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Quiz Preview */}
            {generatedQuiz && generatedQuiz.quiz && (
              <div className="space-y-2">
                <Label>Quiz Preview</Label>
                <div className="max-h-40 overflow-y-auto p-3 bg-muted rounded-md border">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {generatedQuiz.quiz.substring(0, 500)}
                    {generatedQuiz.quiz.length > 500 && '...'}
                  </pre>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="classroom">Classroom *</Label>
              <Select value={assignmentData.classroomId} onValueChange={(value) => 
                setAssignmentData(prev => ({ ...prev, classroomId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select a classroom" />
                </SelectTrigger>
                <SelectContent>
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom._id} value={classroom._id}>
                      {classroom.name} ({classroom.subject})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Assignment Title *</Label>
              <Input
                id="title"
                value={assignmentData.title}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={assignmentData.description}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter assignment description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  value={assignmentData.dueDate}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  min="1"
                  value={assignmentData.points}
                  onChange={(e) => setAssignmentData(prev => ({ ...prev, points: parseInt(e.target.value) || 100 }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
              <Input
                id="timeLimit"
                type="number"
                min="5"
                value={assignmentData.timeLimit}
                onChange={(e) => setAssignmentData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 60 }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignmentModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignQuiz} className="bg-gradient-primary">
              <Check className="h-4 w-4 mr-2" />
              Assign Quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIAssistant;