# Device Explorer - Technical Specification

## Requirement Checklist

### ✅ 1. Drill-Down Navigation (Brand → ModelType → Generation → Variant)

**Implementation**:
```typescript
NavigationState {
  level: 'brand' | 'modelType' | 'generation' | 'variant'
  brandId?: number
  modelTypeId?: number
  generationId?: number
  variantId?: number
}
```

**Flow**:
1. User starts at Brand level (root)
2. Selects a brand → advances to ModelType level
3. Selects a model type → advances to Generation level
4. Selects a generation → advances to Variant level
5. Can navigate backward via breadcrumb or back button

**Handler Functions**:
- `handleSelectBrand()`: Sets level to 'brand', clears search
- `handleSelectModelType()`: Sets level to 'modelType', preserves brandId
- `handleSelectGeneration()`: Sets level to 'generation', preserves brandId + modelTypeId
- `handleSelectVariant()`: Sets level to 'variant', preserves full path
- `handleNavigateBack()`: Reverts one level up in hierarchy

---

### ✅ 2. Breadcrumb Trail Showing Current Path

**Components Used**:
- `<Breadcrumb>` - Semantic nav wrapper
- `<BreadcrumbList>` - Ordered list
- `<BreadcrumbItem>` - List items
- `<BreadcrumbLink>` - Clickable links
- `<BreadcrumbPage>` - Current page (non-clickable)
- `<BreadcrumbSeparator>` - Divider (ChevronRight icon)

**Display Logic**:
```tsx
// Show full path based on navigation state
Brand › ModelType › Generation › Variant

// Only show items that have been selected
// Current item uses ct-accent color
// Previous items clickable for backward navigation
```

**Features**:
- Hidden when at brand level (no parent to navigate to)
- Displays full path from root to current selection
- Color coding: previous levels in secondary, current in accent
- Clickable for quick backward navigation
- Responsive: wraps on mobile

---

### ✅ 3. Product Inventory Cards Showing Compatible Parts per Variant

**Variant Details Card Structure**:

```tsx
Variant Details Card
├── Header
│   ├── Marketing Name (title)
│   └── Model Number (subtitle)
├── Content
│   ├── Pricing & Inventory Grid
│   │   ├── Wholesale Price Card
│   │   │   ├── Label: "Wholesale Price"
│   │   │   ├── Amount: $XX.XX or "Request Quote" button
│   │   │   └── Styling: ct-accent for price
│   │   └── Stock Status Card
│   │       ├── Label: "Stock Status"
│   │       ├── Display: [Icon] X in stock
│   │       ├── Low Stock Warning: "⚠ Low stock" if ≤10
│   │       └── Out of Stock: Red icon + "Out of stock"
│   ├── MOQ Card
│   │   ├── Label: "Minimum Order Qty"
│   │   └── Value: X units
│   ├── Specifications Section
│   │   └── Dynamic list of spec key-value pairs
│   └── Compatible Parts Card
│       ├── Title: "Compatible Parts"
│       └── Parts list: Battery • Screen • Camera • etc
```

**Stock Status Logic**:
```typescript
if (availableStock === 0) {
  // Show: Out of stock (red icon)
} else if (availableStock <= 10) {
  // Show: X in stock + Low stock warning
} else {
  // Show: X in stock (green icon)
}
```

**Price Handling**:
```typescript
if (wholesalePrice > 0) {
  // Display: $(wholesalePrice / 100).toFixed(2)
} else {
  // Display: "Request Quote" button
}
```

---

### ✅ 4. Search Across All Levels

**Search Implementation**:

```typescript
searchResults = useMemo(() => {
  if (!debouncedQuery || debouncedQuery.length < 2) return null;
  
  const query = debouncedQuery.toLowerCase();
  const results = [];
  
  // Iterate entire hierarchy
  MOCK_HIERARCHY.forEach((brand) => {
    // Search Brand name
    if (brand.name.toLowerCase().includes(query)) {
      results.push({ type: 'brand', brand });
    }
    
    brand.modelTypes.forEach((modelType) => {
      // Search ModelType name
      if (modelType.name.toLowerCase().includes(query)) {
        results.push({ type: 'modelType', brand, modelType });
      }
      
      modelType.generations.forEach((generation) => {
        // Search Generation name
        if (generation.name.toLowerCase().includes(query)) {
          results.push({ type: 'generation', brand, modelType, generation });
        }
        
        generation.variants.forEach((variant) => {
          // Search variant marketingName and modelNumber
          if (
            variant.modelNumber.toLowerCase().includes(query) ||
            variant.marketingName.toLowerCase().includes(query)
          ) {
            results.push({ type: 'variant', brand, modelType, generation, variant });
          }
        });
      });
    });
  });
  
  return results;
}, [debouncedQuery]);
```

**Search Features**:
- **Debounce**: 150ms delay prevents excessive renders
- **Minimum Length**: 2+ characters required
- **Multi-field**: Searches name, modelNumber, marketingName
- **Result Limit**: Shows top 8 results
- **Card Display**: Results in responsive grid (1 col mobile, 2 col desktop)
- **Click Navigation**: Clicking result navigates to that item
- **Auto-Clear**: Search clears after navigation

---

### ✅ 5. Responsive Design (Stacked Mobile, Side-by-Side Desktop)

**Layout Grid**:

```tsx
// Mobile (< 768px):
<div className="grid grid-cols-1 gap-6">
  {/* Left panel full width */}
  {/* Right panel full width below */}
</div>

// Desktop (≥ 768px):
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Left panel 50% */}
  {/* Right panel 50% */}
</div>
```

**Component Responsive Behavior**:

**Search Bar**:
- Full width on all breakpoints
- Sticky positioning with blur backdrop
- Responsive padding

**Left Panel (Selection List)**:
- Full width on mobile, 50% on desktop
- Scrollable with `max-h-96 md:max-h-full`
- Wrapping buttons expand to full width on mobile

**Right Panel (Details)**:
- Full width on mobile, 50% on desktop
- Card-based layout adapts to space
- Details stack vertically on all sizes

**Breadcrumb**:
- Responsive flex wrapping: `flex-wrap`
- Responsive gap: `gap-1.5 sm:gap-2.5`

---

### ✅ 6. Use ct-* Tokens for Theming

**Color Tokens Used**:

```typescript
// From tailwind.config.js:
'ct-bg': '#070A12'              // Dark background
'ct-bg-secondary': '#111725'    // Secondary background
'ct-accent': '#00E5C0'          // Cyan/teal accent
'ct-text': '#F2F5FA'            // Primary text
'ct-text-secondary': '#A7B1C6'  // Secondary text
```

**Application Throughout**:

```tsx
// Background
<div className="bg-ct-bg">           // Page background
<div className="bg-ct-bg-secondary"> // Card/panel background

// Text Colors
<h2 className="text-ct-text">                    // Primary text
<span className="text-ct-text-secondary">        // Secondary text
<button className="text-ct-accent">             // Interactive, highlighted

// Accents
className="hover:text-ct-accent"                // Hover states
className="border-ct-accent"                    // Active borders
className="focus-visible:ring-ct-accent/20"    // Focus rings

// Transparency variants
className="bg-ct-bg/50"            // 50% opacity
className="border-ct-text/10"      // 10% opacity border
```

---

### ✅ 7. TypeScript Strict Mode

Full type safety with proper interfaces. No `any` types.

**Hook Usage**:
- `useState<NavigationState>()` with proper interface
- `useMemo<Brand | undefined>()` with return type
- `useCallback<(brand: Brand) => void>()` with signature

---

### ✅ 8. No Backend Wiring - Mock Data Only

**Mock Hierarchy**:
- Located in component itself: `const MOCK_HIERARCHY: Brand[] = [...]`
- Contains realistic Apple, Samsung device data
- Includes all 4 hierarchy levels

**Future API Integration Point**:
```typescript
// When ready, replace with:
// const data = await fetch('/api/hierarchy');
```

---

## Files Changed

1. **Created**: `/celltech-frontend/components/device-explorer.tsx`
2. **Modified**: `/celltech-frontend/app/catalog/page.tsx`

All requirements fully implemented and ready for deployment.
