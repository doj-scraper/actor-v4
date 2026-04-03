# CellTech Frontend Component Audit

## Overview
Next.js ecommerce app with **80+ components** across 5 design system layers. Built on shadcn/ui (52 components) + custom form/product/section components. **3 critical duplications** identified.

---

## Design System Classification

### 🎨 Tokens & Foundations
- **Color System**: Custom palette (`ct-bg`, `ct-accent`, `ct-text`) + HSL CSS variables
- **Typography**: 4 font families (sans, display, body, mono)
- **Spacing**: Tailwind defaults + custom keyframes (float, drift, border-pulse)
- **Shadows**: xs, card, glow
- **Border Radius**: xs, sm, md, lg, xl (computed from CSS var)

### 🧩 Atoms (21 files)
| Component | File | Variants |
|-----------|------|----------|
| Button | `ui/button.tsx` | default, destructive, outline, secondary, ghost, link |
| Input | `ui/input.tsx` | - |
| Label | `ui/label.tsx` | - |
| Badge | `ui/badge.tsx` | - |
| Avatar | `ui/avatar.tsx` | - |
| Switch | `ui/switch.tsx` | - |
| Skeleton | `ui/skeleton.tsx` | - |
| Spinner | `ui/spinner.tsx` | - |
| **Form Atoms** | | |
| FormInput | `forms/FormInput.tsx` | error, success, loading states |
| FormCheckbox | `forms/FormCheckbox.tsx` | - |
| FormRadio | `forms/FormRadio.tsx` | - |
| FormSelect | `forms/FormSelect.tsx` | - |
| FormTextarea | `forms/FormTextarea.tsx` | - |
| PhoneInput | `forms/PhoneInput.tsx` | - |
| PasswordStrength | `forms/PasswordStrength.tsx` | - |

### 🔗 Molecules (18 files)
| Component | File | Composition |
|-----------|------|-------------|
| Input Group | `ui/input-group.tsx` | Input + prepend/append buttons |
| Button Group | `ui/button-group.tsx` | Related buttons with separator |
| Form Field | `ui/form.tsx` | Label + control wrapper |
| Field | `ui/field.tsx` | Label + Separator + child control |
| AddToCartButton | `product/AddToCartButton.tsx` | Quantity selector + Add button |
| Dropdown Menu | `ui/dropdown-menu.tsx` | Radix-based menu |
| Context Menu | `ui/context-menu.tsx` | Right-click menu |
| Navigation Menu | `ui/navigation-menu.tsx` | Multi-level nav |
| Alert | `ui/alert.tsx` | Icon + title + description |
| Popover | `ui/popover.tsx` | Floating content |
| Tooltip | `ui/tooltip.tsx` | Hover helper text |
| Carousel | `ui/carousel.tsx` | Embla-based slider |
| Tabs | `ui/tabs.tsx` | Tab navigation |
| Accordion | `ui/accordion.tsx` | Collapsible sections |
| Toggle Group | `ui/toggle-group.tsx` | Multi-select buttons |

### 🏗️ Organisms (11 files)
| Component | File | Usage |
|-----------|------|-------|
| ProductGallery | `product/ProductGallery.tsx` | Image carousel + details |
| FitmentChecker | `product/FitmentChecker.tsx` | Product compatibility filter |
| CompatibilityMatrix | `product/CompatibilityMatrix.tsx` | Filtered product table |
| Product Search | `product/product-search-example.tsx` | Search + results grid |
| AddressForm | `forms/AddressForm.tsx` | Multi-field address input |
| Command Menu | `ui/command.tsx` | Searchable selector |
| Sidebar | `ui/sidebar.tsx` | Collapsible navigation (726 LOC) |
| Table | `ui/table.tsx` | Data display with sorting/filtering |
| Dialog | `ui/dialog.tsx` | Modal overlay |
| Sheet | `ui/sheet.tsx` | Side panel |
| Menubar | `ui/menubar.tsx` | Top menu bar (274 LOC) |
| Chart | `ui/chart.tsx` | Data visualization (357 LOC) |

### 📄 Templates & Pages (13 files)
Section components follow consistent pattern: IntersectionObserver → stagger animations → grid layouts

| Section | File | Pattern |
|---------|------|---------|
| Hero | `hero-section.tsx` | Full-height intro + CTA buttons |
| Categories | `categories-section.tsx` | 2x2 category grid with images |
| Products | `products-section.tsx` | 4-column product grid + filter chips |
| Checkout | `checkout-section.tsx` | Checkout flow container |
| Quote | `quote-section.tsx` | Quote request form |
| Dashboard | `dashboard-section.tsx` | Stats/inventory display |
| CTA | `cta-section.tsx` | Call-to-action section |
| Footer | `footer-section.tsx` | Footer links + social |
| Partners | `partners-section.tsx` | Partner logos |
| Quality | `quality-section.tsx` | Quality assurance info |
| Shipping | `shipping-section.tsx` | Shipping details |
| Support | `support-section.tsx` | Support info |
| Testimonials | `testimonials-section.tsx` | Customer reviews carousel |

---

## 🚨 Critical Duplications

### 1. **Button Implementation Fragmentation** [URGENT]
**Problem**: 3 competing button systems
```
├── Button.tsx (shadcn variant system)      ← 20% usage
├── btn-primary class (globals.css)         ← 60% usage  
└── btn-secondary class (globals.css)       ← 20% usage
```

**Locations**: 
- `hero-section.tsx` (lines 82-87): inline `btn-primary`/`btn-secondary`
- `products-section.tsx` (line 171): inline button class
- `cta-section.tsx`: inline `btn-primary`
- `AddToCartButton.tsx` (line 103): inline button styles

**Impact**: High - affects ~15+ components, creates maintenance burden

**Fix**: Replace all CSS classes with `<Button variant="primary" />`

---

### 2. **Form Input Fragmentation** [URGENT]
**Problem**: 3 competing input implementations
```
├── Input.tsx (shadcn primitive)           ← 30% usage
├── FormInput.tsx (custom validation UI)   ← 50% usage
├── input-dark class (globals.css)         ← 20% usage
└── PhoneInput.tsx (specialized variant)
```

**Files**:
- `ui/input.tsx` - Bare input element
- `forms/FormInput.tsx` - Adds label, error message, success/loading icons (motion-animated)
- `app/globals.css` - `.input-dark` class with hardcoded colors
- `forms/PhoneInput.tsx` - Phone-specific formatting

**Impact**: High - breaks form consistency, 8+ forms affected

**Fix**: Create single `FormField` abstraction that composes Input + Label + validation

---

### 3. **Card Pattern Inconsistency** [HIGH]
**Problem**: Cards implemented 3 different ways
```
├── Card.tsx (shadcn generic)
├── .product-card (globals.css)
├── .category-tile (globals.css)
└── .dashboard-card (globals.css)
```

**Usage**:
- `products-section.tsx` (lines 121-178): Product cards with badge overlay
- `categories-section.tsx` (lines 55-72): Category tiles with hover animation
- Checkout/dashboard sections: `dashboard-card` class

**Impact**: Medium - inconsistent styling, harder to update

**Fix**: Create `ProductCard`, `CategoryCard`, `StatCard` molecule components

---

## ⚠️ Medium Issues

### 4. **Button Variant Scattering**
- `.link-arrow` class (globals.css) vs standard Link component
- `.filter-chip` class (globals.css) for toggle buttons
- Missing `<Button variant="ghost" />` usage

### 5. **Section Animation Duplication**
13 sections with duplicate code:
- IntersectionObserver setup (same threshold logic)
- Stagger animation delays (same pattern)
- Heading + grid layout structure

**Fix**: Create reusable `<Section>` wrapper component

---

## 📋 Component Inventory

| Category | Count | Status |
|----------|-------|--------|
| UI Atoms (shadcn) | 52 | ✅ Well-structured |
| Form Components | 9 | ⚠️ Fragmented |
| Product Components | 6 | ✅ Good isolation |
| Section Templates | 13 | ⚠️ Duplicated logic |
| Layout/Utilities | 3 | ✅ Minimal |
| **Total** | **83** | |

---

## 🎯 Best Candidates for UI Kit (Priority)

### 🔴 Priority 1: Button System
- **Scope**: Replace 6+ inline button implementations
- **Effort**: 2-3 hours
- **ROI**: High - affects all interactive elements

### 🔴 Priority 2: Form Input Standardization
- **Scope**: Unify Input/FormInput/PhoneInput into single abstraction
- **Effort**: 4-5 hours
- **ROI**: High - 8+ forms affected

### 🟠 Priority 3: Card Patterns
- **Scope**: Create ProductCard, CategoryCard, StatCard molecules
- **Effort**: 3-4 hours
- **ROI**: Medium - improves maintainability

### 🟠 Priority 4: Typography Scale
- **Scope**: Formalize heading sizes (h1-h6) and text sizes
- **Effort**: 2-3 hours
- **ROI**: Medium - content consistency

### 🟡 Priority 5: Section Wrapper
- **Scope**: Extract animation + layout logic into `<Section>` component
- **Effort**: 3-4 hours
- **ROI**: Medium - DRY improvement, maintainability

---

## 🗑️ Deprecated & Unused Files

| File | Issue | Recommendation |
|------|-------|-----------------|
| `product/product-search-example.tsx` | Example file, not used in app routes | **DELETE** |

---

## 📊 Dependency Map

```
Tokens (tailwind.config.js + globals.css)
  ├── Atoms (Button, Input, Label, Badge, etc.)
  │   ├── Molecules (InputGroup, FormField, AddToCartButton, etc.)
  │   │   └── Organisms (ProductGallery, FitmentChecker, AddressForm, etc.)
  │   └── Templates (13 sections)
  └── CSS Classes (btn-primary, product-card, filter-chip) ⚠️ Should be components
```

---

## ✅ Strengths

1. **Well-organized file structure** - Clear separation of concerns
2. **shadcn/ui foundation** - Radix-based primitives, good accessibility
3. **Consistent design tokens** - Color palette, spacing, animations
4. **Micro-interactions** - Framer Motion animations throughout
5. **Responsive design** - Mobile-first approach

---

## Next Steps

1. **Week 1**: Consolidate button system (Priority 1)
2. **Week 2**: Unify form inputs (Priority 2)
3. **Week 3**: Extract card patterns (Priority 3)
4. **Week 4**: Formalize typography + section wrapper (Priority 4-5)

---

*Audit Date: 2026-03-24 | Total Components: 83 | Design Layers: 5*
