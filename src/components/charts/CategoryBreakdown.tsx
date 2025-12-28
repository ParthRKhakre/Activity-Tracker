import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProductivityStore } from '@/store/useProductivityStore';
import { Code2, Brain, Trophy, GraduationCap, BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Brain,
  Trophy,
  GraduationCap,
  BarChart3,
  Target,
};

const colorMap: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/20 text-blue-400',
  purple: 'bg-purple-500/20 text-purple-400',
  orange: 'bg-orange-500/20 text-orange-400',
  pink: 'bg-pink-500/20 text-pink-400',
  cyan: 'bg-cyan-500/20 text-cyan-400',
};

const barColorMap: Record<string, string> = {
  emerald: 'bg-emerald-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
};

export const CategoryBreakdown = () => {
  const { categories, tasks, currentDate } = useProductivityStore();

  const categoryStats = useMemo(() => {
    // Get last 30 days of data
    const today = new Date(currentDate);
    const stats: Record<string, { completed: number; total: number }> = {};

    categories.forEach((cat) => {
      stats[cat.id] = { completed: 0, total: 0 };
    });

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.date === dateStr);

      dayTasks.forEach((task) => {
        if (stats[task.category]) {
          stats[task.category].total++;
          if (task.status === 'completed') {
            stats[task.category].completed++;
          }
        }
      });
    }

    return categories.map((cat) => ({
      ...cat,
      completed: stats[cat.id].completed,
      total: stats[cat.id].total,
      percentage: stats[cat.id].total > 0 
        ? Math.round((stats[cat.id].completed / stats[cat.id].total) * 100) 
        : 0,
    })).sort((a, b) => b.percentage - a.percentage);
  }, [categories, tasks, currentDate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Category Performance</h3>
        <p className="text-sm text-muted-foreground">Last 30 days completion rate</p>
      </div>

      <div className="space-y-4">
        {categoryStats.map((category, index) => {
          const Icon = iconMap[category.icon] || Target;
          const colorClass = colorMap[category.color] || colorMap.emerald;
          const barColor = barColorMap[category.color] || barColorMap.emerald;

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground truncate">
                      {category.name}
                    </span>
                    <span className="text-sm font-bold text-foreground ml-2">
                      {category.percentage}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden ml-11">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                  className={cn('h-full rounded-full', barColor)}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 ml-11">
                {category.completed} of {category.total} tasks completed
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
