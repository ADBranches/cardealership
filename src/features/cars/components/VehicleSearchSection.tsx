import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatUGX, MAX_PRICE_RANGE } from "../utils/formatUGX";

interface VehicleSearchSectionProps {
  searchBrand: string;
  setSearchBrand: (value: string) => void;
  searchYear: string;
  setSearchYear: (value: string) => void;
  priceRange: number;
  setPriceRange: (value: number) => void;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  filteredCount: number;
  resetFilters: () => void;
}

export function VehicleSearchSection({
  searchBrand,
  setSearchBrand,
  searchYear,
  setSearchYear,
  priceRange,
  setPriceRange,
  showAdvanced,
  setShowAdvanced,
  filteredCount,
  resetFilters,
}: VehicleSearchSectionProps) {
  return (
    <section className="py-16 px-6 lg:px-8 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-sm text-muted-foreground mb-6 tracking-widest font-semibold">
          SEARCH OUR BANDA SHOWROOM INVENTORY
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Brand (Toyota, BMW...)"
            value={searchBrand}
            onChange={(event) => setSearchBrand(event.target.value)}
            className="h-12"
          />
          <Input
            type="text"
            placeholder="Model Year"
            value={searchYear}
            onChange={(event) => setSearchYear(event.target.value)}
            className="h-12"
          />
          <Input
            type="text"
            placeholder="Max Budget (UGX)"
            value={priceRange === MAX_PRICE_RANGE ? "No Limit" : formatUGX(priceRange)}
            readOnly
            className="h-12 cursor-pointer"
            onClick={() => setShowAdvanced(!showAdvanced)}
          />
          <Button className="h-12" onClick={resetFilters}>
            <Search className="mr-2" size={18} />
            RESET FILTERS
          </Button>
        </div>

        <div className="mt-6 p-6 border rounded-lg bg-background">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-primary font-semibold mb-4"
          >
            {showAdvanced ? "▼" : "▶"} {showAdvanced ? "Hide" : "Show"} Advanced Price Filter
          </button>
          {showAdvanced && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm font-medium">
                  Max Price:{" "}
                  <span className="text-primary font-bold text-lg">
                    {priceRange === MAX_PRICE_RANGE ? "No Limit" : formatUGX(priceRange)}
                  </span>
                </label>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_PRICE_RANGE}
                step="10000000"
                value={priceRange}
                onChange={(event) => setPriceRange(parseInt(event.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>UGX 0</span>
                <span>UGX 50M</span>
                <span>UGX 100M</span>
                <span>UGX 250M</span>
                <span>UGX 500M+</span>
              </div>
              <div className="flex gap-2 mt-4 flex-wrap">
                {[50000000, 100000000, 200000000, 300000000, 400000000, MAX_PRICE_RANGE].map(
                  (price) => (
                    <button
                      key={price}
                      onClick={() => setPriceRange(price)}
                      className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                        priceRange === price
                          ? "bg-primary text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {price === MAX_PRICE_RANGE ? "No Limit" : formatUGX(price)}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm">
            Found <span className="font-bold text-primary">{filteredCount}</span> vehicles
          </p>
        </div>
      </div>
    </section>
  );
}
