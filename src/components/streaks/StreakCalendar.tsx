import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProductivityStore } from '@/store/useProductivityStore';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export const StreakCalendar = () => {
  const { tasks, currentDate, streakCount, longestStreak } = useProductivityStore();

  const calendarData = useMemo(() => {
    const data: { date: string; score: number; isToday: boolean }[] = [];
    const today = new Date(currentDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() - 7 * 11); // Last 12 weeks

    for (let i = 0; i < 84; i++) { // 12 weeks * 7 days
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed' || t.status === 'partial').length;
      const total = dayTasks.length;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;

      data.push({
        date: dateStr,
        score: total > 0 ? score : -1, // -1 means no data
        isToday: dateStr === currentDate,
      });
    }

    return data;
  }, [tasks, currentDate]);

  const getColorClass = (score: number) => {
    if (score === -1) return 'bg-muted/30';
    if (score === 0) return 'bg-danger/30';
    if (score < 50) return 'bg-danger/50';
    if (score < 75) return 'bg-warning/50';
    if (score < 100) return 'bg-success/50';
    return 'bg-success';
  };

  const weeks = [];
  for (let i = 0; i < 12; i++) {
    weeks.push(calendarData.slice(i * 7, (i + 1) * 7));
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="chart-container"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-warning" />
            <span className="text-2xl font-bold text-foreground">{streakCount}</span>
          </div>
          <p className="text-xs text-muted-foreground">Current Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{longestStreak}</span>
          </div>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar className="w-5 h-5 text-blue-400" />
            <span className="text-2xl font-bold text-foreground">
              {calendarData.filter((d) => d.score >= 75).length}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Great Days</p>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">Activity Heatmap</h3>
        <p className="text-sm text-muted-foreground mb-4">Last 12 weeks of productivity</p>
      </div>

      <div className="flex gap-1">
        {/* Day Labels */}
        <div className="flex flex-col gap-1 pr-2">
          {dayLabels.map((day, i) => (
            <span
              key={i}
              className="text-[10px] text-muted-foreground h-3 flex items-center"
            >
              {i % 2 === 1 ? day : ''}
            </span>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex gap-1 flex-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <motion.div
                  key={day.date}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: (weekIndex * 7 + dayIndex) * 0.003 }}
                  className={cn(
                    'w-3 h-3 rounded-sm cursor-pointer transition-all hover:ring-2 hover:ring-primary/50',
                    getColorClass(day.score),
                    day.isToday && 'ring-2 ring-primary'
                  )}
                  title={`${day.date}: ${day.score >= 0 ? `${day.score}%` : 'No data'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-muted-foreground">Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-danger/30" />
          <div className="w-3 h-3 rounded-sm bg-warning/50" />
          <div className="w-3 h-3 rounded-sm bg-success/50" />
          <div className="w-3 h-3 rounded-sm bg-success" />
        </div>
        <span className="text-xs text-muted-foreground">More</span>
      </div>
    </motion.div>
  );
};
