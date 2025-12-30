import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { TaskList } from '@/components/tasks/TaskList';
import { MonthlyProgressChart } from '@/components/charts/MonthlyProgressChart';
import { WeeklyTrendChart } from '@/components/charts/WeeklyTrendChart';
import { CategoryBreakdown } from '@/components/charts/CategoryBreakdown';
import { StreakCalendar } from '@/components/streaks/StreakCalendar';
import { EisenhowerMatrix } from '@/components/eisenhower/EisenhowerMatrix';
import { TimeBlockView } from '@/components/timeblock/TimeBlockView';
import { useTasksDB } from '@/hooks/useTasksDB';

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));
  const { tasks, loading } = useTasksDB();

  // Calculate streak
  const { streakCount, longestStreak } = useMemo(() => {
    let streak = 0;
    let longest = 0;
    const today = new Date();
    let checkDate = new Date(today);

    while (true) {
      const dateStr = formatDate(checkDate);
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      
      if (dayTasks.length === 0) break;
      
      const allCompleted = dayTasks.every(
        (t) => t.status === 'completed' || t.status === 'in-progress'
      );
      
      if (!allCompleted) break;
      
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    if (streak > longest) {
      longest = streak;
    }

    return { streakCount: streak, longestStreak: longest };
  }, [tasks]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyProgressChart />
              <WeeklyTrendChart />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdown />
              <StreakCalendar />
            </div>
          </div>
        );
      case 'tasks':
        return <TaskList />;
      case 'analytics':
        return (
          <div className="space-y-6">
            <MonthlyProgressChart />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyTrendChart />
              <CategoryBreakdown />
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="space-y-6">
            <MonthlyProgressChart />
          </div>
        );
      case 'streaks':
        return (
          <div className="space-y-6">
            <StreakCalendar />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WeeklyTrendChart />
              <CategoryBreakdown />
            </div>
          </div>
        );
      case 'eisenhower':
        return <EisenhowerMatrix />;
      case 'timeblock':
        return <TimeBlockView />;
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-8"
          >
            <h3 className="text-xl font-semibold text-foreground mb-6">Settings</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <h4 className="font-medium text-foreground">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Enable dark theme</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-primary-foreground rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-b border-border">
                <div>
                  <h4 className="font-medium text-foreground">Notifications</h4>
                  <p className="text-sm text-muted-foreground">Enable task reminders</p>
                </div>
                <div className="w-12 h-6 bg-muted rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-muted-foreground rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <h4 className="font-medium text-foreground">Export Data</h4>
                  <p className="text-sm text-muted-foreground">Download your productivity data</p>
                </div>
                <button className="btn-secondary text-sm">Export</button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <TaskList />;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          streakCount={streakCount}
          longestStreak={longestStreak}
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Index;
