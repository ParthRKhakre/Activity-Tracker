import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category } from '@/hooks/useTasksDB';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Briefcase, User, Heart, Book, Code2, Brain, Trophy, GraduationCap, BarChart3, Target, Folder, Star, Zap, Coffee, Music, Camera, Gamepad2, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface CategoryManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  onUpdateCategory: (categoryId: string, updates: Partial<Category>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
}

const AVAILABLE_ICONS = [
  { name: 'briefcase', icon: Briefcase },
  { name: 'user', icon: User },
  { name: 'heart', icon: Heart },
  { name: 'book', icon: Book },
  { name: 'code2', icon: Code2 },
  { name: 'brain', icon: Brain },
  { name: 'trophy', icon: Trophy },
  { name: 'graduation-cap', icon: GraduationCap },
  { name: 'bar-chart', icon: BarChart3 },
  { name: 'target', icon: Target },
  { name: 'folder', icon: Folder },
  { name: 'star', icon: Star },
  { name: 'zap', icon: Zap },
  { name: 'coffee', icon: Coffee },
  { name: 'music', icon: Music },
  { name: 'camera', icon: Camera },
  { name: 'gamepad', icon: Gamepad2 },
  { name: 'plane', icon: Plane },
];

const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

const iconMap: Record<string, React.ElementType> = {
  briefcase: Briefcase,
  user: User,
  heart: Heart,
  book: Book,
  code2: Code2,
  brain: Brain,
  trophy: Trophy,
  'graduation-cap': GraduationCap,
  'bar-chart': BarChart3,
  target: Target,
  folder: Folder,
  star: Star,
  zap: Zap,
  coffee: Coffee,
  music: Music,
  camera: Camera,
  gamepad: Gamepad2,
  plane: Plane,
};

export const CategoryManagementModal = ({
  open,
  onOpenChange,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}: CategoryManagementModalProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setSelectedColor(AVAILABLE_COLORS[0]);
    setSelectedIcon('folder');
    setIsCreating(false);
    setEditingCategory(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (category: Category) => {
    setName(category.name);
    setSelectedColor(category.color);
    setSelectedIcon(category.icon);
    setEditingCategory(category);
    setIsCreating(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        toast({
          title: "Category Updated",
          description: `"${name}" has been updated`,
        });
      } else {
        await onAddCategory({
          name: name.trim(),
          color: selectedColor,
          icon: selectedIcon,
        });
        toast({
          title: "Category Created",
          description: `"${name}" has been created`,
        });
      }
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save category",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    
    try {
      await onDeleteCategory(deletingCategory.id);
      toast({
        title: "Category Deleted",
        description: `"${deletingCategory.name}" has been deleted`,
      });
      setDeletingCategory(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const showForm = isCreating || editingCategory;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Manage Categories
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Category List */}
            {!showForm && (
              <>
                <div className="space-y-2">
                  {categories.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No categories yet. Create one to get started!
                    </p>
                  ) : (
                    categories.map((category) => {
                      const IconComponent = iconMap[category.icon] || Folder;
                      return (
                        <div
                          key={category.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{ backgroundColor: `${category.color}20` }}
                            >
                              <IconComponent
                                className="h-4 w-4"
                                style={{ color: category.color }}
                              />
                            </div>
                            <span className="font-medium">{category.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleStartEdit(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <Button onClick={handleStartCreate} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </>
            )}

            {/* Create/Edit Form */}
            {showForm && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-name">Name</Label>
                  <Input
                    id="category-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter category name"
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={cn(
                          "w-8 h-8 rounded-full transition-all",
                          selectedColor === color
                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                            : "hover:scale-105"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Icon</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABLE_ICONS.map(({ name: iconName, icon: Icon }) => (
                      <button
                        key={iconName}
                        type="button"
                        className={cn(
                          "p-2 rounded-lg border transition-all",
                          selectedIcon === iconName
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border hover:border-primary/50 hover:bg-accent"
                        )}
                        onClick={() => setSelectedIcon(iconName)}
                      >
                        <Icon className="h-5 w-5" style={{ color: selectedColor }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${selectedColor}20` }}
                    >
                      {(() => {
                        const PreviewIcon = iconMap[selectedIcon] || Folder;
                        return <PreviewIcon className="h-4 w-4" style={{ color: selectedColor }} />;
                      })()}
                    </div>
                    <span className="font-medium">{name || 'Category Name'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving || !name.trim()} className="flex-1">
                    {isSaving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingCategory?.name}"? Tasks using this category will no longer have a category assigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
