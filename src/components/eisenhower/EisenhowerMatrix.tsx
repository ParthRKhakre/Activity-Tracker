import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Calendar, 
  Users, 
  Trash2, 
  Check, 
  Minus, 
  X,
  ArrowUp,
  ArrowRight
} from 'lucide-react';
import { Task, TaskStatus, TaskUrgency, TaskImportance, useProductivityStore } from '@/store/useProductivityStore';
import { cn } from '@/lib/utils';

interface QuadrantProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tasks: Task[];
  quadrant: 'do' | 'schedule' | 'delegate' | 'eliminate';
  onUpdateTask: (taskId: string, urgency: TaskUrgency, importance: TaskImportance) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const quadrantStyles = {
  do: {
    bg: 'bg-danger/5',
    border: 'border-danger/30',
    header: 'bg-danger/10 text-danger',
    accent: 'text-danger',
  },
  schedule: {
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    header: 'bg-primary/10 text-primary',
    accent: 'text-primary',
  },
  delegate: {
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    header: 'bg-warning/10 text-warning',
    accent: 'text-warning',
  },
  eliminate: {
    bg: 'bg-muted/30',
    border: 'border-border',
    header: 'bg-muted text-muted-foreground',
    accent: 'text-muted-foreground',
  },
};

const Quadrant = ({ title, subtitle, icon: Icon, tasks, quadrant, onUpdateStatus }: QuadrantProps) => {
  const styles = quadrantStyles[quadrant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-xl border overflow-hidden flex flex-col',
        styles.bg,
        styles.border
      )}
    >
      {/* Header */}
      <div className={cn('px-4 py-3 flex items-center gap-3', styles.header)}>
        <Icon className="w-5 h-5" />
        <div>
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs opacity-70">{subtitle}</p>
        </div>
        <span className="ml-auto text-xs font-bold bg-background/20 px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[280px]">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No tasks in this quadrant
          </div>
        ) : (
          tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-3 rounded-lg border bg-card/50 group',
                task.status === 'completed' && 'opacity-60'
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  'text-sm font-medium flex-1',
                  task.status === 'completed' && 'line-through text-muted-foreground'
                )}>
                  {task.name}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onUpdateStatus(task.id, 'completed')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      task.status === 'completed' 
                        ? 'bg-success/20 text-success' 
                        : 'hover:bg-success/20 hover:text-success text-muted-foreground'
                    )}
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(task.id, 'partial')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      task.status === 'partial' 
                        ? 'bg-warning/20 text-warning' 
                        : 'hover:bg-warning/20 hover:text-warning text-muted-foreground'
                    )}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onUpdateStatus(task.id, 'skipped')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      task.status === 'skipped' 
                        ? 'bg-danger/20 text-danger' 
                        : 'hover:bg-danger/20 hover:text-danger text-muted-foreground'
                    )}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export const EisenhowerMatrix = () => {
  const { currentDate, getTasksForDate, updateTaskStatus, updateTask } = useProductivityStore();
  const tasks = getTasksForDate(currentDate);

  const categorizedTasks = useMemo(() => {
    return {
      do: tasks.filter(t => t.urgency === 'urgent' && t.importance === 'important'),
      schedule: tasks.filter(t => t.urgency === 'not-urgent' && t.importance === 'important'),
      delegate: tasks.filter(t => t.urgency === 'urgent' && t.importance === 'not-important'),
      eliminate: tasks.filter(t => t.urgency === 'not-urgent' && t.importance === 'not-important'),
    };
  }, [tasks]);

  const handleUpdateTask = (taskId: string, urgency: TaskUrgency, importance: TaskImportance) => {
    updateTask(taskId, { urgency, importance });
  };

  const handleUpdateStatus = (taskId: string, status: TaskStatus) => {
    updateTaskStatus(taskId, status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Eisenhower Matrix</h2>
          <p className="text-muted-foreground">
            Prioritize tasks by urgency and importance
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <ArrowUp className="w-4 h-4" />
            <span>Important</span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>Urgent</span>
          </div>
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="grid grid-cols-2 gap-4 h-[600px]">
        {/* Row Labels */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          <Quadrant
            title="Do First"
            subtitle="Urgent & Important"
            icon={Zap}
            tasks={categorizedTasks.do}
            quadrant="do"
            onUpdateTask={handleUpdateTask}
            onUpdateStatus={handleUpdateStatus}
          />
          <Quadrant
            title="Schedule"
            subtitle="Not Urgent & Important"
            icon={Calendar}
            tasks={categorizedTasks.schedule}
            quadrant="schedule"
            onUpdateTask={handleUpdateTask}
            onUpdateStatus={handleUpdateStatus}
          />
        </div>
        <Quadrant
          title="Delegate"
          subtitle="Urgent & Not Important"
          icon={Users}
          tasks={categorizedTasks.delegate}
          quadrant="delegate"
          onUpdateTask={handleUpdateTask}
          onUpdateStatus={handleUpdateStatus}
        />
        <Quadrant
          title="Eliminate"
          subtitle="Not Urgent & Not Important"
          icon={Trash2}
          tasks={categorizedTasks.eliminate}
          quadrant="eliminate"
          onUpdateTask={handleUpdateTask}
          onUpdateStatus={handleUpdateStatus}
        />
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-4"
      >
        <h4 className="text-sm font-semibold text-foreground mb-3">How to Use</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-danger/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Do First</span>
              <p className="text-muted-foreground">Complete these tasks immediately</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-primary/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Schedule</span>
              <p className="text-muted-foreground">Plan time for these tasks</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-warning/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Delegate</span>
              <p className="text-muted-foreground">Assign to someone else</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-muted mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Eliminate</span>
              <p className="text-muted-foreground">Consider removing these</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
