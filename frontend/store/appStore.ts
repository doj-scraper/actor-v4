import { create } from 'zustand';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface AppState {
  notifications: Notification[];
  isDarkMode: boolean;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set: any) => ({
  notifications: [],
  isDarkMode: true,

  addNotification: (notification: Omit<Notification, 'id'>) => set((state: AppState) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    if (notification.duration) {
      setTimeout(() => {
        set((s: AppState) => ({
          notifications: s.notifications.filter((n: Notification) => n.id !== id)
        }));
      }, notification.duration);
    }

    return {
      notifications: [...state.notifications, newNotification]
    };
  }),

  removeNotification: (id: string) => set((state: AppState) => ({
    notifications: state.notifications.filter((n: Notification) => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] }),

  toggleDarkMode: () => set((state: AppState) => ({
    isDarkMode: !state.isDarkMode
  }))
}));
