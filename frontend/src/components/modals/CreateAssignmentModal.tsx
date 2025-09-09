import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ClipboardList, Plus, Loader2, Calendar as CalendarIcon, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateAssignmentModalProps {
  children: React.ReactNode;
  onAssignmentCreated?: () => void;
  isCreating?: boolean;
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({ 
  children, 
  onAssignmentCreated,
  isCreating: externalCreating 
}) => {
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const isCreating = externalCreating || creating;
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    subject: '',
    description: '',
    classroomId: '',
    dueDate: '',
    points: 100,
    difficulty: 'medium',
    timeLimit: '',
    allowLateSubmissions: true
  });
  const { toast } = useToast();

  const fetchClassrooms = async () => {
    setLoadingClassrooms(true);
    try {
      const response = await apiService.getClassrooms();
      if (response.success) {
        // Handle different response structures from the API
        let classroomsData: any[] = [];
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data)) {
            classroomsData = response.data;
          } else if ((response.data as any).classrooms && Array.isArray((response.data as any).classrooms)) {
            classroomsData = (response.data as any).classrooms;
          } else if ((response.data as any).data && Array.isArray((response.data as any).data)) {
            classroomsData = (response.data as any).data;
          }
        }
        setClassrooms(classroomsData);
      } else {
        toast({
          title: "Failed to load classrooms",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to load classrooms. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAssignment.title.trim() || !newAssignment.subject.trim() || !newAssignment.classroomId || !newAssignment.dueDate) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const formData = new FormData();
      formData.append('title', newAssignment.title);
      formData.append('subject', newAssignment.subject);
      formData.append('description', newAssignment.description);
      formData.append('classroomId', newAssignment.classroomId);
      formData.append('dueDate', newAssignment.dueDate);
      formData.append('points', newAssignment.points.toString());
      formData.append('difficulty', newAssignment.difficulty);
      formData.append('allowLateSubmissions', newAssignment.allowLateSubmissions.toString());
      formData.append('type', 'assignment'); // Required field for Assignment model
      
      // Add required fields that backend expects
      if (newAssignment.timeLimit) {
        formData.append('timeLimit', newAssignment.timeLimit);
      }
      
      // Log the form data for debugging
      console.log('Assignment form data:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await apiService.createAssignment(formData);
      if (response.success) {
        toast({
          title: "Assignment created successfully",
          description: `${newAssignment.title} has been created and assigned to students`,
        });
        
        // Reset form
        setNewAssignment({
          title: '',
          subject: '',
          description: '',
          classroomId: '',
          dueDate: '',
          points: 100,
          difficulty: 'medium',
          timeLimit: '',
          allowLateSubmissions: true
        });
        
        setOpen(false);
        onAssignmentCreated?.();
      } else {
        toast({
          title: "Failed to create assignment",
          description: response.error || "Please try again",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to create assignment. Please check your connection.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchClassrooms();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Create New Assignment
          </DialogTitle>
          <DialogDescription>
            Create a new assignment for your students. Fill in the details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateAssignment} className="space-y-4">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Assignment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Assignment title"
                    value={newAssignment.title}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, title: e.target.value }))}
                    disabled={creating}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Subject (e.g., Mathematics)"
                    value={newAssignment.subject}
                    onChange={(e) => setNewAssignment(prev => ({ ...prev, subject: e.target.value }))}
                    disabled={creating}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Assignment description and instructions"
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment(prev => ({ ...prev, description: e.target.value }))}
                  disabled={creating}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="classroom">Classroom *</Label>
                <Select
                  value={newAssignment.classroomId}
                  onValueChange={(value) => setNewAssignment(prev => ({ ...prev, classroomId: value }))}
                  disabled={creating || loadingClassrooms}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingClassrooms ? "Loading classrooms..." : "Select a classroom"} />
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
            </CardContent>
          </Card>

          {/* Assignment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Assignment Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Due Date Section - Full Width */}
              <div className="space-y-2">
                <Label>Due Date & Time *</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "flex-1 justify-start text-left font-normal min-w-[200px]",
                          !newAssignment.dueDate && "text-muted-foreground"
                        )}
                        disabled={creating}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newAssignment.dueDate ? (
                          format(new Date(newAssignment.dueDate), "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[1000]" align="start">
                      <Calendar
                        mode="single"
                        selected={newAssignment.dueDate ? new Date(newAssignment.dueDate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            // Keep existing time if it exists, otherwise set to end of day
                            const existingDate = newAssignment.dueDate ? new Date(newAssignment.dueDate) : new Date();
                            const newDate = new Date(date);
                            newDate.setHours(existingDate.getHours() || 23);
                            newDate.setMinutes(existingDate.getMinutes() || 59);
                            setNewAssignment(prev => ({ 
                              ...prev, 
                              dueDate: newDate.toISOString().slice(0, 16) 
                            }));
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date < today;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    className="w-full sm:w-32"
                    value={newAssignment.dueDate ? new Date(newAssignment.dueDate).toTimeString().slice(0, 5) : "23:59"}
                    onChange={(e) => {
                      const [hours, minutes] = e.target.value.split(':');
                      const currentDate = newAssignment.dueDate ? new Date(newAssignment.dueDate) : new Date();
                      currentDate.setHours(parseInt(hours));
                      currentDate.setMinutes(parseInt(minutes));
                      setNewAssignment(prev => ({ 
                        ...prev, 
                        dueDate: currentDate.toISOString().slice(0, 16) 
                      }));
                    }}
                    disabled={creating}
                    required
                  />
                </div>
              </div>

              {/* Other Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    max="1000"
                    value={newAssignment.points}
                    onChange={(e) => setNewAssignment(prev => ({ 
                      ...prev, 
                      points: parseInt(e.target.value) || 100 
                    }))}
                    disabled={creating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    value={newAssignment.difficulty}
                    onValueChange={(value) => setNewAssignment(prev => ({ 
                      ...prev, 
                      difficulty: value 
                    }))}
                    disabled={creating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min="1"
                  placeholder="Leave empty for no time limit"
                  value={newAssignment.timeLimit}
                  onChange={(e) => setNewAssignment(prev => ({ 
                    ...prev, 
                    timeLimit: e.target.value 
                  }))}
                  disabled={creating}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={creating || !newAssignment.title.trim() || !newAssignment.subject.trim() || !newAssignment.classroomId}
              className="bg-gradient-primary"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentModal;