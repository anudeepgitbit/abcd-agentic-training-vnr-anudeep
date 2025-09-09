import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Download, 
  Star, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Loader2,
  GraduationCap,
  Eye,
  Edit3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Submission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    studentId: string;
  };
  content: string;
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
  }>;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late';
  submittedAt: string;
  gradedAt?: string;
}

interface Assignment {
  _id: string;
  title: string;
  totalPoints: number;
  dueDate: string;
}

interface ViewSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

const ViewSubmissionsModal: React.FC<ViewSubmissionsModalProps> = ({
  isOpen,
  onClose,
  assignment
}) => {
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingMode, setGradingMode] = useState(false);
  const [gradeScore, setGradeScore] = useState('');
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    if (isOpen && assignment) {
      fetchSubmissions();
    }
  }, [isOpen, assignment]);

  const fetchSubmissions = async () => {
    if (!assignment) return;
    
    setLoading(true);
    try {
      const response = await apiService.getSubmissions(assignment._id);
      if (response.success) {
        // Handle both possible response structures: nested submissions or direct array
        const submissionsData = response.data?.submissions || response.data || [];
        setSubmissions(Array.isArray(submissionsData) ? submissionsData : []);
      } else {
        toast({
          title: "Failed to load submissions",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to load submissions. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !gradeScore) return;

    const score = parseFloat(gradeScore);
    if (isNaN(score) || score < 0 || score > assignment!.totalPoints) {
      toast({
        title: "Invalid score",
        description: `Score must be between 0 and ${assignment!.totalPoints}`,
        variant: "destructive"
      });
      return;
    }

    setGrading(true);
    try {
      const response = await apiService.gradeSubmission(selectedSubmission._id, {
        score,
        feedback: gradeFeedback,
        status: 'graded'
      });

      if (response.success) {
        toast({
          title: "Submission graded successfully",
          description: `Graded ${selectedSubmission.student.name}'s submission`
        });
        
        // Update the submission in the list
        setSubmissions(prev => prev.map(sub => 
          sub._id === selectedSubmission._id 
            ? { ...sub, score, feedback: gradeFeedback, status: 'graded' as const, gradedAt: new Date().toISOString() }
            : sub
        ));
        
        setGradingMode(false);
        setGradeScore('');
        setGradeFeedback('');
      } else {
        toast({
          title: "Failed to grade submission",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to grade submission. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGrading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (!assignment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Submissions for "{assignment.title}"
          </DialogTitle>
          <DialogDescription>
            Review and grade student submissions
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-[70vh]">
          {/* Submissions List */}
          <div className="w-1/2 border-r pr-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Submissions ({submissions.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSubmissions}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading submissions...</span>
              </div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No submissions yet</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-full">
                {submissions.map((submission) => (
                  <Card 
                    key={submission._id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedSubmission?._id === submission._id 
                        ? 'ring-2 ring-primary shadow-md' 
                        : ''
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={submission.student.avatar} />
                            <AvatarFallback>
                              {submission.student.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {submission.student.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              ID: {submission.student.studentId}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(submission.status)} variant="outline">
                          {submission.status}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Submitted: {formatDate(submission.submittedAt)}
                        </div>
                        
                        {submission.score !== undefined && (
                          <div className="flex items-center gap-2">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className={`text-sm font-medium ${getScoreColor(submission.score, assignment.totalPoints)}`}>
                              {submission.score}/{assignment.totalPoints}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.round((submission.score / assignment.totalPoints) * 100)}%)
                            </span>
                          </div>
                        )}

                        {submission.attachments.length > 0 && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="h-3 w-3" />
                            {submission.attachments.length} attachment(s)
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Submission Details */}
          <div className="w-1/2 pl-6">
            {selectedSubmission ? (
              <div className="space-y-6 overflow-y-auto max-h-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={selectedSubmission.student.avatar} />
                      <AvatarFallback>
                        {selectedSubmission.student.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedSubmission.student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedSubmission.student.email}
                      </p>
                    </div>
                  </div>
                  
                  {selectedSubmission.status !== 'graded' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setGradingMode(true);
                        setGradeScore(selectedSubmission.score?.toString() || '');
                        setGradeFeedback(selectedSubmission.feedback || '');
                      }}
                    >
                      <GraduationCap className="h-4 w-4 mr-1" />
                      Grade
                    </Button>
                  )}
                </div>

                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="attachments">Files</TabsTrigger>
                    <TabsTrigger value="grading">Grading</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Submission Content</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <p className="whitespace-pre-wrap text-sm">
                            {selectedSubmission.content || 'No written content provided'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2 text-blue-700 mb-1">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">Submitted</span>
                        </div>
                        <p className="text-blue-600">{formatDate(selectedSubmission.submittedAt)}</p>
                      </div>
                      
                      {selectedSubmission.gradedAt && (
                        <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="flex items-center gap-2 text-green-700 mb-1">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">Graded</span>
                          </div>
                          <p className="text-green-600">{formatDate(selectedSubmission.gradedAt)}</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="attachments" className="space-y-4">
                    {selectedSubmission.attachments.length > 0 ? (
                      <div className="space-y-3">
                        {selectedSubmission.attachments.map((attachment, index) => (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <FileText className="h-5 w-5 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium text-sm">{attachment.fileName}</p>
                                    <p className="text-xs text-muted-foreground">{attachment.fileType}</p>
                                  </div>
                                </div>
                                <Button size="sm" variant="outline" asChild>
                                  <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-4 w-4 mr-1" />
                                    Download
                                  </a>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No files attached</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="grading" className="space-y-4">
                    {gradingMode ? (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Grade Submission</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">
                              Score (out of {assignment.totalPoints})
                            </label>
                            <Input
                              type="number"
                              min="0"
                              max={assignment.totalPoints}
                              value={gradeScore}
                              onChange={(e) => setGradeScore(e.target.value)}
                              placeholder="Enter score"
                            />
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Feedback</label>
                            <Textarea
                              value={gradeFeedback}
                              onChange={(e) => setGradeFeedback(e.target.value)}
                              placeholder="Provide feedback to the student..."
                              rows={4}
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={handleGradeSubmission}
                              disabled={grading || !gradeScore}
                            >
                              {grading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-1" />
                              )}
                              Submit Grade
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setGradingMode(false)}
                              disabled={grading}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Grading Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {selectedSubmission.score !== undefined ? (
                            <>
                              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 border border-green-200">
                                <div>
                                  <p className="font-medium text-green-800">Score</p>
                                  <p className="text-2xl font-bold text-green-600">
                                    {selectedSubmission.score}/{assignment.totalPoints}
                                  </p>
                                  <p className="text-sm text-green-600">
                                    {Math.round((selectedSubmission.score / assignment.totalPoints) * 100)}%
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setGradingMode(true);
                                    setGradeScore(selectedSubmission.score?.toString() || '');
                                    setGradeFeedback(selectedSubmission.feedback || '');
                                  }}
                                >
                                  <Edit3 className="h-4 w-4 mr-1" />
                                  Edit Grade
                                </Button>
                              </div>
                              
                              {selectedSubmission.feedback && (
                                <div className="p-4 rounded-lg bg-muted/30">
                                  <p className="font-medium text-sm mb-2">Feedback</p>
                                  <p className="text-sm whitespace-pre-wrap">
                                    {selectedSubmission.feedback}
                                  </p>
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-8">
                              <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                              <p className="text-muted-foreground mb-4">Not graded yet</p>
                              <Button
                                onClick={() => {
                                  setGradingMode(true);
                                  setGradeScore('');
                                  setGradeFeedback('');
                                }}
                              >
                                <GraduationCap className="h-4 w-4 mr-1" />
                                Grade Now
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a submission to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionsModal;
