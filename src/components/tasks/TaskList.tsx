import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { useProductivityStore } from '@/store/useProductivityStore';
import { TaskCard } from './TaskCard';
import { TaskCreationModal } from './TaskCreationModal';
import { Button } from '@/components/ui/button';

export const TaskList = () => {
  const { currentDate, getTasksForDate, getDailyEntry, initializeDailyTasks } = useProductivityStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tasks = getTasksForDate(currentDate);
  const dailyEntry = getDailyEntry(currentDate);

  useEffect(() => {
    initializeDailyTasks(currentDate);
  }, [currentDate, initializeDailyTasks]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Today's Focus</h2>
          <p className="text-muted-foreground">
            {dailyEntry.completedCount} of {dailyEntry.totalCount} tasks completed
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      {/* Progress Bar */}
      <div className="glass-card rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">Daily Progress</span>
          <span className="text-sm font-bold text-primary">{dailyEntry.score}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dailyEntry.score}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
          />
        </div>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">
              {dailyEntry.completedCount} Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span className="text-xs text-muted-foreground">
              {dailyEntry.partialCount} Partial
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-danger" />
            <span className="text-xs text-muted-foreground">
              {dailyEntry.skippedCount} Skipped
            </span>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {tasks.length > 0 ? (
        <div className="grid gap-3">
          {tasks.map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No tasks for today
          </h3>
          <p className="text-muted-foreground mb-4">
            Your daily tasks will appear here. Start by adding your first task.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Task
          </Button>
        </motion.div>
      )}

      {/* Task Creation Modal */}
      <TaskCreationModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </motion.div>
  );
};
