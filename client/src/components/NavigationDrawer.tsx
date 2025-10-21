import { HelpCircle, CheckSquare, Sparkles, Crown, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useProfile } from '@/hooks/useProfile';

interface NavigationDrawerProps {
  onHelpClick?: () => void;
}

export default function NavigationDrawer({ onHelpClick }: NavigationDrawerProps) {
  const [location] = useLocation();
  const { profile } = useProfile();

  // Get level badge color based on tier
  const getLevelBadgeStyle = (level: number) => {
    if (level >= 50) {
      return 'bg-black text-yellow-300 border-yellow-400 border-2';
    } else if (level >= 40) {
      return 'bg-primary text-primary-foreground';
    } else if (level >= 30) {
      return 'bg-destructive text-destructive-foreground';
    } else if (level >= 20) {
      return 'bg-success text-success-foreground';
    } else if (level >= 10) {
      return 'bg-blue-500 text-white';
    } else {
      return 'bg-muted text-muted-foreground';
    }
  };

  const navItems = [
    {
      label: 'Track',
      path: '/',
      icon: CheckSquare,
      description: 'Manage your tasks',
    },
    {
      label: 'Routines',
      path: '/routines',
      icon: Calendar,
      description: 'Daily habits',
    },
    {
      label: 'Quests',
      path: '/quests',
      icon: Sparkles,
      description: 'Unlock rewards',
    },
  ];

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r p-6 flex flex-col">
      <div>
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold">Howerful</h1>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          Do Tasks. Level Up!
          <br />
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+Enter</kbd> to start!
        </p>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-8 flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <a
                className={cn(
                  'block flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
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

      <div className="mt-auto space-y-3">
        {/* User Profile Card */}
        <Link href="/profile">
          <a className={cn(
            'block p-4 rounded-xl border-2 transition-all',
            'hover:border-primary/50 hover:bg-accent/50',
            location === '/profile' ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
          )}>
            <div className="flex flex-col items-center text-center gap-3">
              {/* Avatar Circle with Level Badge */}
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 border-2 border-primary/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">D</span>
                </div>

                {/* Level Badge */}
                <div className="absolute -bottom-1 left-0 right-0 flex justify-center">
                  <Badge
                    className={cn(
                      'font-bold text-xs px-2 py-0.5 whitespace-nowrap',
                      getLevelBadgeStyle(profile.level)
                    )}
                  >
                    {profile.level >= 50 ? (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        LVL 50
                      </span>
                    ) : (
                      `LVL ${profile.level}`
                    )}
                  </Badge>
                </div>
              </div>

              {/* User Info */}
              <div>
                <p className="font-semibold text-sm">Dero Digital</p>
                <p className="text-xs text-muted-foreground">@derodigital</p>
              </div>
            </div>
          </a>
        </Link>

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
