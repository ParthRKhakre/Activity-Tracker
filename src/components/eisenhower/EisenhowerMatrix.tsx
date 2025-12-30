import { useMemo, useState } from 'react';
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
  ArrowRight,
  GripVertical
} from 'lucide-react';
import { useTasksDB, Task } from '@/hooks/useTasksDB';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];
type TaskUrgency = Database['public']['Enums']['task_urgency'];
type TaskImportance = Database['public']['Enums']['task_importance'];
type QuadrantType = 'do' | 'schedule' | 'delegate' | 'eliminate';

interface QuadrantConfig {
  urgency: TaskUrgency;
  importance: TaskImportance;
}

const quadrantConfig: Record<QuadrantType, QuadrantConfig> = {
  do: { urgency: 'urgent', importance: 'important' },
  schedule: { urgency: 'not-urgent', importance: 'important' },
  delegate: { urgency: 'urgent', importance: 'not-important' },
  eliminate: { urgency: 'not-urgent', importance: 'not-important' },
};

interface QuadrantProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  tasks: Task[];
  quadrant: QuadrantType;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onDrop: (taskId: string, quadrant: QuadrantType) => void;
  draggedTask: string | null;
}

const quadrantStyles = {
  do: {
    bg: 'bg-danger/5',
    border: 'border-danger/30',
    header: 'bg-danger/10 text-danger',
    accent: 'text-danger',
    dropzone: 'border-danger/50 bg-danger/10',
  },
  schedule: {
    bg: 'bg-primary/5',
    border: 'border-primary/30',
    header: 'bg-primary/10 text-primary',
    accent: 'text-primary',
    dropzone: 'border-primary/50 bg-primary/10',
  },
  delegate: {
    bg: 'bg-warning/5',
    border: 'border-warning/30',
    header: 'bg-warning/10 text-warning',
    accent: 'text-warning',
    dropzone: 'border-warning/50 bg-warning/10',
  },
  eliminate: {
    bg: 'bg-muted/30',
    border: 'border-border',
    header: 'bg-muted text-muted-foreground',
    accent: 'text-muted-foreground',
    dropzone: 'border-muted-foreground/50 bg-muted/50',
  },
};

interface TaskItemProps {
  task: Task;
  index: number;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  isDragging: boolean;
}

const TaskItem = ({ task, index, onUpdateStatus, isDragging }: TaskItemProps) => {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        className={cn(
          'p-3 rounded-lg border bg-card/50 group cursor-grab active:cursor-grabbing',
          task.status === 'completed' && 'opacity-60',
          isDragging && 'opacity-50 scale-95'
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className={cn(
              'text-sm font-medium flex-1',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}>
              {task.name}
            </span>
          </div>
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
              onClick={() => onUpdateStatus(task.id, 'in-progress')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                task.status === 'in-progress' 
                  ? 'bg-warning/20 text-warning' 
                  : 'hover:bg-warning/20 hover:text-warning text-muted-foreground'
              )}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateStatus(task.id, 'pending')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                task.status === 'pending' 
                  ? 'bg-danger/20 text-danger' 
                  : 'hover:bg-danger/20 hover:text-danger text-muted-foreground'
              )}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Quadrant = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  tasks, 
  quadrant, 
  onUpdateStatus,
  onDrop,
  draggedTask 
}: QuadrantProps) => {
  const styles = quadrantStyles[quadrant];
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onDrop(taskId, quadrant);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'rounded-xl border overflow-hidden flex flex-col transition-all duration-200',
        styles.bg,
        styles.border,
        isDragOver && styles.dropzone,
        isDragOver && 'border-dashed border-2 scale-[1.02]'
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
          <div className={cn(
            "text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-lg",
            isDragOver ? 'border-current bg-current/5' : 'border-transparent'
          )}>
            {isDragOver ? 'Drop here' : 'Drag tasks here'}
          </div>
        ) : (
          tasks.map((task, index) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              index={index} 
              onUpdateStatus={onUpdateStatus}
              isDragging={draggedTask === task.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export const EisenhowerMatrix = () => {
  const { tasks, updateTask, loading } = useTasksDB();
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  const tasksForDate = useMemo(() => 
    tasks.filter(t => t.date === currentDate),
    [tasks, currentDate]
  );

  const categorizedTasks = useMemo(() => {
    return {
      do: tasksForDate.filter(t => t.urgency === 'urgent' && t.importance === 'important'),
      schedule: tasksForDate.filter(t => t.urgency === 'not-urgent' && t.importance === 'important'),
      delegate: tasksForDate.filter(t => t.urgency === 'urgent' && t.importance === 'not-important'),
      eliminate: tasksForDate.filter(t => t.urgency === 'not-urgent' && t.importance === 'not-important'),
    };
  }, [tasksForDate]);

  const handleUpdateStatus = async (taskId: string, status: TaskStatus) => {
    await updateTask(taskId, { status });
  };

  const handleDrop = async (taskId: string, quadrant: QuadrantType) => {
    const config = quadrantConfig[quadrant];
    await updateTask(taskId, { urgency: config.urgency, importance: config.importance });
    setDraggedTask(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Eisenhower Matrix</h2>
          <p className="text-muted-foreground">
            Drag tasks between quadrants to reprioritize
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
            onUpdateStatus={handleUpdateStatus}
            onDrop={handleDrop}
            draggedTask={draggedTask}
          />
          <Quadrant
            title="Schedule"
            subtitle="Not Urgent & Important"
            icon={Calendar}
            tasks={categorizedTasks.schedule}
            quadrant="schedule"
            onUpdateStatus={handleUpdateStatus}
            onDrop={handleDrop}
            draggedTask={draggedTask}
          />
        </div>
        <Quadrant
          title="Delegate"
          subtitle="Urgent & Not Important"
          icon={Users}
          tasks={categorizedTasks.delegate}
          quadrant="delegate"
          onUpdateStatus={handleUpdateStatus}
          onDrop={handleDrop}
          draggedTask={draggedTask}
        />
        <Quadrant
          title="Eliminate"
          subtitle="Not Urgent & Not Important"
          icon={Trash2}
          tasks={categorizedTasks.eliminate}
          quadrant="eliminate"
          onUpdateStatus={handleUpdateStatus}
          onDrop={handleDrop}
          draggedTask={draggedTask}
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
