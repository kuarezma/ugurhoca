'use client';

import { motion } from 'framer-motion';

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f97316', '#10b981', '#8b5cf6', '#f43f5e', '#14b8a6'];

interface FloatingShapesProps {
  count?: number;
}

export default function FloatingShapes({ count = 6 }: FloatingShapesProps) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full opacity-5"
          style={{
            width: 80,
            height: 80,
            background: COLORS[i % COLORS.length],
            left: `${(i * 18) % 90}%`,
            top: `${(i * 15) % 85}%`,
          }}
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}
