"use client";

import { useEffect, useMemo, useState } from "react";
import { FilterX, Loader2, Search } from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { PageLoadingState } from "@/components/loading-state";
import { DeviceExplorer } from "@/components/device-explorer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBrands, fetchInventory, fetchModels, type InventoryItem } from "@/lib/api";

type Brand = Awaited<ReturnType<typeof fetchBrands>>[number];
type Model = Awaited<ReturnType<typeof fetchModels>>[number];

function formatPrice(cents: number) {
  if (cents === 0) return "Contact for Price";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function getItemModelNames(item: InventoryItem) {
  return Array.from(
    new Set(
      (item.compatibilities ?? [])
        .flatMap(({ variant }) => [variant.marketingName, variant.modelNumber ?? undefined])
        .filter((value): value is string => Boolean(value?.trim()))
    )
  );
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [inventoryData, brandsData, modelsData] = await Promise.all([
        fetchInventory(),
        fetchBrands(),
        fetchModels(),
      ]);

      setInventory(inventoryData);
      setBrands(brandsData);
      setModels(modelsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredModels = useMemo(
    () => (selectedBrand ? models.filter((model) => model.brandId === selectedBrand) : models),
    [models, selectedBrand]
  );

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();
    const selectedModelOption = selectedModel
      ? models.find((model) => model.id === selectedModel) ?? null
      : null;
    const selectedBrandModels = selectedBrand
      ? models.filter((model) => model.brandId === selectedBrand)
      : [];

    return inventory.filter((item) => {
      const modelNames = getItemModelNames(item);
      const normalizedModelNames = modelNames.map((value) => value.toLowerCase());

      const matchesQuery =
        !query ||
        [item.skuId, item.partName, item.category, item.qualityGrade, ...modelNames]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));

      if (!matchesQuery) return false;

      if (selectedModelOption) {
        const target = selectedModelOption.name.toLowerCase();
        return normalizedModelNames.some(
          (value) => value === target || value.includes(target) || target.includes(value)
        );
      }

      if (selectedBrandModels.length > 0) {
        const brandTargets = selectedBrandModels.map((model) => model.name.toLowerCase());
        return normalizedModelNames.some((value) =>
          brandTargets.some((target) => value === target || value.includes(target) || target.includes(value))
        );
      }

      return true;
    });
  }, [inventory, models, search, selectedBrand, selectedModel]);

  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setSearch("");
  };

  const selectedBrandName = brands.find((brand) => brand.id === selectedBrand)?.name;
  const selectedModelName = models.find((model) => model.id === selectedModel)?.name;

  return (
    <div className="pb-20">
      <PageHero
        eyebrow="Wholesale inventory"
        title={
          <>
            Browse the <span className="text-ct-accent">live catalog</span>
          </>
        }
        description="Filter by brand and model, then scan the current stock, pricing, and quality details in a single table."
        actions={
          <>
            <Button asChild className="rounded-full">
              <a href="/catalog">Open device explorer</a>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-transparent text-ct-text">
              <a href="/quote">Build a quote</a>
            </Button>
          </>
        }
      />

      <section className="max-w-7xl mx-auto px-6 lg:px-12 mb-8">
        <DeviceExplorer />
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6">
        <Card className="bg-ct-bg-secondary/80 border-white/10 shadow-card">
          <CardContent className="p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">
              <div className="space-y-2">
                <label className="text-micro text-ct-text-secondary">Search</label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ct-text-secondary" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="SKU, part name, category, quality..."
                    className="bg-ct-bg border-white/10 pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-micro text-ct-text-secondary">Brand</label>
                <select
                  value={selectedBrand ?? ""}
                  onChange={(event) => {
                    const nextBrand = event.target.value || null;
                    setSelectedBrand(nextBrand);
                    setSelectedModel(null);
                  }}
                  className="h-11 w-full rounded-md border border-white/10 bg-ct-bg px-3 text-sm text-ct-text outline-none focus:border-ct-accent"
                >
                  <option value="">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-micro text-ct-text-secondary">Model</label>
                <select
                  value={selectedModel ?? ""}
                  onChange={(event) => setSelectedModel(event.target.value || null)}
                  className="h-11 w-full rounded-md border border-white/10 bg-ct-bg px-3 text-sm text-ct-text outline-none focus:border-ct-accent disabled:opacity-50"
                  disabled={filteredModels.length === 0}
                >
                  <option value="">All models</option>
                  {filteredModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetFilters}
                  className="h-11 rounded-full border-white/10 bg-transparent text-ct-text w-full lg:w-auto"
                >
                  <FilterX className="size-4" />
                  Reset
                </Button>
              </div>
            </div>

            {(selectedBrandName || selectedModelName || search.trim()) && (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedBrandName && <Badge className="bg-ct-accent/15 text-ct-accent">{selectedBrandName}</Badge>}
                {selectedModelName && <Badge className="bg-ct-accent/15 text-ct-accent">{selectedModelName}</Badge>}
                {search.trim() && <Badge variant="outline" className="border-white/10 text-ct-text-secondary">Search: {search.trim()}</Badge>}
              </div>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <PageLoadingState />
        ) : error ? (
          <ErrorState
            title="Inventory unavailable"
            message={error}
            onRetry={loadData}
            secondaryAction={
              <Button asChild variant="outline" className="rounded-full border-white/10 bg-transparent text-ct-text">
                <a href="/support">Contact support</a>
              </Button>
            }
          />
        ) : filteredInventory.length === 0 ? (
          <EmptyState
            title="No matching parts"
            description={
              search || selectedBrand || selectedModel
                ? "Try clearing the filters or broadening the search."
                : "There are no inventory items to show yet."
            }
            icon={<Loader2 className="size-5 text-ct-accent" />}
            actions={
              <div className="flex flex-wrap justify-center gap-3">
                <Button onClick={resetFilters} className="rounded-full">
                  Clear filters
                </Button>
                <Button asChild variant="outline" className="rounded-full border-white/10 bg-transparent text-ct-text">
                  <a href="/catalog">Browse catalog</a>
                </Button>
              </div>
            }
          />
        ) : (
          <Card className="bg-ct-bg-secondary/80 border-white/10 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-4 py-4 font-semibold text-ct-text">SKU</th>
                    <th className="px-4 py-4 font-semibold text-ct-text">Part</th>
                    <th className="px-4 py-4 font-semibold text-ct-text">Category</th>
                    <th className="px-4 py-4 font-semibold text-ct-text">Compatible devices</th>
                    <th className="px-4 py-4 text-right font-semibold text-ct-text">Price</th>
                    <th className="px-4 py-4 text-right font-semibold text-ct-text">Stock</th>
                    <th className="px-4 py-4 font-semibold text-ct-text">Quality</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const modelNames = getItemModelNames(item);

                    return (
                      <tr key={item.skuId} className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
                        <td className="px-4 py-4 font-mono text-ct-accent">{item.skuId}</td>
                        <td className="px-4 py-4 text-ct-text">{item.partName || "N/A"}</td>
                        <td className="px-4 py-4 text-ct-text-secondary">{item.category}</td>
                        <td className="px-4 py-4 text-ct-text-secondary">
                          {modelNames.length > 0 ? modelNames.join(", ") : "Cross-Compatible"}
                        </td>
                        <td className="px-4 py-4 text-right font-semibold text-ct-accent">
                          {formatPrice(item.wholesalePrice)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Badge
                            variant="outline"
                            className={`border-white/10 ${
                              item.stockLevel > 10
                                ? "text-green-400"
                                : item.stockLevel > 0
                                  ? "text-amber-400"
                                  : "text-red-400"
                            }`}
                          >
                            {item.stockLevel} units
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-ct-text-secondary">{item.qualityGrade || "Standard"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-white/10 px-4 py-4 text-sm text-ct-text-secondary">
              Showing <span className="font-semibold text-ct-accent">{filteredInventory.length}</span> parts
              {selectedBrandName && ` from ${selectedBrandName}`}
              {selectedModelName && ` for ${selectedModelName}`}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
