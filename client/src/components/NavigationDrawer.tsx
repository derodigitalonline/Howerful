import { HelpCircle, CheckSquare, Sparkles, Crown, Calendar, ShoppingBag, Home, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLocation, Link } from 'wouter';
import { cn } from '@/lib/utils';
import Logo from './Logo';
import { useProfile } from '@/hooks/useProfile';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from '@/App';

interface NavigationDrawerProps {
  onHelpClick?: () => void;
}

export default function NavigationDrawer({ onHelpClick }: NavigationDrawerProps) {
  const [location] = useLocation();
  const { profile } = useProfile();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const userName = profile.userName || 'User';
  const userInitial = userName[0].toUpperCase();

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
      label: 'TASK JOURNAL',
      path: '/',
      icon: Home,
      description: 'Track your tasks',
    },
    {
      label: 'FOCUS',
      path: '/focus',
      icon: Timer,
      description: 'Get stuff done',
    },
    {
      label: 'ROUTINES',
      path: '/routines',
      icon: Calendar,
      description: 'Daily habits',
    },
    {
      label: 'QUESTS',
      path: '/quests',
      icon: Sparkles,
      description: 'Unlock rewards',
    },
    {
      label: 'BAZAAR',
      path: '/bazaar',
      icon: ShoppingBag,
      description: 'Shop items',
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn(
        "fixed left-0 top-0 bottom-0 bg-card border-r flex flex-col transition-all duration-300",
        isCollapsed ? "w-20 p-4" : "w-64 p-6"
      )}>
        {/* Header with Logo */}
        <div>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed ? "justify-center" : "gap-2"
          )}>
            <Logo className="h-8 w-8 text-primary flex-shrink-0" />
            {!isCollapsed && <h1 className="text-2xl font-semibold">Howerful</h1>}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;

            const navLink = (
              <Link key={item.path} href={item.path}>
                <div
                  className={cn(
                    'group block flex items-center rounded-lg transition-all duration-200 cursor-pointer relative',
                    'hover:scale-[1.02]',
                    isActive && 'border-2 border-[hsl(var(--navy-border))]',
                    !isActive && 'border-2 border-transparent',
                    isCollapsed ? 'justify-center px-3 py-3' : 'gap-3 px-4 py-3 max-h-[54px]'
                  )}
                  style={{ overflow: 'hidden' }}
                >
                  {/* Gradient background for hover and active states */}
                  <div
                    className={cn(
                      'absolute inset-0 rounded-lg transition-opacity duration-200',
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    )}
                    style={{
                      background: 'linear-gradient(100deg, rgba(255, 255, 255, 0.8) 0%, rgba(61, 76, 123, 0.15) 100%)',
                    }}
                  />
                  <Icon className={cn(
                    "h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 relative z-10",
                    isActive ? 'text-[hsl(var(--navy-border))]' : 'text-foreground'
                  )} />
                  {!isCollapsed && (
                    <div className="flex-1 overflow-hidden relative z-10">
                      <div
                        className={cn(
                          "font-medium transition-colors",
                          isActive && 'text-[hsl(var(--navy-border))]'
                        )}
                        style={{ fontFamily: 'Boogaloo, cursive', fontSize: '17px' }}
                      >
                        {item.label}
                      </div>
                      <div className={cn(
                        "text-xs text-muted-foreground transition-all duration-200",
                        isActive
                          ? "opacity-100 max-h-6"
                          : "opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-6"
                      )}>
                        {item.description}
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    {navLink}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navLink;
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {/* User Profile Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/profile">
                <a className={cn(
                  'block transition-all',
                  isCollapsed ? '' : 'rounded-xl border-2 p-4 hover:border-primary/50 hover:bg-accent/50',
                  !isCollapsed && (location === '/profile' ? 'border-primary/50 bg-primary/5' : 'border-border bg-card')
                )}>
                  {isCollapsed ? (
                    // Collapsed: Just avatar with level badge (no container)
                    <div className="relative flex justify-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 border-2 border-primary/30 flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all">
                        <span className="text-lg font-bold text-primary">{userInitial}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <Badge
                          className={cn(
                            'font-bold text-[10px] px-1 py-0 whitespace-nowrap',
                            getLevelBadgeStyle(profile.level)
                          )}
                        >
                          {profile.level >= 50 ? (
                            <Crown className="w-2.5 h-2.5" />
                          ) : (
                            profile.level
                          )}
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    // Expanded: Full profile card
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 border-2 border-primary/30 flex items-center justify-center">
                          <span className="text-2xl font-bold text-primary">{userInitial}</span>
                        </div>
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
                      <div>
                        <p className="font-semibold text-sm">{userName}</p>
                        <p className="text-xs text-muted-foreground">Level {profile.level}</p>
                      </div>
                    </div>
                  )}
                </a>
              </Link>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">
                <p className="font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">Level {profile.level}</p>
              </TooltipContent>
            )}
          </Tooltip>

          {onHelpClick && !isCollapsed && (
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={onHelpClick}
            >
              <HelpCircle className="h-4 w-4" />
              Keyboard Shortcuts
            </Button>
          )}

          {onHelpClick && isCollapsed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="w-full"
                  onClick={onHelpClick}
                >
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Keyboard Shortcuts</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
