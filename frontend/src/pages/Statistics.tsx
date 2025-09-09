import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  Trophy,
  BarChart3,
  Clock,
  Flame,
  Award,
  PieChart,
  Activity,
  BookOpen,
  Users
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend
} from 'recharts';

const Statistics: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Statistics</h1>
        <p className="text-muted-foreground">Track your academic progress and performance metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Streak</CardTitle>
            <Flame className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">5 days</div>
            <p className="text-xs text-muted-foreground">Current streak</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">87%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Studied</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">42h</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
            <Trophy className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">#3</div>
            <p className="text-xs text-muted-foreground">Out of 28 students</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Subject Performance Bar Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Subject Performance
            </CardTitle>
            <CardDescription>Your grades across different subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { subject: 'Math', score: 92, color: '#10b981' },
                { subject: 'Physics', score: 89, color: '#3b82f6' },
                { subject: 'Chemistry', score: 78, color: '#f59e0b' },
                { subject: 'History', score: 85, color: '#8b5cf6' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="subject" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Assignment Progress Pie Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-secondary" />
              Assignment Distribution
            </CardTitle>
            <CardDescription>Breakdown of assignment status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={[
                    { name: 'Completed', value: 10, fill: '#10b981' },
                    { name: 'In Progress', value: 2, fill: '#f59e0b' },
                    { name: 'Pending', value: 1, fill: '#ef4444' }
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {/* Monthly Progress Line Chart */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-accent" />
              Monthly Progress Trend
            </CardTitle>
            <CardDescription>Your performance over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { month: 'Aug', score: 78, assignments: 8 },
                { month: 'Sep', score: 82, assignments: 10 },
                { month: 'Oct', score: 85, assignments: 12 },
                { month: 'Nov', score: 87, assignments: 11 },
                { month: 'Dec', score: 89, assignments: 13 },
                { month: 'Jan', score: 87, assignments: 10 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Study Time Distribution */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Weekly Study Time
            </CardTitle>
            <CardDescription>Hours spent studying each day this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={[
                { day: 'Mon', hours: 3.2, target: 3 },
                { day: 'Tue', hours: 2.8, target: 3 },
                { day: 'Wed', hours: 4.1, target: 3 },
                { day: 'Thu', hours: 3.5, target: 3 },
                { day: 'Fri', hours: 2.9, target: 3 },
                { day: 'Sat', hours: 1.8, target: 3 },
                { day: 'Sun', hours: 2.2, target: 3 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="day" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="#8b5cf6" 
                  fill="#8b5cf6" 
                  fillOpacity={0.3}
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Subject Comparison Histogram */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-secondary" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Histogram of your scores across all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { range: '90-100%', count: 8, color: '#10b981' },
                { range: '80-89%', count: 12, color: '#3b82f6' },
                { range: '70-79%', count: 6, color: '#f59e0b' },
                { range: '60-69%', count: 2, color: '#ef4444' },
                { range: '50-59%', count: 1, color: '#6b7280' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="range" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Class Performance Comparison */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Class Performance Comparison
            </CardTitle>
            <CardDescription>Your performance vs class average</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { subject: 'Math', yourScore: 92, classAvg: 78 },
                { subject: 'Physics', yourScore: 89, classAvg: 82 },
                { subject: 'Chemistry', yourScore: 78, classAvg: 75 },
                { subject: 'History', yourScore: 85, classAvg: 80 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="subject" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Bar dataKey="yourScore" fill="#3b82f6" name="Your Score" radius={[2, 2, 0, 0]} />
                <Bar dataKey="classAvg" fill="#94a3b8" name="Class Average" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Activity & Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Weekly Activity
            </CardTitle>
            <CardDescription>Your learning activity over the past week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                const values = [80, 65, 90, 75, 85, 45, 60];
                return (
                  <div key={day}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">{day}</span>
                      <span className="text-sm text-muted-foreground">{values[index]}min</span>
                    </div>
                    <Progress value={values[index]} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-warning" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest milestones and badges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-success/5">
                <Trophy className="h-8 w-8 text-success" />
                <div>
                  <h4 className="font-medium">Perfect Score</h4>
                  <p className="text-sm text-muted-foreground">
                    Achieved 100% on Mathematics Quiz
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">New</Badge>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
                <Flame className="h-8 w-8 text-accent" />
                <div>
                  <h4 className="font-medium">5-Day Streak</h4>
                  <p className="text-sm text-muted-foreground">
                    Maintained daily learning streak
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
                <Target className="h-8 w-8 text-secondary" />
                <div>
                  <h4 className="font-medium">Assignment Master</h4>
                  <p className="text-sm text-muted-foreground">
                    Completed 10 assignments this month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
          <CardDescription>AI-powered analysis of your learning patterns</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
            <div className="p-4 rounded-lg bg-success/5">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-medium text-success">Strength</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You excel in mathematical problem-solving and consistently perform above average in quantitative subjects.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-warning/5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Opportunity</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Consider spending more time on chemistry concepts. Practice problems could help improve your understanding.
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium text-primary">Recommendation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Your peak learning hours are between 9-11 AM. Schedule difficult subjects during this time for better retention.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Statistics;