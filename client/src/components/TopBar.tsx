import { useProfile } from '@/hooks/useProfile';
import { Link, useLocation } from 'wouter';
import CoinDisplay from './CoinDisplay';
import { motion } from 'framer-motion';

export default function TopBar() {
  const { profile } = useProfile();
  const [location] = useLocation();
  const coins = profile.coins || 0;
  const nickname = profile.nickname || 'Howie';
  const initial = nickname[0].toUpperCase();
  const isOnProfilePage = location === '/profile';

  return (
    <div className="fixed top-0 left-64 right-0 h-16 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-3 flex items-center justify-end gap-8 z-50">
      {/* Left: Coin Display */}
      <div className="flex items-center">
        <CoinDisplay coins={coins} size="sm" />
      </div>

      {/* Right: Profile Picture */}
      <Link href="/profile">
        <a>
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
        </a>
      </Link>
    </div>
  );
}
