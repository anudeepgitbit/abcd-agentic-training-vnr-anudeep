import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle, 
  User, 
  MessageCircle,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Reply
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Doubt {
  _id: string;
  student: {
    _id: string;
    name: string;
    avatar?: string;
    studentId: string;
  };
  question: string;
  answer?: string;
  answeredBy?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  status: 'pending' | 'answered';
  isPublic: boolean;
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down';
  };
  createdAt: string;
  answeredAt?: string;
}

interface Assignment {
  _id: string;
  title: string;
  subject: string;
}

interface DoubtSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

const DoubtSectionModal: React.FC<DoubtSectionModalProps> = ({
  isOpen,
  onClose,
  assignment
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [isPublicQuestion, setIsPublicQuestion] = useState(true);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchDoubts();
    }
  }, [isOpen, assignment]);

  const fetchDoubts = async () => {
    if (!assignment) return;
    
    setLoading(true);
    try {
      const response = await apiService.getDoubts(assignment._id);
      if (response.success) {
        setDoubts(response.data || []);
      } else {
        toast({
          title: "Failed to load questions",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to load questions. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerDoubt = async () => {
    if (!selectedDoubt || !answerText.trim()) return;

    setAnswering(true);
    try {
      const response = await apiService.answerDoubt(selectedDoubt._id, answerText);
      if (response.success) {
        toast({
          title: "Answer submitted successfully",
          description: `Answered ${selectedDoubt.student.name}'s question`
        });
        
        // Update the doubt in the list
        setDoubts(prev => prev.map(doubt => 
          doubt._id === selectedDoubt._id 
            ? { 
                ...doubt, 
                answer: answerText, 
                status: 'answered' as const,
                answeredAt: new Date().toISOString(),
                answeredBy: {
                  _id: (user as any)._id,
                  name: user!.name,
                  avatar: (user as any).avatar
                }
              }
            : doubt
        ));
        
        setAnswerText('');
        setSelectedDoubt(null);
      } else {
        toast({
          title: "Failed to submit answer",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to submit answer. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnswering(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!newQuestion.trim() || !assignment) return;

    setAskingQuestion(true);
    try {
      const response = await apiService.askDoubt(assignment._id, {
        question: newQuestion,
        isPublic: isPublicQuestion
      });

      if (response.success) {
        toast({
          title: "Question submitted successfully",
          description: "Your question has been posted. The teacher will respond soon."
        });
        
        // Add the new doubt to the list
        const newDoubt: Doubt = {
          _id: response.data._id,
          student: {
            _id: (user as any)._id,
            name: user!.name,
            avatar: (user as any).avatar,
            studentId: (user as any).studentId || ''
          },
          question: newQuestion,
          status: 'pending',
          isPublic: isPublicQuestion,
          votes: { upvotes: 0, downvotes: 0 },
          createdAt: new Date().toISOString()
        };
        
        setDoubts(prev => [newDoubt, ...prev]);
        setNewQuestion('');
      } else {
        toast({
          title: "Failed to submit question",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to submit question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAskingQuestion(false);
    }
  };

  const handleVoteDoubt = async (doubtId: string, voteType: 'up' | 'down') => {
    try {
      const response = await apiService.voteDoubt(doubtId, voteType);
      if (response.success) {
        // Update the doubt votes in the list
        setDoubts(prev => prev.map(doubt => 
          doubt._id === doubtId 
            ? { ...doubt, votes: response.data.votes }
            : doubt
        ));
      }
    } catch (error) {
      console.error('Vote error:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'answered':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const pendingDoubts = doubts.filter(d => d.status === 'pending');
  const answeredDoubts = doubts.filter(d => d.status === 'answered');

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Q&A for "{assignment.title}"
          </DialogTitle>
          <DialogDescription>
            Questions and answers from students
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={user?.role === 'teacher' ? 'pending' : 'ask'} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ask">Ask Question</TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingDoubts.length})
            </TabsTrigger>
            <TabsTrigger value="answered">
              Answered ({answeredDoubts.length})
            </TabsTrigger>
            <TabsTrigger value="all">All ({doubts.length})</TabsTrigger>
          </TabsList>

          {/* Ask Question Tab */}
          <TabsContent value="ask" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ask a Question</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type your question about this assignment..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  rows={4}
                />
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isPublicQuestion}
                      onChange={(e) => setIsPublicQuestion(e.target.checked)}
                      className="rounded"
                    />
                    Make this question public (visible to other students)
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleAskQuestion}
                    disabled={askingQuestion || !newQuestion.trim()}
                  >
                    {askingQuestion ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Submit Question
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pending Questions Tab */}
          <TabsContent value="pending" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading questions...</span>
              </div>
            ) : pendingDoubts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending questions</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {pendingDoubts.map((doubt) => (
                  <Card key={doubt._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doubt.student.avatar} />
                            <AvatarFallback>
                              {doubt.student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{doubt.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ID: {doubt.student.studentId}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(doubt.status)} variant="outline">
                            {doubt.status}
                          </Badge>
                          {!doubt.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="bg-muted/30 p-3 rounded-lg mb-3">
                        <p className="text-sm">{doubt.question}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Asked: {formatDate(doubt.createdAt)}
                        </div>
                        
                        {user?.role === 'teacher' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDoubt(doubt);
                              setAnswerText('');
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Answer
                          </Button>
                        )}
                      </div>

                      {doubt.isPublic && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'up')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'up' 
                                ? 'text-green-600' 
                                : 'text-muted-foreground hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {doubt.votes.upvotes}
                          </button>
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'down')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'down' 
                                ? 'text-red-600' 
                                : 'text-muted-foreground hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            {doubt.votes.downvotes}
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Answered Questions Tab */}
          <TabsContent value="answered" className="space-y-4">
            {answeredDoubts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No answered questions yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {answeredDoubts.map((doubt) => (
                  <Card key={doubt._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doubt.student.avatar} />
                            <AvatarFallback>
                              {doubt.student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{doubt.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Asked: {formatDate(doubt.createdAt)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(doubt.status)} variant="outline">
                          {doubt.status}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Question:</p>
                          <p className="text-sm">{doubt.question}</p>
                        </div>

                        {doubt.answer && (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doubt.answeredBy?.avatar} />
                                <AvatarFallback>
                                  {doubt.answeredBy?.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {doubt.answeredBy?.name}
                                </p>
                                <p className="text-xs text-green-600">
                                  Answered: {doubt.answeredAt && formatDate(doubt.answeredAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-green-700">{doubt.answer}</p>
                          </div>
                        )}
                      </div>

                      {doubt.isPublic && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'up')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'up' 
                                ? 'text-green-600' 
                                : 'text-muted-foreground hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {doubt.votes.upvotes}
                          </button>
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'down')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'down' 
                                ? 'text-red-600' 
                                : 'text-muted-foreground hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            {doubt.votes.downvotes}
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Questions Tab */}
          <TabsContent value="all" className="space-y-4">
            {doubts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No questions yet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {doubts.map((doubt) => (
                  <Card key={doubt._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={doubt.student.avatar} />
                            <AvatarFallback>
                              {doubt.student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{doubt.student.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Asked: {formatDate(doubt.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(doubt.status)} variant="outline">
                            {doubt.status}
                          </Badge>
                          {!doubt.isPublic && (
                            <Badge variant="secondary" className="text-xs">
                              Private
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-muted/30 p-3 rounded-lg">
                          <p className="text-sm">{doubt.question}</p>
                        </div>

                        {doubt.answer ? (
                          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={doubt.answeredBy?.avatar} />
                                <AvatarFallback>
                                  {doubt.answeredBy?.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-green-800">
                                  {doubt.answeredBy?.name}
                                </p>
                                <p className="text-xs text-green-600">
                                  Answered: {doubt.answeredAt && formatDate(doubt.answeredAt)}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-green-700">{doubt.answer}</p>
                          </div>
                        ) : user?.role === 'teacher' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedDoubt(doubt);
                              setAnswerText('');
                            }}
                          >
                            <Reply className="h-4 w-4 mr-1" />
                            Answer
                          </Button>
                        )}
                      </div>

                      {doubt.isPublic && (
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'up')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'up' 
                                ? 'text-green-600' 
                                : 'text-muted-foreground hover:text-green-600'
                            }`}
                          >
                            <ThumbsUp className="h-3 w-3" />
                            {doubt.votes.upvotes}
                          </button>
                          <button
                            onClick={() => handleVoteDoubt(doubt._id, 'down')}
                            className={`flex items-center gap-1 text-xs ${
                              doubt.votes.userVote === 'down' 
                                ? 'text-red-600' 
                                : 'text-muted-foreground hover:text-red-600'
                            }`}
                          >
                            <ThumbsDown className="h-3 w-3" />
                            {doubt.votes.downvotes}
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Answer Modal */}
        {selectedDoubt && (
          <Dialog open={!!selectedDoubt} onOpenChange={() => setSelectedDoubt(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Answer Question</DialogTitle>
                <DialogDescription>
                  Responding to {selectedDoubt.student.name}'s question
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">Question:</p>
                  <p className="text-sm">{selectedDoubt.question}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Your Answer</label>
                  <Textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAnswerDoubt}
                    disabled={answering || !answerText.trim()}
                  >
                    {answering ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Submit Answer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedDoubt(null)}
                    disabled={answering}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DoubtSectionModal;
