
'use client';

import * as React from 'react';
import { useState } from 'react';
import { searchParts, fetchBrands, fetchModels } from '@/lib/api'; // Using fetchBrands and fetchModels from existing api.ts
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Example component demonstrating how to use the external API functions
 * from lib/api.ts to fetch parts, brands, and models.
 */
export function ProductSearchExample() {
  const [device, setDevice] = useState('');
  const [parts, setParts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch brands on component mount
  React.useEffect(() => {
    const getBrandsData = async () => {
      try {
        const response = await fetchBrands();
        setBrands(response || []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
        toast.error('Failed to fetch brands');
      }
    };
    getBrandsData();
  }, []);

  // Fetch models when brand is selected
  React.useEffect(() => {
    if (selectedBrand) {
      const getModelsData = async () => {
        try {
          const response = await fetchModels(selectedBrand);
          setModels(response || []);
        } catch (error) {
          console.error('Failed to fetch models:', error);
          toast.error('Failed to fetch models');
        }
      };
      getModelsData();
    }
  }, [selectedBrand]);

  const handleSearch = async () => {
    if (!device.trim()) {
      toast.error('Please enter a device name');
      return;
    }

    setLoading(true);
    try {
      const response = await searchParts(device);
      setParts(response || []);
      if (response.length === 0) {
        toast.info('No parts found for this device');
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Failed to search parts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Parts by Device</CardTitle>
          <CardDescription>
            Enter a device name to find compatible parts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., iPhone17PrM"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Brand & Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Browse by Brand & Model</CardTitle>
          <CardDescription>
            Select a brand to see available models
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedBrand} onValueChange={setSelectedBrand}>
            <SelectTrigger>
              <SelectValue placeholder="Select a brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand: any) => (
                <SelectItem key={brand.id} value={brand.id.toString()}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {models.length > 0 && (
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model: any) => (
                  <SelectItem key={model.id} value={model.id.toString()}>
                    {model.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      {parts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Found {parts.length} Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parts.map((part: any) => (
                <div
                  key={part.skuId}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{part.partName}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {part.skuId}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Category: {part.category}
                      </p>
                      {part.specifications && (
                        <p className="text-sm text-muted-foreground">
                          {part.specifications}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {part.wholesalePrice > 0 ? `$${(part.wholesalePrice / 100).toFixed(2)}` : 'Quote'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {part.stockLevel}
                      </p>
                      {part.qualityGrade && (
                        <p className="text-sm font-medium text-green-600">
                          {part.qualityGrade}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
