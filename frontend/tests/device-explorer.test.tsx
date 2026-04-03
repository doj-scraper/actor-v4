import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeviceExplorer } from "@/components/device-explorer";

const hierarchy = [
  {
    id: "1",
    name: "Apple",
    models: [
      {
        id: "11",
        brandId: "1",
        name: "iPhone",
        generations: [
          {
            id: "111",
            name: "14 Series",
            releaseYear: 2022,
            variants: [
              {
                id: "1111",
                modelTypeId: "11",
                generationId: "111",
                modelNumber: "A2882",
                marketingName: "iPhone 14 Pro",
              },
            ],
          },
        ],
      },
    ],
  },
];

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    statusText: ok ? "OK" : "Error",
    json: async () => body,
  } as Response;
}

let fetchMock: ReturnType<typeof vi.fn>;

describe("device explorer", () => {
  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the loading state before hierarchy data arrives", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<DeviceExplorer />);

    expect(screen.getByText(/Loading device catalog/i)).toBeInTheDocument();
  });

  it("renders the error state when no hierarchy is available", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: [] }));

    render(<DeviceExplorer />);

    expect(
      await screen.findByText(/No device data available\. Please check your connection\./i)
    ).toBeInTheDocument();
  });

  it("drills into a variant and fetches compatible parts", async () => {
    let resolveParts: ((value: Response) => void) | null = null;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes("/api/hierarchy")) {
        return Promise.resolve(jsonResponse({ data: hierarchy }));
      }
      if (url.includes("/api/inventory/variants/1111/parts")) {
        return new Promise((resolve) => {
          resolveParts = resolve;
        });
      }
      return Promise.resolve(jsonResponse({ data: [] }));
    });

    render(<DeviceExplorer />);

    await screen.findByText(/Select Brand/i);
    await userEvent.type(
      screen.getByPlaceholderText("Search brands, models, generations, variants..."),
      "iPhone 14 Pro"
    );
    await screen.findByText("iPhone 14 Pro");
    await userEvent.click(screen.getByText("iPhone 14 Pro"));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining("/api/inventory/variants/1111/parts"),
        expect.anything()
      )
    );

    resolveParts?.(
      jsonResponse({
        data: [
          {
            skuId: "DSP-001",
            partName: "Display Assembly",
            category: "Displays",
            wholesalePrice: 1250,
            stockLevel: 9,
            qualityGrade: "OEM",
            compatibilities: [],
          },
        ],
      })
    );

    expect(await screen.findByText("Display Assembly")).toBeInTheDocument();
  });
});
