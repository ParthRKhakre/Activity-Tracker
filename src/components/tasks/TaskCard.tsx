import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Minus, X, MoreHorizontal, Pencil, Trash2, Code2, Brain, Trophy, GraduationCap, BarChart3, Target, Briefcase, User, Heart, Book } from 'lucide-react';
import { Task, Category } from '@/hooks/useTasksDB';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TaskEditModal } from './TaskEditModal';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TaskStatus = Database['public']['Enums']['task_status'];

interface TaskCardProps {
  task: Task;
  index: number;
  categories: Category[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

const iconMap: Record<string, React.ElementType> = {
  Code2,
  Brain,
  Trophy,
  GraduationCap,
  BarChart3,
  Target,
  briefcase: Briefcase,
  user: User,
  heart: Heart,
  book: Book,
  folder: Target,
};

const statusConfig = {
  pending: {
    bg: 'bg-muted',
    border: 'border-border',
    text: 'text-muted-foreground',
    icon: null,
  },
  'in-progress': {
    bg: 'bg-warning/10',
    border: 'border-warning/30',
    text: 'text-warning',
    icon: Minus,
  },
  completed: {
    bg: 'bg-success/10',
    border: 'border-success/30',
    text: 'text-success',
    icon: Check,
  },
};

export const TaskCard = ({ task, index, categories, onUpdateTask, onDeleteTask }: TaskCardProps) => {
  const { toast } = useToast();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const category = categories.find((c) => c.id === task.category_id);
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const CategoryIcon = category ? iconMap[category.icon] || Target : Target;

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await onUpdateTask(task.id, { status: newStatus });
    toast({
      title: "Status Updated",
      description: `Task marked as ${newStatus.replace('-', ' ')}`,
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDeleteTask(task.id);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
    toast({
      title: "Task Deleted",
      description: "The task has been removed successfully",
      variant: "destructive",
    });
  };

  const handleSaveEdit = async (updates: Partial<Task>) => {
    await onUpdateTask(task.id, updates);
    toast({
      title: "Task Updated",
      description: "Your changes have been saved",
    });
  };

  const statusButtons: { status: TaskStatus; icon: React.ElementType; label: string; color: string }[] = [
    { status: 'completed', icon: Check, label: 'Complete', color: 'hover:bg-success/20 hover:text-success hover:border-success/30' },
    { status: 'in-progress', icon: Minus, label: 'In Progress', color: 'hover:bg-warning/20 hover:text-warning hover:border-warning/30' },
    { status: 'pending', icon: X, label: 'Pending', color: 'hover:bg-danger/20 hover:text-danger hover:border-danger/30' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -2 }}
        className={cn(
          'task-card group relative',
          status.bg,
          status.border,
          'border'
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Category Icon */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              task.status === 'pending' ? 'bg-accent' : status.bg
            )}>
              <CategoryIcon className={cn('w-5 h-5', status.text)} />
            </div>

            {/* Task Info */}
            <div>
              <h3 className={cn(
                'font-semibold transition-colors',
                task.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
              )}>
                {task.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {category?.name || 'Uncategorized'}
              </p>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            {/* Status Buttons */}
            <div className="flex items-center gap-1">
              {statusButtons.map(({ status: btnStatus, icon: Icon, label, color }) => (
                <motion.button
                  key={btnStatus}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleStatusChange(btnStatus)}
                  className={cn(
                    'p-2 rounded-lg border border-transparent transition-all duration-200',
                    task.status === btnStatus
                      ? cn(statusConfig[btnStatus].bg, statusConfig[btnStatus].border, statusConfig[btnStatus].text)
                      : cn('text-muted-foreground', color)
                  )}
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </motion.button>
              ))}
            </div>

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={() => setIsEditModalOpen(true)}
                  className="cursor-pointer"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-danger cursor-pointer focus:text-danger"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Status Indicator */}
        {StatusIcon && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              'absolute -right-2 -top-2 w-6 h-6 rounded-full flex items-center justify-center',
              status.bg,
              'border',
              status.border
            )}
          >
            <StatusIcon className={cn('w-3 h-3', status.text)} />
          </motion.div>
        )}
      </motion.div>

      {/* Edit Modal */}
      <TaskEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        task={task}
        categories={categories}
        onSave={handleSaveEdit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{task.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-danger text-danger-foreground hover:bg-danger/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
