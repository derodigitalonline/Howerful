import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  {
    keys: ['Ctrl', 'Enter'],
    description: 'Add task to selected quadrant',
    category: 'Task Management',
  },
  {
    keys: ['Double Click'],
    description: 'Edit task text',
    category: 'Task Management',
  },
  {
    keys: ['Drag & Drop'],
    description: 'Move task between quadrants',
    category: 'Task Management',
  },
  {
    keys: ['Enter'],
    description: 'Save task when editing',
    category: 'Task Management',
  },
  {
    keys: ['Esc'],
    description: 'Cancel task editing',
    category: 'Task Management',
  },
  {
    keys: ['Ctrl', '←'],
    description: 'Switch to Personal workspace',
    category: 'Workspace',
  },
  {
    keys: ['Ctrl', '→'],
    description: 'Switch to Work workspace',
    category: 'Workspace',
  },
  {
    keys: ['?'],
    description: 'Show this help dialog',
    category: 'Navigation',
  },
  {
    keys: ['Ctrl', '/'],
    description: 'Show this help dialog',
    category: 'Navigation',
  },
];

const categories = Array.from(new Set(shortcuts.map(s => s.category)));

export default function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Master Howerful with these keyboard shortcuts to boost your productivity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-3">
                {shortcuts
                  .filter(s => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <div className="mt-0.5">💡</div>
            <div>
              <strong className="text-foreground">Pro tip:</strong> Use Howerful to prioritize tasks based on urgency and importance. Focus on "Do First" tasks, schedule time for important but not urgent work, delegate when possible, and eliminate time-wasters. Earn xp and upgrade your avatar as you progress!
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
