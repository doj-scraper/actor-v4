import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  count?: number;
}

export function Skeleton({ className, variant = 'rectangular', count = 1 }: SkeletonProps) {
  const baseClasses = 'bg-gradient-to-r from-ct-bg-secondary to-white/5';
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'w-10 h-10 rounded-full',
    rectangular: 'h-12 rounded-lg',
  };

  const skeletons = Array.from({ length: count }).map((_, i) => (
    <motion.div
      key={i}
      className={cn(baseClasses, variantClasses[variant], className)}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  ));

  return count > 1 ? <div className="space-y-3">{skeletons}</div> : skeletons[0];
}

// Skeleton for form inputs
export function FormInputSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

// Skeleton for product card
export function ProductCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

// Skeleton for table row
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex gap-4 p-4 border-b border-white/5">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="flex-1 h-4" />
      ))}
    </div>
  );
}

// Skeleton for page section
export function PageSectionSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
