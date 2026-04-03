import { useCartStore } from '@/store/cartStore';

export const useCart = () => {
  return useCartStore();
};
