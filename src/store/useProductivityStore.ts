import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TaskStatus = 'pending' | 'completed' | 'partial' | 'skipped';

export interface Task {
  id: string;
  name: string;
  category: string;
  status: TaskStatus;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface DailyEntry {
  date: string;
  tasks: Task[];
  completedCount: number;
  partialCount: number;
  skippedCount: number;
  totalCount: number;
  score: number;
}

interface ProductivityState {
  categories: Category[];
  tasks: Task[];
  currentDate: string;
  streakCount: number;
  longestStreak: number;
  
  // Actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  setCurrentDate: (date: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (categoryId: string) => void;
  getTasksForDate: (date: string) => Task[];
  getDailyEntry: (date: string) => DailyEntry;
  getMonthlyData: (year: number, month: number) => DailyEntry[];
  calculateStreak: () => void;
  initializeDailyTasks: (date: string) => void;
}

const defaultCategories: Category[] = [
  { id: '1', name: 'DSA', color: 'emerald', icon: 'Code2' },
  { id: '2', name: 'Data Science/ML', color: 'blue', icon: 'Brain' },
  { id: '3', name: 'Competitive Programming', color: 'purple', icon: 'Trophy' },
  { id: '4', name: 'Academic Studies', color: 'orange', icon: 'GraduationCap' },
  { id: '5', name: 'Statistics', color: 'pink', icon: 'BarChart3' },
  { id: '6', name: 'CAT Preparation', color: 'cyan', icon: 'Target' },
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const useProductivityStore = create<ProductivityState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,
      tasks: [],
      currentDate: formatDate(new Date()),
      streakCount: 0,
      longestStreak: 0,

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
      },

      updateTaskStatus: (taskId, status) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, status, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
        get().calculateStreak();
      },

      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },

      setCurrentDate: (date) => {
        set({ currentDate: date });
        get().initializeDailyTasks(date);
      },

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: generateId(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (categoryId, updates) => {
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === categoryId ? { ...cat, ...updates } : cat
          ),
        }));
      },

      deleteCategory: (categoryId) => {
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== categoryId),
          tasks: state.tasks.filter((task) => task.category !== categoryId),
        }));
      },

      getTasksForDate: (date) => {
        return get().tasks.filter((task) => task.date === date);
      },

      getDailyEntry: (date) => {
        const tasks = get().getTasksForDate(date);
        const completedCount = tasks.filter((t) => t.status === 'completed').length;
        const partialCount = tasks.filter((t) => t.status === 'partial').length;
        const skippedCount = tasks.filter((t) => t.status === 'skipped').length;
        const totalCount = tasks.length;
        
        const score = totalCount > 0
          ? Math.round(((completedCount * 1 + partialCount * 0.5) / totalCount) * 100)
          : 0;

        return {
          date,
          tasks,
          completedCount,
          partialCount,
          skippedCount,
          totalCount,
          score,
        };
      },

      getMonthlyData: (year, month) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const entries: DailyEntry[] = [];

        for (let day = 1; day <= daysInMonth; day++) {
          const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          entries.push(get().getDailyEntry(date));
        }

        return entries;
      },

      calculateStreak: () => {
        const tasks = get().tasks;
        const today = new Date();
        let streak = 0;
        let longestStreak = get().longestStreak;
        let currentDate = new Date(today);

        while (true) {
          const dateStr = formatDate(currentDate);
          const dayTasks = tasks.filter((t) => t.date === dateStr);
          
          if (dayTasks.length === 0) break;
          
          const allCompleted = dayTasks.every(
            (t) => t.status === 'completed' || t.status === 'partial'
          );
          
          if (!allCompleted) break;
          
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        }

        if (streak > longestStreak) {
          longestStreak = streak;
        }

        set({ streakCount: streak, longestStreak });
      },

      initializeDailyTasks: (date) => {
        const existingTasks = get().getTasksForDate(date);
        const categories = get().categories;

        if (existingTasks.length === 0) {
          const newTasks: Task[] = categories.map((cat) => ({
            id: generateId(),
            name: cat.name,
            category: cat.id,
            status: 'pending' as TaskStatus,
            date,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));

          set((state) => ({
            tasks: [...state.tasks, ...newTasks],
          }));
        }
      },
    }),
    {
      name: 'productivity-storage',
    }
  )
);
