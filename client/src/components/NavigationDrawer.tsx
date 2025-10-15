import { Grid2X2 } from 'lucide-react';

export default function NavigationDrawer() {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r p-6">
      <div className="flex items-center gap-3">
        <Grid2X2 className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-semibold">Howeful</h1>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Enter</kbd> to add a task
      </p>
    </div>
  );
}
