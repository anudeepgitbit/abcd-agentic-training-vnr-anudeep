import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import {
  User, 
  Mail, 
  Calendar, 
  Award, 
  TrendingUp, 
  BookOpen, 
  ClipboardList,
  Edit,
  Star,
  Trophy,
  Target,
  Loader2
} from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const [profileResponse, badgesResponse, activityResponse] = await Promise.all([
          apiService.getProfile(),
          apiService.getUserBadges(),
          apiService.getRecentActivity()
        ]);

        if (profileResponse.success) {
          setProfileData(profileResponse.data);
        }
        
        if (badgesResponse.success) {
          setBadges(badgesResponse.data || []);
        }
        
        if (activityResponse.success) {
          setRecentActivity(activityResponse.data || []);
        }
      } catch (error) {
        setError('Failed to load profile data');
        toast({
          title: "Network error",
          description: "Failed to load profile data. Please check your connection.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  const handleEditProfile = () => {
    toast({
      title: "Edit Profile",
      description: "Profile editing modal will be implemented next",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  const stats = profileData?.stats || user.stats || {};
  const isStudent = user.role === 'student';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account and view your achievements</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Profile Card */}
        <div className="xl:col-span-1">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24 border-4 border-primary/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-primary text-white text-2xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2">
                <Badge variant={isStudent ? "default" : "secondary"} className="capitalize">
                  {user.role}
                </Badge>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user.email}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
              </div>
              
              {/* Role-specific information */}
              {user.role === 'student' && user.studentId && (
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">ID: {user.studentId}</span>
                </div>
              )}
              
              {user.role === 'student' && user.grade && (
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Grade: {user.grade}</span>
                </div>
              )}
              
              {user.role === 'teacher' && user.department && (
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Department: {user.department}</span>
                </div>
              )}
              
              {user.role === 'teacher' && user.qualification && (
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.qualification}</span>
                </div>
              )}
              
              <Separator />
              
              <Button className="w-full" variant="outline" onClick={handleEditProfile}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Achievements */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          {/* Performance Stats */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Performance Statistics
              </CardTitle>
              <CardDescription>Your academic progress and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                {isStudent ? (
                  <>
                    <div className="text-center p-4 rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">
                        {stats?.totalAssignments || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Assignments</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-success/5">
                      <div className="text-2xl font-bold text-success">
                        {stats?.completedAssignments || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-secondary/5">
                      <div className="text-2xl font-bold text-secondary">
                        {stats?.averageScore || 0}%
                      </div>
                      <div className="text-sm text-muted-foreground">Avg Score</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-accent/5">
                      <div className="text-2xl font-bold text-accent">
                        #{stats?.rank || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">Class Rank</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 rounded-lg bg-primary/5">
                      <div className="text-2xl font-bold text-primary">
                        {stats?.totalClassrooms || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Classrooms</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-secondary/5">
                      <div className="text-2xl font-bold text-secondary">
                        {stats?.totalStudents || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Students</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-accent/5">
                      <div className="text-2xl font-bold text-accent">
                        {stats?.totalAssignments || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Assignments</div>
                    </div>
                    
                    <div className="text-center p-4 rounded-lg bg-warning/5">
                      <div className="text-2xl font-bold text-warning">
                        {stats?.totalMaterials || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Materials</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Badges and Achievements */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                Badges & Achievements
              </CardTitle>
              <CardDescription>Your earned accomplishments and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badges.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No badges earned yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Complete assignments and activities to earn badges!</p>
                  </div>
                ) : (
                  badges.map((badge, index) => {
                    const badgeColors = {
                      'consistent': { bg: 'from-yellow-50 to-orange-50', border: 'border-yellow-200', icon: 'bg-yellow-500/20', iconColor: 'text-yellow-600', text: 'text-yellow-800', desc: 'text-yellow-600' },
                      'achiever': { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200', icon: 'bg-blue-500/20', iconColor: 'text-blue-600', text: 'text-blue-800', desc: 'text-blue-600' },
                      'creator': { bg: 'from-green-50 to-emerald-50', border: 'border-green-200', icon: 'bg-green-500/20', iconColor: 'text-green-600', text: 'text-green-800', desc: 'text-green-600' },
                      'helper': { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200', icon: 'bg-purple-500/20', iconColor: 'text-purple-600', text: 'text-purple-800', desc: 'text-purple-600' }
                    };
                    
                    const colors = badgeColors[badge.type] || badgeColors['achiever'];
                    const IconComponent = badge.type === 'consistent' ? Award : 
                                        badge.type === 'achiever' ? Star : 
                                        badge.type === 'creator' ? ClipboardList : BookOpen;
                    
                    return (
                      <div key={index} className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border}`}>
                        <div className={`p-2 rounded-full ${colors.icon}`}>
                          <IconComponent className={`h-5 w-5 ${colors.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${colors.text}`}>{badge.name}</p>
                          <p className={`text-sm ${colors.desc}`}>{badge.description}</p>
                        </div>
                        <Badge variant="outline" className={`${colors.border} ${colors.desc}`}>
                          {badge.earnedAt ? new Date(badge.earnedAt).toLocaleDateString() : 'Recent'}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Your latest actions and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No recent activity</p>
                  </div>
                ) : (
                  recentActivity.slice(0, 5).map((activity, index) => {
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'badge': return Trophy;
                        case 'assignment': return ClipboardList;
                        case 'material': return BookOpen;
                        case 'login': return User;
                        default: return Target;
                      }
                    };
                    
                    const getActivityColor = (type: string) => {
                      switch (type) {
                        case 'badge': return 'bg-success/10 text-success';
                        case 'assignment': return 'bg-primary/10 text-primary';
                        case 'material': return 'bg-secondary/10 text-secondary';
                        case 'login': return 'bg-accent/10 text-accent';
                        default: return 'bg-muted/10 text-muted-foreground';
                      }
                    };
                    
                    const IconComponent = getActivityIcon(activity.type);
                    
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{activity.title || activity.name}</p>
                          <p className="text-sm text-muted-foreground">{activity.description}</p>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;