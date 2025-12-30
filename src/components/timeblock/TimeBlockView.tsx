import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus, GripVertical, X } from 'lucide-react';
import { useTasksDB, Task } from '@/hooks/useTasksDB';
import { cn } from '@/lib/utils';

interface TimeBlock {
  id: string;
  taskId: string | null;
  startHour: number;
  duration: number;
}

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

export const TimeBlockView = () => {
  const { tasks, loading } = useTasksDB();
  const [currentDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const tasksForDate = useMemo(() => 
    tasks.filter(t => t.date === currentDate),
    [tasks, currentDate]
  );
  
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);

  const unscheduledTasks = useMemo(() => {
    const scheduledTaskIds = timeBlocks.map(b => b.taskId).filter(Boolean);
    return tasksForDate.filter(t => !scheduledTaskIds.includes(t.id));
  }, [tasksForDate, timeBlocks]);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    setDraggedTask(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverHour(null);
  };

  const handleDragOver = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    setDragOverHour(hour);
  };

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    if (taskId) {
      const filtered = timeBlocks.filter(b => b.taskId !== taskId);
      
      const newBlock: TimeBlock = {
        id: Math.random().toString(36).substr(2, 9),
        taskId,
        startHour: hour,
        duration: 1,
      };
      
      setTimeBlocks([...filtered, newBlock]);
    }
    
    setDraggedTask(null);
    setDragOverHour(null);
  };

  const removeBlock = (blockId: string) => {
    setTimeBlocks(blocks => blocks.filter(b => b.id !== blockId));
  };

  const getBlockForHour = (hour: number) => {
    return timeBlocks.find(b => b.startHour === hour);
  };

  const getTaskById = (taskId: string) => {
    return tasksForDate.find(t => t.id === taskId);
  };

  const formatHour = (hour: number) => {
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:00 ${suffix}`;
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
          <h2 className="text-2xl font-bold text-foreground">Time Blocking</h2>
          <p className="text-muted-foreground">
            Drag tasks to schedule your day
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{unscheduledTasks.length} unscheduled tasks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unscheduled Tasks */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-xl p-4 sticky top-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tasks to Schedule
            </h3>
            <div className="space-y-2">
              {unscheduledTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  All tasks scheduled!
                </p>
              ) : (
                unscheduledTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing group',
                      'hover:border-primary/50 transition-all',
                      draggedTask === task.id && 'opacity-50 scale-95'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm font-medium text-foreground flex-1">
                        {task.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        task.urgency === 'urgent' ? 'bg-danger/10 text-danger' : 'bg-muted text-muted-foreground'
                      )}>
                        {task.urgency === 'urgent' ? 'Urgent' : 'Not Urgent'}
                      </span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        task.importance === 'important' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                      )}>
                        {task.importance === 'important' ? 'Important' : 'Not Important'}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3">
          <div className="glass-card rounded-xl p-4 overflow-hidden">
            <div className="space-y-1">
              {HOURS.map((hour) => {
                const block = getBlockForHour(hour);
                const task = block?.taskId ? getTaskById(block.taskId) : null;
                const isDropTarget = dragOverHour === hour;

                return (
                  <motion.div
                    key={hour}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (hour - 6) * 0.02 }}
                    onDragOver={(e) => handleDragOver(e, hour)}
                    onDragLeave={() => setDragOverHour(null)}
                    onDrop={(e) => handleDrop(e, hour)}
                    className={cn(
                      'flex items-stretch min-h-[60px] rounded-lg transition-all duration-200',
                      isDropTarget && 'bg-primary/10 ring-2 ring-primary/50 ring-dashed'
                    )}
                  >
                    {/* Time Label */}
                    <div className="w-24 flex-shrink-0 flex items-center justify-end pr-4 text-sm text-muted-foreground font-medium">
                      {formatHour(hour)}
                    </div>

                    {/* Time Slot */}
                    <div className={cn(
                      'flex-1 border-l-2 pl-4 py-2 relative',
                      block ? 'border-primary' : 'border-border'
                    )}>
                      {block && task ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            'p-3 rounded-lg border bg-primary/10 border-primary/30',
                            'group relative'
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">
                              {task.name}
                            </span>
                            <button
                              onClick={() => removeBlock(block.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-danger/20 rounded transition-all"
                            >
                              <X className="w-4 h-4 text-danger" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            1 hour block
                          </p>
                        </motion.div>
                      ) : (
                        <div className={cn(
                          'h-full min-h-[44px] rounded-lg border-2 border-dashed transition-all',
                          isDropTarget 
                            ? 'border-primary bg-primary/5' 
                            : 'border-transparent hover:border-border'
                        )}>
                          {isDropTarget && (
                            <div className="h-full flex items-center justify-center text-sm text-primary">
                              Drop to schedule
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-4"
      >
        <h4 className="text-sm font-semibold text-foreground mb-3">Tips</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-primary/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Drag & Drop</span>
              <p className="text-muted-foreground">Drag tasks from the sidebar to a time slot</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-warning/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Prioritize</span>
              <p className="text-muted-foreground">Schedule important tasks during peak hours</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-3 h-3 rounded bg-success/50 mt-0.5" />
            <div>
              <span className="font-medium text-foreground">Focus Blocks</span>
              <p className="text-muted-foreground">Group similar tasks together for better flow</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
