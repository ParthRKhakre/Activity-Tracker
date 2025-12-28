import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useProductivityStore } from '@/store/useProductivityStore';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export const MonthlyProgressChart = () => {
  const { getMonthlyData, currentDate } = useProductivityStore();
  const [viewMonth, setViewMonth] = useState(() => {
    const d = new Date(currentDate);
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const monthlyData = useMemo(() => {
    return getMonthlyData(viewMonth.year, viewMonth.month).map((entry) => ({
      day: parseInt(entry.date.split('-')[2]),
      completed: entry.completedCount,
      partial: entry.partialCount,
      skipped: entry.skippedCount,
      total: entry.totalCount,
      score: entry.score,
      date: entry.date,
    }));
  }, [getMonthlyData, viewMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setViewMonth((prev) => {
      let newMonth = prev.month + (direction === 'next' ? 1 : -1);
      let newYear = prev.year;
      if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      }
      return { year: newYear, month: newMonth };
    });
  };

  const monthName = new Date(viewMonth.year, viewMonth.month).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-elevated rounded-lg p-3 min-w-[140px]">
          <p className="text-sm font-semibold text-foreground mb-2">Day {label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-success">Completed</span>
              <span className="font-medium">{data.completed}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-warning">Partial</span>
              <span className="font-medium">{data.partial}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-danger">Skipped</span>
              <span className="font-medium">{data.skipped}</span>
            </div>
            <div className="border-t border-border mt-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Score</span>
                <span className="font-bold text-primary">{data.score}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return 'hsl(160, 84%, 39%)'; // success
    if (score >= 50) return 'hsl(38, 92%, 50%)'; // warning
    if (score > 0) return 'hsl(0, 84%, 60%)'; // danger
    return 'hsl(217, 33%, 17%)'; // muted
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="chart-container"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Monthly Progress</h3>
          <p className="text-sm text-muted-foreground">Daily productivity scores</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[120px] text-center">{monthName}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              interval={2}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 11 }}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(217, 33%, 17%)', radius: 4 }} />
            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={24}>
              {monthlyData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-success" />
          <span className="text-xs text-muted-foreground">80%+ Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-warning" />
          <span className="text-xs text-muted-foreground">50-79% Score</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-danger" />
          <span className="text-xs text-muted-foreground">&lt;50% Score</span>
        </div>
      </div>
    </motion.div>
  );
};
