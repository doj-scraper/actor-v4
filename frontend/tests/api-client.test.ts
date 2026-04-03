import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    statusText: ok ? "OK" : "Error",
    json: async () => body,
  } as Response;
}

describe("frontend api client", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("parses named backend payload keys for catalog and inventory endpoints", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url === "http://localhost:3001/api/hierarchy") {
        return Promise.resolve(jsonResponse({ success: true, hierarchy: [{ id: "b1", name: "Apple", models: [] }] }));
      }
      if (url === "http://localhost:3001/api/brands") {
        return Promise.resolve(jsonResponse({ success: true, brands: [{ id: "b1", name: "Apple" }] }));
      }
      if (url === "http://localhost:3001/api/models?brandId=b1") {
        return Promise.resolve(jsonResponse({ success: true, models: [{ id: "m1", name: "iPhone", brandId: "b1" }] }));
      }
      if (url === "http://localhost:3001/api/inventory") {
        return Promise.resolve(jsonResponse({ success: true, inventory: [{ skuId: "SKU-1", partName: "Battery", category: "Battery", categoryId: "c1", wholesalePrice: 999, stockLevel: 12, qualityGrade: "OEM" }] }));
      }
      if (url === "http://localhost:3001/api/inventory/model/m1") {
        return Promise.resolve(jsonResponse({ success: true, parts: [{ skuId: "SKU-2", partName: "Screen", category: "Display", categoryId: "c2", wholesalePrice: 1999, stockLevel: 4, qualityGrade: "Premium" }] }));
      }
      if (url === "http://localhost:3001/api/inventory/SKU-2") {
        return Promise.resolve(jsonResponse({ success: true, part: { skuId: "SKU-2", partName: "Screen", category: "Display", wholesalePrice: 1999, stockLevel: 4, qualityGrade: "Premium", specifications: [], compatibilities: [] } }));
      }
      if (url === "http://localhost:3001/api/parts?device=iPhone") {
        return Promise.resolve(jsonResponse({ success: true, parts: [{ skuId: "SKU-3", partName: "Charging Port", category: "Charging", categoryId: "c3", wholesalePrice: 1499, stockLevel: 6, qualityGrade: "OEM" }] }));
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const {
      fetchHierarchy,
      fetchBrands,
      fetchModels,
      fetchInventory,
      fetchInventoryByModel,
      getPartDetails,
      searchParts,
    } = await import("@/lib/api");

    await expect(fetchHierarchy()).resolves.toEqual([{ id: "b1", name: "Apple", models: [] }]);
    await expect(fetchBrands()).resolves.toEqual([{ id: "b1", name: "Apple" }]);
    await expect(fetchModels("b1")).resolves.toEqual([{ id: "m1", name: "iPhone", brandId: "b1" }]);
    await expect(fetchInventory()).resolves.toHaveLength(1);
    await expect(fetchInventoryByModel("m1")).resolves.toHaveLength(1);
    await expect(getPartDetails("SKU-2")).resolves.toEqual({
      part: {
        skuId: "SKU-2",
        partName: "Screen",
        category: "Display",
        wholesalePrice: 1999,
        stockLevel: 4,
        qualityGrade: "Premium",
        specifications: [],
        compatibilities: [],
      },
    });
    await expect(searchParts("iPhone")).resolves.toHaveLength(1);
  });

  it("maps detailed health payloads using backend green/yellow/red statuses", async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url === "http://localhost:3001/api/health/detailed") {
        return Promise.resolve(
          jsonResponse({
            success: true,
            status: "red",
            timestamp: "2026-04-03T00:00:00.000Z",
            uptime: 123,
            services: [
              { name: "PostgreSQL", status: "green", latencyMs: 25, message: "Connected" },
              { name: "Stripe", status: "red", latencyMs: 0, message: "Connection failed" },
            ],
          })
        );
      }
      if (url === "http://localhost:3001/api/health") {
        return Promise.resolve(
          jsonResponse({
            success: true,
            status: "degraded",
            ready: true,
            timestamp: "2026-04-03T00:00:00.000Z",
            checks: {
              database: { status: "healthy", latencyMs: 18 },
              redis: { status: "unavailable", latencyMs: null, error: "REDIS_URL is not configured" },
            },
          })
        );
      }
      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal("fetch", fetchMock);

    const { fetchBackendHealth, fetchSystemHealth } = await import("@/lib/api");
    const result = await fetchSystemHealth();
    const publicHealth = await fetchBackendHealth();

    expect(result).not.toBeNull();
    expect(result?.status).toBe("red");
    expect(result?.services).toEqual([
      { name: "PostgreSQL", status: "green", latencyMs: 25, message: "Connected" },
      { name: "Stripe", status: "red", latencyMs: 0, message: "Connection failed" },
    ]);
    expect(publicHealth).toEqual({
      success: true,
      status: "degraded",
      ready: true,
      timestamp: "2026-04-03T00:00:00.000Z",
      checks: {
        database: { status: "healthy", latencyMs: 18 },
        redis: { status: "unavailable", latencyMs: null, error: "REDIS_URL is not configured" },
      },
    });
  });
});
