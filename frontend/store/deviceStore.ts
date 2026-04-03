import { create } from 'zustand';

export interface DeviceSearchResult {
  variantId: number;
  displayName: string;
  path: string;
}

interface DeviceState {
  searchQuery: string;
  searchResults: DeviceSearchResult[];
  setSearchQuery: (query: string) => void;
}

const DEVICES: DeviceSearchResult[] = [
  { variantId: 5001, displayName: 'iPhone 15 Pro Max', path: 'Apple › iPhone › iPhone 15 › A3089' },
  { variantId: 5002, displayName: 'iPhone 15', path: 'Apple › iPhone › iPhone 15 › A2846' },
  { variantId: 6001, displayName: 'Galaxy S24 Ultra', path: 'Samsung › Galaxy S › Galaxy S24 › SM-S928B' },
];

function filterDevices(query: string) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];
  return DEVICES.filter(
    (device) =>
      device.displayName.toLowerCase().includes(normalized) ||
      device.path.toLowerCase().includes(normalized)
  );
}

export const useDeviceStore = create<DeviceState>((set) => ({
  searchQuery: '',
  searchResults: [],
  setSearchQuery: (query: string) =>
    set({
      searchQuery: query,
      searchResults: filterDevices(query),
    }),
}));
