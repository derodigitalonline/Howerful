import { useProfile } from '@/hooks/useProfile';
import { Link, useLocation } from 'wouter';
import CoinDisplay from './CoinDisplay';
import { motion } from 'framer-motion';
import { Menu, LogIn, User, Sparkles, LogOut } from 'lucide-react';
import { useSidebar } from '@/App';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { toast } from 'sonner';

export default function TopBar() {
  const { profile } = useProfile();
  const { isAuthenticated, signOut } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const coins = profile.coins || 0;
  const userName = profile.userName || 'User';
  const initial = userName[0].toUpperCase();
  const isOnProfilePage = location === '/profile';

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Failed to sign out', {
        description: error.message,
      });
    } else {
      toast.success('Signed out successfully');
      setLocation('/');
    }
  };

  return (
    <div className={`fixed top-0 right-0 h-16 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center gap-4 z-50 transition-all duration-300 ${isCollapsed ? 'left-20' : 'left-64'}`}>
      {/* Hamburger Menu Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-2 hover:bg-accent rounded-lg transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Spacer to push content to the right */}
      <div className="flex-1" />

      {/* Right side content */}
      <div className="flex items-center gap-8">
        {/* Coin Display */}
        <div className="flex items-center">
          <CoinDisplay coins={coins} size="sm" />
        </div>

        {/* Profile Picture or Login Button */}
        {isAuthenticated ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="focus:outline-none">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-10 h-10 rounded-full
                    bg-gradient-to-br from-primary/20 to-chart-2/20
                    border-2
                    ${isOnProfilePage ? 'border-primary' : 'border-primary/30'}
                    flex items-center justify-center
                    cursor-pointer
                    hover:ring-2 hover:ring-primary/50
                    transition-all
                  `}
                >
                  <span className="text-sm font-bold text-primary">{initial}</span>
                </motion.div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setLocation('/profile')} className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLocation('/customize')} className="cursor-pointer">
                <Sparkles className="mr-2 h-4 w-4" />
                <span>Customize</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <a>
              <Button variant="default" size="compact" className="gap-2">
                <LogIn className="h-4 w-4" />
                Login / Register
              </Button>
            </a>
          </Link>
        )}
      </div>
    </div>
  );
}
