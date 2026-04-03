'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Check, ChevronRight, Loader2, Search, AlertCircle, RefreshCw, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/lib/utils';
import {
  fetchHierarchy,
  fetchPartsForVariant,
  type HierarchyBrand,
  type HierarchyModelType,
  type HierarchyGeneration,
  type HierarchyVariant,
  type InventoryItem,
} from '@/lib/api';

// Re-export backend types under local aliases for clarity
type Brand = HierarchyBrand;
type ModelType = HierarchyModelType;
type Generation = HierarchyGeneration;
type Variant = HierarchyVariant;


type NavigationLevel = 'brand' | 'modelType' | 'generation' | 'variant';

interface NavigationState {
  level: NavigationLevel;
  brandId?: string;
  modelTypeId?: string;
  generationId?: string;
  variantId?: string;
}

/**
 * DeviceExplorer Component
 * 2-panel hierarchical navigation for device discovery
 * Connected to the CellTech backend via /api/hierarchy and /api/variants/:id/parts
 */
export function DeviceExplorer() {
  const [navigationState, setNavigationState] = useState<NavigationState>({
    level: 'brand',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Backend data state
  const [hierarchy, setHierarchy] = useState<Brand[]>([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  const [hierarchyError, setHierarchyError] = useState<string | null>(null);

  // Parts for selected variant
  const [variantParts, setVariantParts] = useState<InventoryItem[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);
  const [recentlyAddedSku, setRecentlyAddedSku] = useState<string | null>(null);
  const { addItem } = useCart();

  // Fetch hierarchy on mount
  useEffect(() => {
    let cancelled = false;
    setHierarchyLoading(true);
    setHierarchyError(null);

    fetchHierarchy().then((data) => {
      if (!cancelled) {
        if (data.length === 0) {
          setHierarchyError('No device data available. Please check your connection.');
        } else {
          setHierarchy(data);
        }
        setHierarchyLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, []);

  // Fetch parts when a variant is selected
  useEffect(() => {
    if (navigationState.level !== 'variant' || !navigationState.variantId) {
      setVariantParts([]);
      return;
    }

    let cancelled = false;
    setPartsLoading(true);

    fetchPartsForVariant(navigationState.variantId).then((parts) => {
      if (!cancelled) {
        setVariantParts(parts);
        setPartsLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [navigationState.variantId, navigationState.level]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get current brand data
  const currentBrand = useMemo(() => {
    if (navigationState.brandId) {
      return hierarchy.find((b) => b.id === navigationState.brandId);
    }
    return undefined;
  }, [hierarchy, navigationState.brandId]);

  // Get current model type data
  const currentModelType = useMemo(() => {
    if (currentBrand && navigationState.modelTypeId) {
      return currentBrand.models.find((mt) => mt.id === navigationState.modelTypeId);
    }
    return undefined;
  }, [currentBrand, navigationState.modelTypeId]);

  // Get current generation data
  const currentGeneration = useMemo(() => {
    if (currentModelType && navigationState.generationId) {
      return currentModelType.generations.find((g) => g.id === navigationState.generationId);
    }
    return undefined;
  }, [currentModelType, navigationState.generationId]);

  // Get current variant data
  const currentVariant = useMemo(() => {
    if (currentGeneration && navigationState.variantId) {
      return currentGeneration.variants.find((v) => v.id === navigationState.variantId);
    }
    return undefined;
  }, [currentGeneration, navigationState.variantId]);

  // Search across all levels
  const searchResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return null;

    const query = debouncedQuery.toLowerCase();
    const results: Array<{
      type: NavigationLevel;
      brand?: Brand;
      modelType?: ModelType;
      generation?: Generation;
      variant?: Variant;
    }> = [];

    hierarchy.forEach((brand) => {
      if (brand.name.toLowerCase().includes(query)) {
        results.push({ type: 'brand', brand });
      }

      brand.models.forEach((modelType) => {
        if (modelType.name.toLowerCase().includes(query)) {
          results.push({ type: 'modelType', brand, modelType });
        }

        modelType.generations.forEach((generation) => {
          if (generation.name.toLowerCase().includes(query)) {
            results.push({ type: 'generation', brand, modelType, generation });
          }

          generation.variants.forEach((variant) => {
            if (
              (variant.modelNumber ?? '').toLowerCase().includes(query) ||
              variant.marketingName.toLowerCase().includes(query)
            ) {
              results.push({ type: 'variant', brand, modelType, generation, variant });
            }
          });
        });
      });
    });

    return results;
  }, [debouncedQuery, hierarchy]);

  const handleSelectBrand = useCallback((brand: Brand) => {
    setNavigationState({ level: 'modelType', brandId: brand.id });
    setSearchQuery('');
  }, []);

  const handleSelectModelType = useCallback((modelType: ModelType) => {
    setNavigationState((prev) => ({
      level: 'generation',
      brandId: prev.brandId,
      modelTypeId: modelType.id,
    }));
    setSearchQuery('');
  }, []);

  const handleSelectGeneration = useCallback((generation: Generation) => {
    setNavigationState((prev) => ({
      level: 'variant',
      brandId: prev.brandId,
      modelTypeId: prev.modelTypeId,
      generationId: generation.id,
    }));
    setSearchQuery('');
  }, []);

  const handleSelectVariant = useCallback((variant: Variant) => {
    setNavigationState((prev) => ({
      level: 'variant',
      brandId: prev.brandId,
      modelTypeId: prev.modelTypeId,
      generationId: prev.generationId,
      variantId: variant.id,
    }));
    setSearchQuery('');
  }, []);

  const handleNavigateBack = useCallback(() => {
    setNavigationState((prev) => {
      if (prev.level === 'variant') {
        return {
          level: 'generation',
          brandId: prev.brandId,
          modelTypeId: prev.modelTypeId,
          generationId: prev.generationId,
        };
      }
      if (prev.level === 'generation') {
        return {
          level: 'modelType',
          brandId: prev.brandId,
          modelTypeId: prev.modelTypeId,
        };
      }
      if (prev.level === 'modelType') {
        return {
          level: 'brand',
          brandId: prev.brandId,
        };
      }
      return { level: 'brand' };
    });
    setSearchQuery('');
  }, []);

  const handleAddToCart = useCallback((part: InventoryItem) => {
    addItem({
      skuId: part.skuId,
      name: part.partName,
      price: part.wholesalePrice,
      quantity: 5,
      moq: 5,
      image: '/images/product_placeholder.jpg',
    });
    setRecentlyAddedSku(part.skuId);
    window.setTimeout(() => {
      setRecentlyAddedSku((current) => (current === part.skuId ? null : current));
    }, 1500);
  }, [addItem]);

  // Loading skeleton
  if (hierarchyLoading) {
    return (
      <div className="w-full h-full bg-ct-bg text-ct-text flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4 text-ct-text-secondary">
          <Loader2 className="size-8 animate-spin text-ct-accent" />
          <p className="text-sm">Loading device catalog&hellip;</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hierarchyError) {
    return (
      <div className="w-full h-full bg-ct-bg text-ct-text flex items-center justify-center min-h-96">
        <div className="flex flex-col items-center gap-4 text-ct-text-secondary">
          <AlertCircle className="size-8 text-red-400" />
          <p className="text-sm text-red-400">{hierarchyError}</p>
          <Button
            variant="outline"
            className="border-ct-text/10 text-ct-text hover:border-ct-accent"
            onClick={() => {
              setHierarchyLoading(true);
              setHierarchyError(null);
              fetchHierarchy().then((data) => {
                if (data.length === 0) {
                  setHierarchyError('No device data available. Please check your connection.');
                } else {
                  setHierarchy(data);
                }
                setHierarchyLoading(false);
              });
            }}
          >
            <RefreshCw className="size-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-ct-bg text-ct-text">
      {/* Search Bar */}
      <div className="sticky top-0 z-10 border-b border-ct-text/10 bg-ct-bg/95 backdrop-blur-sm p-4">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ct-text-secondary" />
            <Input
              type="text"
              placeholder="Search brands, models, generations, variants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-ct-bg-secondary border-ct-text/10 text-ct-text placeholder:text-ct-text-secondary focus-visible:border-ct-accent focus-visible:ring-ct-accent/20"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Breadcrumb Trail */}
        <div className="mb-6">
          <Breadcrumb>
            <BreadcrumbList>
              {navigationState.brandId && (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink
                      onClick={() => handleNavigateBack()}
                      className="cursor-pointer text-ct-text-secondary hover:text-ct-accent transition-colors"
                    >
                      {currentBrand?.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  {navigationState.modelTypeId && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={
                            navigationState.level === 'modelType'
                              ? undefined
                              : () => handleNavigateBack()
                          }
                          className={cn(
                            'transition-colors',
                            navigationState.level === 'modelType'
                              ? 'text-ct-accent cursor-default'
                              : 'text-ct-text-secondary hover:text-ct-accent cursor-pointer'
                          )}
                        >
                          {currentModelType?.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  {navigationState.generationId && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink
                          onClick={
                            navigationState.level === 'generation'
                              ? undefined
                              : () => handleNavigateBack()
                          }
                          className={cn(
                            'transition-colors',
                            navigationState.level === 'generation'
                              ? 'text-ct-accent cursor-default'
                              : 'text-ct-text-secondary hover:text-ct-accent cursor-pointer'
                          )}
                        >
                          {currentGeneration?.name}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </>
                  )}
                  {navigationState.variantId && (
                    <>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="text-ct-accent">
                          {currentVariant?.marketingName}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </>
                  )}
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Search Results View */}
        {searchResults && searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {searchResults.slice(0, 8).map((result, idx) => (
              <Card
                key={`${result.type}-${idx}`}
                className="bg-ct-bg-secondary border-ct-text/10 cursor-pointer hover:border-ct-accent/50 transition-colors"
                onClick={() => {
                  if (result.brand) handleSelectBrand(result.brand);
                  if (result.modelType) handleSelectModelType(result.modelType);
                  if (result.generation) handleSelectGeneration(result.generation);
                  if (result.variant) handleSelectVariant(result.variant);
                }}
              >
                <CardHeader>
                  <CardTitle className="text-ct-accent text-sm uppercase tracking-wider">
                    {result.type === 'brand' && 'Brand'}
                    {result.type === 'modelType' && 'Model Type'}
                    {result.type === 'generation' && 'Generation'}
                    {result.type === 'variant' && 'Variant'}
                  </CardTitle>
                  <CardDescription>
                    {result.brand?.name}
                    {result.modelType && ` › ${result.modelType.name}`}
                    {result.generation && ` › ${result.generation.name}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-ct-text font-semibold">
                    {result.variant?.marketingName ||
                      result.generation?.name ||
                      result.modelType?.name ||
                      result.brand?.name}
                  </p>
                  {result.variant && (
                    <p className="text-ct-text-secondary text-sm mt-2">
                      Model: {result.variant.modelNumber}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Main 2-Panel Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-ct-text">
              {navigationState.level === 'brand' && 'Select Brand'}
              {navigationState.level === 'modelType' && 'Select Model Type'}
              {navigationState.level === 'generation' && 'Select Generation'}
              {navigationState.level === 'variant' && 'Select Variant'}
            </h2>

            <div className="space-y-2 overflow-y-auto max-h-96 md:max-h-full">
              {navigationState.level === 'brand' &&
                hierarchy.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => handleSelectBrand(brand)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-ct-bg-secondary border border-ct-text/10 hover:border-ct-accent hover:bg-ct-bg-secondary/80 text-ct-text transition-all group flex items-center justify-between"
                  >
                    <span>{brand.name}</span>
                    <ChevronRight className="size-4 text-ct-text-secondary group-hover:text-ct-accent transition-colors" />
                  </button>
                ))}

              {navigationState.level === 'modelType' &&
                currentBrand?.models.map((modelType) => (
                  <button
                    key={modelType.id}
                    onClick={() => handleSelectModelType(modelType)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-ct-bg-secondary border border-ct-text/10 hover:border-ct-accent hover:bg-ct-bg-secondary/80 text-ct-text transition-all group flex items-center justify-between"
                  >
                    <span>{modelType.name}</span>
                    <ChevronRight className="size-4 text-ct-text-secondary group-hover:text-ct-accent transition-colors" />
                  </button>
                ))}

              {navigationState.level === 'generation' &&
                currentModelType?.generations.map((generation) => (
                  <button
                    key={generation.id}
                    onClick={() => handleSelectGeneration(generation)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-ct-bg-secondary border border-ct-text/10 hover:border-ct-accent hover:bg-ct-bg-secondary/80 text-ct-text transition-all group flex flex-col"
                  >
                    <span className="font-medium">{generation.name}</span>
                    <span className="text-sm text-ct-text-secondary">
                      {generation.releaseYear} • {generation.variants.length} variant
                      {generation.variants.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                ))}

              {navigationState.level === 'variant' &&
                currentGeneration?.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => handleSelectVariant(variant)}
                    className="w-full text-left px-4 py-3 rounded-lg bg-ct-bg-secondary border border-ct-text/10 hover:border-ct-accent hover:bg-ct-bg-secondary/80 text-ct-text transition-all group flex flex-col"
                  >
                    <span className="font-medium">{variant.marketingName}</span>
                    <span className="text-sm text-ct-text-secondary">
                      {variant.modelNumber}
                    </span>
                  </button>
                ))}
            </div>

            {navigationState.level !== 'brand' && (
              <Button
                onClick={handleNavigateBack}
                variant="outline"
                className="w-full border-ct-text/10 text-ct-text hover:border-ct-accent hover:bg-ct-bg-secondary"
              >
                ← Back
              </Button>
            )}
          </div>

          {/* Right Panel - Details */}
          <div className="flex flex-col gap-4">
            {navigationState.level === 'brand' && !navigationState.brandId && (
              <Card className="bg-ct-bg-secondary border-ct-text/10 flex items-center justify-center min-h-96">
                <CardContent className="text-center text-ct-text-secondary">
                  Select a brand to view details
                </CardContent>
              </Card>
            )}

            {navigationState.level === 'modelType' && currentBrand && (
              <Card className="bg-ct-bg-secondary border-ct-text/10">
                <CardHeader>
                  <CardTitle className="text-ct-accent">{currentBrand.name}</CardTitle>
                  <CardDescription>
                    {currentBrand.models.length} model type
                    {currentBrand.models.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {currentBrand.models.map((mt) => (
                      <div
                        key={mt.id}
                        className="p-3 rounded-lg bg-ct-bg/50 border border-ct-text/10 text-sm text-ct-text-secondary"
                      >
                        <p className="font-medium text-ct-text">{mt.name}</p>
                        <p className="text-xs text-ct-text-secondary/75">
                          {mt.generations.length} generation
                          {mt.generations.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {navigationState.level === 'generation' && currentModelType && (
              <Card className="bg-ct-bg-secondary border-ct-text/10">
                <CardHeader>
                  <CardTitle className="text-ct-accent">{currentModelType.name}</CardTitle>
                  <CardDescription>
                    {currentModelType.generations.length} generation
                    {currentModelType.generations.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {currentModelType.generations.map((gen) => (
                    <div key={gen.id} className="p-3 rounded-lg bg-ct-bg/50 border border-ct-text/10">
                      <p className="font-medium text-ct-text">{gen.name}</p>
                      <p className="text-sm text-ct-text-secondary">{gen.releaseYear}</p>
                      <p className="text-xs text-ct-text-secondary/75 mt-2">
                        {gen.variants.length} variant
                        {gen.variants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {navigationState.level === 'variant' && currentVariant && (
              <div className="space-y-4">
                {/* Variant Details Card */}
                <Card className="bg-ct-bg-secondary border-ct-text/10">
                  <CardHeader>
                    <CardTitle className="text-ct-accent">{currentVariant.marketingName}</CardTitle>
                    <CardDescription>
                      Model {currentVariant.modelNumber}
                      {currentGeneration?.releaseYear ? ` · ${currentGeneration.releaseYear}` : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-ct-bg/50 border border-ct-text/10">
                        <p className="text-xs text-ct-text-secondary/75 uppercase tracking-wider">Model #</p>
                        <p className="text-sm font-semibold text-ct-text mt-1">{currentVariant.modelNumber}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-ct-bg/50 border border-ct-text/10">
                        <p className="text-xs text-ct-text-secondary/75 uppercase tracking-wider">Release Year</p>
                        <p className="text-sm font-semibold text-ct-text mt-1">
                          {currentGeneration?.releaseYear ?? '—'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compatible Parts Card — live from backend */}
                <Card className="bg-ct-bg-secondary border-ct-text/10">
                  <CardHeader>
                    <CardTitle className="text-ct-text text-sm flex items-center justify-between">
                      <span>Compatible Parts</span>
                      {!partsLoading && variantParts.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {variantParts.length} part{variantParts.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>Parts available for this device</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {partsLoading ? (
                      <div className="flex items-center gap-3 py-4 text-ct-text-secondary">
                        <Loader2 className="size-4 animate-spin" />
                        <span className="text-sm">Loading parts…</span>
                      </div>
                    ) : variantParts.length === 0 ? (
                      <p className="text-sm text-ct-text-secondary py-2">No parts listed for this device yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {variantParts.map((part) => (
                          <div
                            key={part.skuId}
                            className="flex items-center justify-between p-3 rounded-lg bg-ct-bg/50 border border-ct-text/10 hover:border-ct-accent/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-ct-text truncate">{part.partName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs border-ct-text/20 text-ct-text-secondary">
                                  {part.category}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-xs border-ct-text/20',
                                    part.qualityGrade === 'OEM'
                                      ? 'text-ct-accent border-ct-accent/30'
                                      : 'text-ct-text-secondary'
                                  )}
                                >
                                  {part.qualityGrade}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right ml-3 shrink-0">
                              {part.wholesalePrice > 0 ? (
                                <p className="text-sm font-semibold text-ct-accent">
                                  ${(part.wholesalePrice / 100).toFixed(2)}
                                </p>
                              ) : (
                                <p className="text-xs text-ct-text-secondary">Quote</p>
                              )}
                              <p
                                className={cn(
                                  'text-xs mt-0.5',
                                  part.stockLevel > 0 ? 'text-green-400' : 'text-red-400'
                                )}
                              >
                                {part.stockLevel > 0 ? `${part.stockLevel} in stock` : 'Out of stock'}
                              </p>
                              <Button
                                type="button"
                                size="sm"
                                variant={recentlyAddedSku === part.skuId ? 'secondary' : 'default'}
                                className="mt-3 min-w-[132px] gap-2"
                                disabled={part.stockLevel <= 0 || part.wholesalePrice <= 0}
                                onClick={() => handleAddToCart(part)}
                              >
                                {recentlyAddedSku === part.skuId ? (
                                  <>
                                    <Check className="size-4" />
                                    Added
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="size-4" />
                                    Add 5 to Cart
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
