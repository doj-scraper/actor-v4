"use client";

import { motion, Variants } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 lg:px-12 pt-32 pb-20">
      <motion.div
        className="text-center max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Large 404 */}
        <motion.div variants={itemVariants}>
          <div className="mb-8">
            <motion.h1
              className="heading-display text-8xl lg:text-9xl text-ct-accent font-bold"
              animate={{
                opacity: [1, 0.7, 1],
                scale: [1, 0.98, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              404
            </motion.h1>
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          className="heading-display text-3xl sm:text-4xl text-ct-text mb-4"
          variants={itemVariants}
        >
          PAGE NOT FOUND
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-ct-text-secondary text-sm lg:text-base mb-8"
          variants={itemVariants}
        >
          {"We couldn't find what you're looking for. The page may have been moved, deleted, or doesn't exist."}
        </motion.p>

        {/* Suggestions */}
        <motion.div
          className="space-y-3 mb-8"
          variants={itemVariants}
        >
          <p className="text-micro text-ct-text-secondary uppercase">Try these instead:</p>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="text-sm text-ct-accent hover:text-ct-accent/80 transition-colors flex items-center justify-center gap-2"
            >
              <span>Back to Home</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/catalog"
              className="text-sm text-ct-accent hover:text-ct-accent/80 transition-colors flex items-center justify-center gap-2"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>

        {/* Error Code */}
        <motion.div
          className="text-micro text-ct-text-secondary/50 space-y-1"
          variants={itemVariants}
        >
          <p>Error Code: 404</p>
          <p>If you believe this is a mistake, please contact support.</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
