# Device Explorer Component

A sophisticated 2-panel hierarchical navigation interface for exploring mobile device inventory with drill-down capabilities, search functionality, and detailed product information.

## Overview

The `DeviceExplorer` component provides a comprehensive device catalog browsing experience using a hierarchical structure: **Brand → ModelType → Generation → Variant**.

### Key Features

✅ **Drill-Down Navigation**: Navigate seamlessly through 4 levels of device hierarchy
✅ **Breadcrumb Trail**: Clear visual path showing current navigation state
✅ **Global Search**: Search across all hierarchy levels with debounced results
✅ **2-Panel Layout**: Left panel for selection, right panel for details
✅ **Responsive Design**: Stacked on mobile (single column), side-by-side on desktop
✅ **Product Inventory**: Shows stock status, pricing, MOQ, and compatible parts
✅ **CT Token Theming**: Uses `ct-bg`, `ct-accent`, `ct-text`, `ct-text-secondary` colors
✅ **TypeScript Strict**: Full type safety with proper interfaces
✅ **Mock Data**: Complete hierarchy with realistic device data

## Component Architecture

```
DeviceExplorer
├── Search Bar (sticky, debounced)
├── Breadcrumb Trail (interactive navigation)
└── Main Grid (responsive 1 col mobile, 2 col desktop)
    ├── Left Panel (Selection List)
    │   ├── Brand Selection
    │   ├── ModelType Selection
    │   ├── Generation Selection
    │   └── Variant Selection
    └── Right Panel (Details Display)
        ├── Brand Overview
        ├── ModelType Overview
        ├── Generation Overview
        ├── Variant Details
        │   ├── Pricing & Inventory
        │   ├── MOQ
        │   ├── Specifications
        │   └── Compatible Parts
        └── Search Results
```

## Mock Data Structure

The component includes comprehensive mock data:

```typescript
MOCK_HIERARCHY: Brand[]
├── Apple
│   ├── iPhone
│   │   ├── iPhone 15 (2023)
│   │   │   ├── A3089 - iPhone 15 Pro Max
│   │   │   └── A2846 - iPhone 15
│   │   └── iPhone 14 (2022)
│   │       └── A2644 - iPhone 14 Pro
│   └── iPad
│       └── iPad Pro 12.9 (2024)
│           └── A2961 - iPad Pro 12.9-inch
└── Samsung
    └── Galaxy S
        └── Galaxy S24 (2024)
            ├── SM-S928B - Galaxy S24 Ultra
            └── SM-S921B - Galaxy S24+
```

## State Management

The component uses React hooks for state:

```typescript
// Navigation state tracks current position in hierarchy
interface NavigationState {
  level: 'brand' | 'modelType' | 'generation' | 'variant';
  brandId?: number;
  modelTypeId?: number;
  generationId?: number;
  variantId?: number;
}
```

## Search Functionality

- **Debounced Query**: 150ms debounce prevents excessive re-renders
- **Minimum Characters**: Requires 2+ characters to trigger search
- **Multi-Level Search**: Searches brands, models, generations, and variants
- **Field Matching**: Matches on model number and marketing name for variants
- **Result Limiting**: Shows top 8 results in card grid

### Search Implementation

```typescript
searchResults = useMemo(() => {
  // Searches:
  // - Brand name
  // - ModelType name
  // - Generation name
  // - Variant marketingName and modelNumber
}, [debouncedQuery])
```

## Navigation Features

### Breadcrumb Trail
- Shows current path (e.g., `Apple › iPhone › iPhone 15 › iPhone 15 Pro Max`)
- Clickable items for quick navigation backward
- Current level highlighted in `ct-accent` color
- Only appears after first selection

### Back Button
- Available on all non-root levels
- Reverts to previous navigation level
- Clears search when navigating

### Search Result Selection
- Clicking search results navigates directly to that item
- Automatically advances navigation to deepest available level
- Clears search query after selection

## Display Details

### Variant Details Panel

When a variant is selected, displays:

1. **Marketing Name & Model Number**
   - Primary identifier for the product

2. **Pricing Information**
   - Wholesale price in dollars (converted from cents)
   - "Request Quote" button if price is 0

3. **Stock Status**
   - Available quantity with icon
   - "Low Stock" warning if ≤10 units
   - "Out of stock" indicator with red icon

4. **Minimum Order Quantity (MOQ)**
   - Required minimum units per order

5. **Specifications**
   - Dynamic spec list from variant data
   - Key-value pairs (e.g., Capacity, Material, Display)

6. **Compatible Parts**
   - Placeholder list of compatible inventory
   - Future integration point for related products

### Overview Panels

**Brand Overview**:
- Model type count
- Grid of all model types in this brand

**ModelType Overview**:
- Generation count
- Details of each generation (year, variant count)

**Generation Overview**:
- All variants in generation
- Release year
- Variant count per generation

## Theming & Styling

Uses CellTech design tokens:

- **Background**: `bg-ct-bg` (#070A12)
- **Secondary BG**: `bg-ct-bg-secondary` (#111725)
- **Accent**: `ct-accent` (#00E5C0)
- **Text Primary**: `text-ct-text` (#F2F5FA)
- **Text Secondary**: `text-ct-text-secondary` (#A7B1C6)

### Responsive Behavior

**Mobile (< 768px)**:
- Single column layout
- Stacked panels
- Full-width search input
- Scrollable selection list (max-height 96)

**Desktop (≥ 768px)**:
- 2-column grid layout (`grid-cols-2`)
- Side-by-side panels
- Flexible height for details

## Price Handling

All prices are stored in **cents** internally:
- `wholesalePrice: 8900` = $89.00
- Display conversion: `(wholesalePrice / 100).toFixed(2)`

## TypeScript Strict Mode

Full type safety achieved through:
- Interface definitions for all data shapes
- Proper generic typing for hooks
- No `any` types
- Type narrowing with optional chaining
- Callback function typing

## Future Integration Points

1. **API Integration**: Replace `MOCK_HIERARCHY` with `/api/hierarchy` endpoint
2. **Product Details**: Expand compatible parts to show actual inventory
3. **Image Gallery**: Add variant images from asset storage
4. **Related Products**: Show compatible batteries, screens, cameras, etc.
5. **Stock Updates**: Real-time inventory syncing
6. **Pricing Tiers**: Support for bulk pricing and volume discounts

## Usage

### Basic Implementation

```tsx
import { DeviceExplorer } from '@/components/device-explorer';

export default function CatalogPage() {
  return <DeviceExplorer />;
}
```

### Mounted Locations

- Primary location: `/catalog/page.tsx`
- Can be embedded in other pages by importing the component

## Performance Optimizations

- **useMemo**: Search results cached until query changes
- **useCallback**: Navigation handlers memoized to prevent unnecessary renders
- **Debounced Search**: 150ms debounce prevents rapid state updates
- **Lazy Details**: Right panel only renders details for selected item

## Accessibility Features

- Breadcrumb uses semantic `<nav>` and `<ol>`
- Button labels are descriptive
- Icons paired with text labels
- Keyboard navigation support via button elements
- Proper ARIA attributes from Radix UI components

## File Location

- Component: `/celltech-frontend/components/device-explorer.tsx`
- Mounted on: `/celltech-frontend/app/catalog/page.tsx`

## Dependencies

- React 19+ (hooks: useState, useMemo, useCallback, useEffect)
- lucide-react (icons: Search, ChevronRight, Package, AlertCircle)
- @/components/ui/* (Card, Button, Input, Breadcrumb)
- @/lib/utils (cn utility for className merging)
- Tailwind CSS with CellTech tokens

## Next Steps

1. **Backend Integration**: Connect to actual `/api/hierarchy` endpoint
2. **Database Sync**: Load hierarchy from Prisma schema
3. **Image Support**: Add image URLs to variant data
4. **Related Products**: Integrate with parts inventory system
5. **Analytics**: Track user navigation paths and searches
