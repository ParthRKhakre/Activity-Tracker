import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DbTask = Database['public']['Tables']['tasks']['Row'];
type DbCategory = Database['public']['Tables']['categories']['Row'];
type TaskStatus = Database['public']['Enums']['task_status'];
type TaskPriority = Database['public']['Enums']['task_priority'];
type TaskUrgency = Database['public']['Enums']['task_urgency'];
type TaskImportance = Database['public']['Enums']['task_importance'];

export interface Task {
  id: string;
  name: string;
  notes?: string;
  category_id?: string;
  status: TaskStatus;
  priority: TaskPriority;
  urgency: TaskUrgency;
  importance: TaskImportance;
  date: string;
  scheduled_time?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const useTasksDB = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    
    setCategories(data.map(cat => ({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
    })));
  }, [user]);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return;
    }
    
    setTasks(data.map(task => ({
      id: task.id,
      name: task.name,
      notes: task.notes ?? undefined,
      category_id: task.category_id ?? undefined,
      status: task.status,
      priority: task.priority,
      urgency: task.urgency,
      importance: task.importance,
      date: task.date,
      scheduled_time: task.scheduled_time ?? undefined,
      created_at: task.created_at,
      updated_at: task.updated_at,
    })));
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCategories();
      await fetchTasks();
      setLoading(false);
    };
    
    if (user) {
      loadData();
    } else {
      setTasks([]);
      setCategories([]);
      setLoading(false);
    }
  }, [user, fetchCategories, fetchTasks]);

  const addTask = async (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        name: task.name,
        notes: task.notes,
        category_id: task.category_id,
        status: task.status,
        priority: task.priority,
        urgency: task.urgency,
        importance: task.importance,
        date: task.date,
        scheduled_time: task.scheduled_time,
      })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
      return;
    }
    
    setTasks(prev => [...prev, {
      id: data.id,
      name: data.name,
      notes: data.notes ?? undefined,
      category_id: data.category_id ?? undefined,
      status: data.status,
      priority: data.priority,
      urgency: data.urgency,
      importance: data.importance,
      date: data.date,
      scheduled_time: data.scheduled_time ?? undefined,
      created_at: data.created_at,
      updated_at: data.updated_at,
    }]);
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('tasks')
      .update({
        name: updates.name,
        notes: updates.notes,
        category_id: updates.category_id,
        status: updates.status,
        priority: updates.priority,
        urgency: updates.urgency,
        importance: updates.importance,
        date: updates.date,
        scheduled_time: updates.scheduled_time,
      })
      .eq('id', taskId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return;
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
    ));
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return;
    }
    
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date);
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
      })
      .select()
      .single();
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
      return;
    }
    
    setCategories(prev => [...prev, {
      id: data.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
    }]);
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categories')
      .update({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
      })
      .eq('id', categoryId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
      return;
    }
    
    setCategories(prev => prev.map(c => 
      c.id === categoryId ? { ...c, ...updates } : c
    ));
  };

  const deleteCategory = async (categoryId: string) => {
    if (!user) return;
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
      return;
    }
    
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    // Also clear category_id from tasks that used this category
    setTasks(prev => prev.map(t => 
      t.category_id === categoryId ? { ...t, category_id: undefined } : t
    ));
  };

  return {
    tasks,
    categories,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTasksForDate,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: async () => {
      await fetchCategories();
      await fetchTasks();
    },
  };
};
