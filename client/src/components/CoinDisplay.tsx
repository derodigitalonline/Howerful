import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

interface CoinDisplayProps {
  coins: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
  variant?: 'default' | 'game';
  onPlusClick?: () => void;
}

export default function CoinDisplay({
  coins,
  size = 'md',
  showLabel = false,
  className = '',
  variant = 'default',
  onPlusClick
}: CoinDisplayProps) {
  const iconSize = size === 'sm' ? 24 : 28;
  const fontSize = size === 'sm' ? 'text-base' : 'text-lg';

  if (variant === 'game') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <div className="relative flex items-center">
          <img
            src="/assets/howie-coin.png"
            alt="Howie Coin"
            width={32}
            height={32}
            className="absolute left-0 z-10"
            style={{ transform: 'translateX(-50%)' }}
          />

          <div
            className="rounded-full px-6 py-2 flex items-center justify-center min-w-[100px] pl-8"
            style={{
              backgroundColor: '#3D4C7B',
              boxShadow: 'inset 0 2px 0 0 #2A3451'
            }}
          >
            <span className="text-xl font-bold text-white leading-none" style={{ fontFamily: 'Fugaz One, cursive' }}>
              {coins.toLocaleString()}
            </span>
          </div>
        </div>

        {onPlusClick && (
          <button
            onClick={onPlusClick}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{
              backgroundColor: '#3D4C7B',
              boxShadow: 'inset 0 1px 0 0 #2A3451'
            }}
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      <img
        src="/assets/howie-coin.png"
        alt="Howie Coin"
        width={iconSize}
        height={iconSize}
        className="block"
      />

      <span className={`${fontSize} font-bold text-foreground leading-none`}>
        {coins.toLocaleString()}
      </span>

      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none">
          Coins
        </span>
      )}
    </motion.div>
  );
}
