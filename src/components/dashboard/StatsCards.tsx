import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Flame, Target, Clock, Award } from 'lucide-react';
import { useProductivityStore } from '@/store/useProductivityStore';

export const StatsCards = () => {
  const { currentDate, getDailyEntry, streakCount, longestStreak, tasks } = useProductivityStore();
  const dailyEntry = getDailyEntry(currentDate);

  // Calculate weekly stats
  const getWeeklyStats = () => {
    const today = new Date(currentDate);
    let totalTasks = 0;
    let completedTasks = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      totalTasks += dayTasks.length;
      completedTasks += dayTasks.filter((t) => t.status === 'completed').length;
    }

    return { totalTasks, completedTasks, percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0 };
  };

  const weeklyStats = getWeeklyStats();

  const stats = [
    {
      title: 'Daily Score',
      value: `${dailyEntry.score}%`,
      subtitle: 'Productivity rating',
      icon: Target,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: dailyEntry.score >= 70 ? '+12%' : '-5%',
      trendUp: dailyEntry.score >= 70,
    },
    {
      title: 'Tasks Completed',
      value: dailyEntry.completedCount.toString(),
      subtitle: `of ${dailyEntry.totalCount} tasks`,
      icon: CheckCircle,
      color: 'text-success',
      bgColor: 'bg-success/10',
      trend: `${dailyEntry.totalCount > 0 ? Math.round((dailyEntry.completedCount / dailyEntry.totalCount) * 100) : 0}%`,
      trendUp: true,
    },
    {
      title: 'Current Streak',
      value: `${streakCount}`,
      subtitle: `Best: ${longestStreak} days`,
      icon: Flame,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      trend: streakCount > 0 ? 'Active' : 'Broken',
      trendUp: streakCount > 0,
    },
    {
      title: 'Weekly Progress',
      value: `${weeklyStats.percentage}%`,
      subtitle: `${weeklyStats.completedTasks}/${weeklyStats.totalTasks} tasks`,
      icon: TrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
      trend: weeklyStats.percentage >= 60 ? 'On track' : 'Needs focus',
      trendUp: weeklyStats.percentage >= 60,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="stat-card"
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${stat.trendUp ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-3xl font-bold text-foreground mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{stat.subtitle}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
