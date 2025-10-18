import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  delay: number;
}

interface ParticleBurstProps {
  x: number;
  y: number;
  color?: string;
  particleCount?: number;
}

export default function ParticleBurst({
  x,
  y,
  color = 'hsl(var(--primary))',
  particleCount = 12
}: ParticleBurstProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles in a circle
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const velocity = 60 + Math.random() * 40; // Random velocity between 60-100px

      newParticles.push({
        id: i,
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity,
        color,
        delay: Math.random() * 0.1, // Slight stagger
      });
    }
    setParticles(newParticles);
  }, [x, y, color, particleCount]);

  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: particle.color,
              boxShadow: `0 0 8px ${particle.color}`,
            }}
            initial={{
              x: 0,
              y: 0,
              scale: 1,
              opacity: 1
            }}
            animate={{
              x: particle.x,
              y: particle.y,
              scale: 0,
              opacity: 0
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: particle.delay,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
