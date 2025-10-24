import { motion } from 'framer-motion';

interface CoinDisplayProps {
  coins: number;
  size?: 'sm' | 'md'; // sm = 24px, md = 28px
  showLabel?: boolean;
  className?: string;
}

export default function CoinDisplay({
  coins,
  size = 'md',
  showLabel = false,
  className = ''
}: CoinDisplayProps) {
  const iconSize = size === 'sm' ? 24 : 28;
  const fontSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <motion.div
      className={`inline-flex items-center gap-1.5 ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
    >
      {/* Howie Coin Icon */}
      <img
        src="/assets/howie-coin.png"
        alt="Howie Coin"
        width={iconSize}
        height={iconSize}
        className="block"
      />

      {/* Coin Count */}
      <span className={`${fontSize} font-bold text-foreground leading-none`}>
        {coins.toLocaleString()}
      </span>

      {/* Optional Label */}
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide leading-none">
          Coins
        </span>
      )}
    </motion.div>
  );
}
