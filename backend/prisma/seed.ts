import { PrismaClient, QualityGrade } from "@prisma/client";

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Seed data types
// ---------------------------------------------------------------------------

type VariantSeed = {
  marketingName: string;
  modelNumber?: string;
};

type HierarchySeed = {
  brand: string;
  models: {
    name: string;
    generations: {
      name: string;
      releaseYear?: number;
      variants: VariantSeed[];
    }[];
  }[];
};

type InventorySeed = {
  skuId: string;          // Smart SKU format: [Bucket]-[Subcategory]-[Grade]-[Device]
  partName: string;       // Strictly required
  category: string;
  brand: string;
  model: string;
  generation: string;
  variantMarketingName: string;
  wholesalePrice: number; // Cents. 0 = "Contact for Price"
  stockLevel: number;
  qualityGrade: QualityGrade;
  specifications?: Record<string, string>;
  // Additional variants this SKU is compatible with (cross-compatibility)
  compatibleVariants?: Array<{
    brand: string;
    model: string;
    generation: string;
    variantMarketingName: string;
  }>;
};

// ---------------------------------------------------------------------------
// Hierarchy seed data — 4-level tree: Brand → ModelType → Generation → Variant
// ---------------------------------------------------------------------------

const hierarchySeed: HierarchySeed[] = [
  {
    brand: "Apple",
    models: [
      {
        name: "iPhone",
        generations: [
          {
            name: "iPhone 13",
            releaseYear: 2021,
            variants: [
              { marketingName: "iPhone 13", modelNumber: "A2482" },
              { marketingName: "iPhone 13 Mini", modelNumber: "A2481" },
              { marketingName: "iPhone 13 Pro", modelNumber: "A2483" },
              { marketingName: "iPhone 13 Pro Max", modelNumber: "A2484" },
            ],
          },
          {
            name: "iPhone 14",
            releaseYear: 2022,
            variants: [
              { marketingName: "iPhone 14", modelNumber: "A2649" },
              { marketingName: "iPhone 14 Plus", modelNumber: "A2632" },
              { marketingName: "iPhone 14 Pro", modelNumber: "A2650" },
              { marketingName: "iPhone 14 Pro Max", modelNumber: "A2651" },
            ],
          },
          {
            name: "iPhone 15",
            releaseYear: 2023,
            variants: [
              { marketingName: "iPhone 15", modelNumber: "A3089" },
              { marketingName: "iPhone 15 Plus", modelNumber: "A3090" },
              { marketingName: "iPhone 15 Pro", modelNumber: "A3101" },
              { marketingName: "iPhone 15 Pro Max", modelNumber: "A3105" },
            ],
          },
          {
            name: "iPhone 16",
            releaseYear: 2024,
            variants: [
              { marketingName: "iPhone 16", modelNumber: "A3287" },
              { marketingName: "iPhone 16 Plus", modelNumber: "A3288" },
              { marketingName: "iPhone 16 Pro", modelNumber: "A3291" },
              { marketingName: "iPhone 16 Pro Max", modelNumber: "A3293" },
            ],
          },
          {
            name: "iPhone 17",
            releaseYear: 2025,
            variants: [
              { marketingName: "iPhone 17" },
              { marketingName: "iPhone 17 Pro" },
              { marketingName: "iPhone 17 Pro Max" },
            ],
          },
        ],
      },
    ],
  },
  {
    brand: "Samsung",
    models: [
      {
        name: "Galaxy S",
        generations: [
          {
            name: "Galaxy S21",
            releaseYear: 2021,
            variants: [
              { marketingName: "Galaxy S21", modelNumber: "SM-G991B" },
              { marketingName: "Galaxy S21+", modelNumber: "SM-G996B" },
              { marketingName: "Galaxy S21 Ultra", modelNumber: "SM-G998B" },
            ],
          },
          {
            name: "Galaxy S22",
            releaseYear: 2022,
            variants: [
              { marketingName: "Galaxy S22", modelNumber: "SM-S901B" },
              { marketingName: "Galaxy S22+", modelNumber: "SM-S906B" },
              { marketingName: "Galaxy S22 Ultra", modelNumber: "SM-S908B" },
            ],
          },
          {
            name: "Galaxy S24",
            releaseYear: 2024,
            variants: [
              { marketingName: "Galaxy S24", modelNumber: "SM-S921B" },
              { marketingName: "Galaxy S24+", modelNumber: "SM-S926B" },
              { marketingName: "Galaxy S24 Ultra", modelNumber: "SM-S928B" },
            ],
          },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Inventory seed data — Smart SKU format: [Bucket]-[Subcategory]-[Grade]-[Device]
// Prices in cents. wholesalePrice = 0 means "Contact for Price".
// ---------------------------------------------------------------------------

const inventorySeed: InventorySeed[] = [
  // Batteries — Bucket 3, Subcategory B (Battery), Grade O (OEM)
  {
    skuId: "3-B-O-IP13",
    partName: "iPhone 13 OEM Battery",
    category: "Batteries",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 13",
    variantMarketingName: "iPhone 13",
    wholesalePrice: 2999, // $29.99
    stockLevel: 150,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Capacity: "3227 mAh",
      Voltage: "3.85V",
      Type: "Li-Ion",
    },
  },
  {
    skuId: "3-B-P-IP13",
    partName: "iPhone 13 Premium Battery",
    category: "Batteries",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 13",
    variantMarketingName: "iPhone 13",
    wholesalePrice: 1999, // $19.99
    stockLevel: 80,
    qualityGrade: QualityGrade.Premium,
    specifications: {
      Capacity: "3227 mAh",
      Voltage: "3.85V",
      Type: "Li-Ion",
    },
  },
  {
    skuId: "3-B-O-IP14",
    partName: "iPhone 14 OEM Battery",
    category: "Batteries",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 14",
    variantMarketingName: "iPhone 14",
    wholesalePrice: 3499, // $34.99
    stockLevel: 120,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Capacity: "3279 mAh",
      Voltage: "3.87V",
      Type: "Li-Ion",
    },
  },
  // Screens — Bucket 1, Subcategory S (Screen), Grade O (OEM)
  {
    skuId: "1-S-O-IP14P",
    partName: "iPhone 14 Pro OLED Display Assembly",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 14",
    variantMarketingName: "iPhone 14 Pro",
    wholesalePrice: 18999, // $189.99
    stockLevel: 40,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Resolution: "2556x1179",
      Type: "OLED",
      Brightness: "2000 nits",
      Size: "6.12 inch",
    },
    // Cross-compatible with iPhone 14 Pro Max (same display tech, different size handled by SKU)
  },
  {
    skuId: "1-S-O-IP15",
    partName: "iPhone 15 OLED Display Assembly",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 15",
    variantMarketingName: "iPhone 15",
    wholesalePrice: 15999, // $159.99
    stockLevel: 35,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Resolution: "2556x1179",
      Type: "OLED",
      Brightness: "2000 nits",
      Size: "6.12 inch",
    },
  },
  // Samsung Batteries
  {
    skuId: "3-B-O-SGS22",
    partName: "Galaxy S22 OEM Battery",
    category: "Batteries",
    brand: "Samsung",
    model: "Galaxy S",
    generation: "Galaxy S22",
    variantMarketingName: "Galaxy S22",
    wholesalePrice: 2499, // $24.99
    stockLevel: 90,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Capacity: "3700 mAh",
      Voltage: "3.86V",
      Type: "Li-Ion",
    },
  },
  {
    skuId: "3-B-A-SGS21",
    partName: "Galaxy S21 Aftermarket Battery",
    category: "Batteries",
    brand: "Samsung",
    model: "Galaxy S",
    generation: "Galaxy S21",
    variantMarketingName: "Galaxy S21",
    wholesalePrice: 1499, // $14.99
    stockLevel: 200,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: {
      Capacity: "4000 mAh",
      Voltage: "3.86V",
      Type: "Li-Ion",
    },
  },
  // Samsung Screens
  {
    skuId: "1-S-O-SGS24U",
    partName: "Galaxy S24 Ultra AMOLED Display Assembly",
    category: "Screens",
    brand: "Samsung",
    model: "Galaxy S",
    generation: "Galaxy S24",
    variantMarketingName: "Galaxy S24 Ultra",
    wholesalePrice: 0, // Contact for Price
    stockLevel: 10,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Resolution: "3088x1440",
      Type: "AMOLED",
      Brightness: "2600 nits",
      Size: "6.8 inch",
    },
  },
  // -------------------------------------------------------------------------
  // INCELL LCD Screens — Bucket 1, Subcategory S, Grade A (Aftermarket)
  // Part: SCREEN INCELL IC REMOVABLE FHD BLACK+
  // Stock: 25 units each
  // -------------------------------------------------------------------------
  {
    skuId: "1-S-A-IP17PM",
    partName: "iPhone 17 Pro Max Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 17",
    variantMarketingName: "iPhone 17 Pro Max",
    wholesalePrice: 6565, // $65.65
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.9 inch" },
  },
  {
    skuId: "1-S-A-IP17PR",
    partName: "iPhone 17 Pro Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 17",
    variantMarketingName: "iPhone 17 Pro",
    wholesalePrice: 6565, // $65.65
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.3 inch" },
  },
  {
    skuId: "1-S-A-IP17",
    partName: "iPhone 17 Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 17",
    variantMarketingName: "iPhone 17",
    wholesalePrice: 6316, // $63.16
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.1 inch" },
  },
  {
    skuId: "1-S-A-IP16PM",
    partName: "iPhone 16 Pro Max Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 16",
    variantMarketingName: "iPhone 16 Pro Max",
    wholesalePrice: 4382, // $43.82
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.9 inch" },
  },
  {
    skuId: "1-S-A-IP16PR",
    partName: "iPhone 16 Pro Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 16",
    variantMarketingName: "iPhone 16 Pro",
    wholesalePrice: 4382, // $43.82
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.3 inch" },
  },
  {
    skuId: "1-S-A-IP16P",
    partName: "iPhone 16 Plus Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 16",
    variantMarketingName: "iPhone 16 Plus",
    wholesalePrice: 4070, // $40.70
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.7 inch" },
  },
  {
    skuId: "1-S-A-IP16",
    partName: "iPhone 16 Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 16",
    variantMarketingName: "iPhone 16",
    wholesalePrice: 3120, // $31.20
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.1 inch" },
  },
  {
    skuId: "1-S-A-IP15PM",
    partName: "iPhone 15 Pro Max Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 15",
    variantMarketingName: "iPhone 15 Pro Max",
    wholesalePrice: 4124, // $41.24
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.7 inch" },
  },
  {
    skuId: "1-S-A-IP15PR",
    partName: "iPhone 15 Pro Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 15",
    variantMarketingName: "iPhone 15 Pro",
    wholesalePrice: 2715, // $27.15
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.1 inch" },
  },
  {
    skuId: "1-S-A-IP15P",
    partName: "iPhone 15 Plus Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 15",
    variantMarketingName: "iPhone 15 Plus",
    wholesalePrice: 2759, // $27.59
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.7 inch" },
  },
  {
    skuId: "1-S-A-IP15",
    partName: "iPhone 15 Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 15",
    variantMarketingName: "iPhone 15",
    wholesalePrice: 2391, // $23.91
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.1 inch" },
  },
  {
    skuId: "1-S-A-IP14PM",
    partName: "iPhone 14 Pro Max Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 14",
    variantMarketingName: "iPhone 14 Pro Max",
    wholesalePrice: 3956, // $39.56
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.7 inch" },
  },
  {
    skuId: "1-S-A-IP14PR",
    partName: "iPhone 14 Pro Screen InCell IC Removable FHD Black+",
    category: "Screens",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 14",
    variantMarketingName: "iPhone 14 Pro",
    wholesalePrice: 3499, // $34.99 (estimated)
    stockLevel: 25,
    qualityGrade: QualityGrade.Aftermarket,
    specifications: { Type: "InCell LCD", Feature: "IC Chip Removable", Color: "Black", Size: "6.1 inch" },
  },

  // Charging Ports
  {
    skuId: "2-C-O-IP13",
    partName: "iPhone 13 Lightning Charging Port",
    category: "Charging Ports",
    brand: "Apple",
    model: "iPhone",
    generation: "iPhone 13",
    variantMarketingName: "iPhone 13",
    wholesalePrice: 899, // $8.99
    stockLevel: 300,
    qualityGrade: QualityGrade.OEM,
    specifications: {
      Connector: "Lightning",
      Type: "Flex Cable Assembly",
    },
    // Compatible with all iPhone 13 variants
    compatibleVariants: [
      { brand: "Apple", model: "iPhone", generation: "iPhone 13", variantMarketingName: "iPhone 13 Mini" },
      { brand: "Apple", model: "iPhone", generation: "iPhone 13", variantMarketingName: "iPhone 13 Pro" },
      { brand: "Apple", model: "iPhone", generation: "iPhone 13", variantMarketingName: "iPhone 13 Pro Max" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper: Find a Variant by brand/model/generation/marketingName
// ---------------------------------------------------------------------------

async function findVariantOrThrow(
  brand: string,
  model: string,
  generation: string,
  variantMarketingName: string
) {
  return prisma.variant.findFirstOrThrow({
    where: {
      marketingName: variantMarketingName,
      generation: {
        name: generation,
        modelType: {
          name: model,
          brand: { name: brand },
        },
      },
    },
  });
}

// ---------------------------------------------------------------------------
// Seed functions
// ---------------------------------------------------------------------------

async function upsertHierarchy() {
  for (const brandSeed of hierarchySeed) {
    const brand = await prisma.brand.upsert({
      where: { name: brandSeed.brand },
      update: {},
      create: { name: brandSeed.brand },
    });

    for (const modelSeed of brandSeed.models) {
      const modelType = await prisma.modelType.upsert({
        where: { brandId_name: { brandId: brand.id, name: modelSeed.name } },
        update: {},
        create: { name: modelSeed.name, brandId: brand.id },
      });

      for (const generationSeed of modelSeed.generations) {
        const generation = await prisma.generation.upsert({
          where: { modelTypeId_name: { modelTypeId: modelType.id, name: generationSeed.name } },
          update: { releaseYear: generationSeed.releaseYear ?? null },
          create: {
            name: generationSeed.name,
            modelTypeId: modelType.id,
            releaseYear: generationSeed.releaseYear ?? null,
          },
        });

        for (const variantSeed of generationSeed.variants) {
          await prisma.variant.upsert({
            where: {
              generationId_marketingName: {
                generationId: generation.id,
                marketingName: variantSeed.marketingName,
              },
            },
            update: { modelNumber: variantSeed.modelNumber ?? null },
            create: {
              marketingName: variantSeed.marketingName,
              modelNumber: variantSeed.modelNumber ?? null,
              generationId: generation.id,
            },
          });
        }
      }
    }
  }
}

async function upsertCategories() {
  const categoryNames = ["Batteries", "Screens", "Charging Ports", "Cameras", "Speakers"];
  for (const name of categoryNames) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
}

async function upsertInventory() {
  for (const inv of inventorySeed) {
    // Resolve the primary variant
    const variant = await findVariantOrThrow(
      inv.brand,
      inv.model,
      inv.generation,
      inv.variantMarketingName
    );

    const category = await prisma.category.findUniqueOrThrow({
      where: { name: inv.category },
    });

    // Upsert the inventory item (skuId is the PK)
    await prisma.inventory.upsert({
      where: { skuId: inv.skuId },
      update: {
        wholesalePrice: inv.wholesalePrice,
        stockLevel: inv.stockLevel,
      },
      create: {
        skuId: inv.skuId,
        partName: inv.partName,
        categoryId: category.id,
        wholesalePrice: inv.wholesalePrice,
        qualityGrade: inv.qualityGrade,
        stockLevel: inv.stockLevel,
      },
    });

    // Upsert specifications using skuId + label as unique key
    if (inv.specifications) {
      for (const [label, value] of Object.entries(inv.specifications)) {
        await prisma.specification.upsert({
          where: { skuId_label: { skuId: inv.skuId, label } },
          update: { value },
          create: { skuId: inv.skuId, label, value },
        });
      }
    }

    // Upsert the primary compatibility mapping
    await prisma.compatibilityMap.upsert({
      where: { skuId_variantId: { skuId: inv.skuId, variantId: variant.id } },
      update: {},
      create: { skuId: inv.skuId, variantId: variant.id },
    });

    // Upsert additional compatible variant mappings
    if (inv.compatibleVariants) {
      for (const compat of inv.compatibleVariants) {
        const compatVariant = await findVariantOrThrow(
          compat.brand,
          compat.model,
          compat.generation,
          compat.variantMarketingName
        );

        await prisma.compatibilityMap.upsert({
          where: { skuId_variantId: { skuId: inv.skuId, variantId: compatVariant.id } },
          update: {},
          create: { skuId: inv.skuId, variantId: compatVariant.id },
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Initialize the SystemCounter for guest IDs
// ---------------------------------------------------------------------------

async function upsertSystemCounter() {
  await prisma.systemCounter.upsert({
    where: { id: "guest_id" },
    update: {},
    create: { id: "guest_id", count: 0 },
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Starting database seed...");

  await upsertHierarchy();
  console.log("✅ Device hierarchy seeded (Brand → ModelType → Generation → Variant)");

  await upsertCategories();
  console.log("✅ Categories seeded");

  await upsertInventory();
  console.log("✅ Inventory seeded (Smart SKUs with specifications and compatibility maps)");

  await upsertSystemCounter();
  console.log("✅ SystemCounter initialized for guest ID sequence");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
