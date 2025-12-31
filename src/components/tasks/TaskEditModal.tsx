import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Zap, Clock, AlertTriangle, FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Task, Category } from '@/hooks/useTasksDB';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type TaskUrgency = Database['public']['Enums']['task_urgency'];
type TaskImportance = Database['public']['Enums']['task_importance'];
type TaskPriority = Database['public']['Enums']['task_priority'];

interface TaskEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  categories: Category[];
  onSave: (updates: Partial<Task>) => Promise<void>;
}

export const TaskEditModal = ({ open, onOpenChange, task, categories, onSave }: TaskEditModalProps) => {
  const [name, setName] = useState(task.name);
  const [notes, setNotes] = useState(task.notes || '');
  const [categoryId, setCategoryId] = useState(task.category_id || '');
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [urgency, setUrgency] = useState<TaskUrgency>(task.urgency);
  const [importance, setImportance] = useState<TaskImportance>(task.importance);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(task.name);
    setNotes(task.notes || '');
    setCategoryId(task.category_id || '');
    setPriority(task.priority);
    setUrgency(task.urgency);
    setImportance(task.importance);
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    await onSave({
      name: name.trim(),
      notes: notes.trim() || undefined,
      category_id: categoryId || undefined,
      priority,
      urgency,
      importance,
    });
    setIsSaving(false);
    onOpenChange(false);
  };

  const priorityOptions = [
    { value: 'high', label: 'High', color: 'text-danger', bgColor: 'bg-danger/10' },
    { value: 'medium', label: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10' },
    { value: 'low', label: 'Low', color: 'text-success', bgColor: 'bg-success/10' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-primary" />
            </div>
            Edit Task
          </DialogTitle>
          <DialogDescription>
            Update the task details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Task Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name" className="text-sm font-medium">
              Task Name <span className="text-danger">*</span>
            </Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter task name..."
              className="bg-background border-border focus:border-primary"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit-notes" className="text-sm font-medium flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-muted-foreground" />
              Notes
            </Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              className="bg-background border-border focus:border-primary resize-none h-20"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="edit-category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-muted-foreground" />
              Priority Level
            </Label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPriority(option.value as TaskPriority)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border',
                    priority === option.value
                      ? `${option.bgColor} ${option.color} border-current`
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency & Importance Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Urgency */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                Urgency
              </Label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setUrgency('urgent')}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border text-left',
                    urgency === 'urgent'
                      ? 'bg-danger/10 text-danger border-danger/50'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  Urgent
                </button>
                <button
                  type="button"
                  onClick={() => setUrgency('not-urgent')}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border text-left',
                    urgency === 'not-urgent'
                      ? 'bg-primary/10 text-primary border-primary/50'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  Not Urgent
                </button>
              </div>
            </div>

            {/* Importance */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
                Importance
              </Label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setImportance('important')}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border text-left',
                    importance === 'important'
                      ? 'bg-warning/10 text-warning border-warning/50'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  Important
                </button>
                <button
                  type="button"
                  onClick={() => setImportance('not-important')}
                  className={cn(
                    'w-full py-2 px-3 rounded-lg text-sm font-medium transition-all border text-left',
                    importance === 'not-important'
                      ? 'bg-muted text-foreground border-border'
                      : 'bg-background border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  Not Important
                </button>
              </div>
            </div>
          </div>

          {/* Eisenhower Preview */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-muted/50 border border-border"
          >
            <p className="text-xs text-muted-foreground mb-1">Eisenhower Quadrant</p>
            <p className="text-sm font-medium text-foreground">
              {urgency === 'urgent' && importance === 'important' && '🔥 Do First - Critical tasks'}
              {urgency === 'urgent' && importance === 'not-important' && '👥 Delegate - Urgent but not important'}
              {urgency === 'not-urgent' && importance === 'important' && '📅 Schedule - Important but not urgent'}
              {urgency === 'not-urgent' && importance === 'not-important' && '🗑️ Eliminate - Consider removing'}
            </p>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || isSaving}
              className="flex-1 btn-primary"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
