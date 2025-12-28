import { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
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
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Coming Soon
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Time Blocking is under development. We're working hard to bring you powerful tools for better time management.
            </p>
          </motion.div>
        );
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
        <Header />
        
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
