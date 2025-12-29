import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Flame, Bell, Sun, Moon } from 'lucide-react';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const { currentDate, setCurrentDate, streakCount, longestStreak } = useProductivityStore();
  const { theme, toggleTheme } = useTheme();
  
  const date = new Date(currentDate);
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const isToday = currentDate === new Date().toISOString().split('T')[0];

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-16 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-6"
    >
      {/* Date Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{formattedDate}</span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateDate('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs"
          >
            Today
          </Button>
        )}
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Streak Badge */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="streak-badge"
        >
          <Flame className="w-4 h-4" />
          <span>{streakCount} day streak</span>
          {longestStreak > 0 && (
            <span className="text-xs text-muted-foreground">
              (Best: {longestStreak})
            </span>
          )}
        </motion.div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </motion.header>
  );
};
