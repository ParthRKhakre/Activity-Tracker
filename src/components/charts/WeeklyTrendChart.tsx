import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useProductivityStore } from '@/store/useProductivityStore';

export const WeeklyTrendChart = () => {
  const { tasks, currentDate } = useProductivityStore();

  const weeklyData = useMemo(() => {
    const data = [];
    const today = new Date(currentDate);

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      const completed = dayTasks.filter((t) => t.status === 'completed').length;
      const partial = dayTasks.filter((t) => t.status === 'partial').length;
      const total = dayTasks.length;
      const score = total > 0 ? Math.round(((completed + partial * 0.5) / total) * 100) : 0;

      data.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        score,
        completed,
        total,
        date: dateStr,
      });
    }

    return data;
  }, [tasks, currentDate]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-elevated rounded-lg p-3">
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground">
            {data.completed}/{data.total} tasks • <span className="text-primary font-medium">{data.score}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="chart-container"
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Weekly Trend</h3>
        <p className="text-sm text-muted-foreground">Last 7 days performance</p>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              domain={[0, 100]}
              ticks={[0, 50, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="hsl(160, 84%, 39%)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
