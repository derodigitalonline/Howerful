import { Grid2X2, HelpCircle, CheckSquare, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';

interface NavigationDrawerProps {
  onHelpClick?: () => void;
}

export default function NavigationDrawer({ onHelpClick }: NavigationDrawerProps) {
  const [location] = useLocation();

  const navItems = [
    {
      label: 'Track',
      path: '/',
      icon: CheckSquare,
      description: 'Manage your tasks',
    },
    {
      label: 'Progress',
      path: '/progress',
      icon: TrendingUp,
      description: 'View your stats',
    },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r p-6 flex flex-col">
      <div>
        <div className="flex items-center gap-3">
          <Grid2X2 className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold">Howerful</h1>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Enter</kbd> to add a task
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-8 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  isActive && 'bg-primary/10 text-primary font-medium'
                )}
              >
                <Icon className="h-5 w-5" />
                <div className="flex-1">
                  <div className="text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {item.description}
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        {onHelpClick && (
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={onHelpClick}
          >
            <HelpCircle className="h-4 w-4" />
            Keyboard Shortcuts
          </Button>
        )}
      </div>
    </div>
  );
}
