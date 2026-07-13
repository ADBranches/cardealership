import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VehicleCard } from "./VehicleCard";
import type { InventoryTab, Vehicle } from "../types";

interface VehicleInventorySectionProps {
  vehicles: Vehicle[];
  filterByTab: (tab: InventoryTab, list?: Vehicle[]) => Vehicle[];
  sectionId?: string;
  showHeader?: boolean;
}

export function VehicleInventorySection({
  vehicles,
  filterByTab,
  sectionId = "inventory",
  showHeader = true,
}: VehicleInventorySectionProps) {
  return (
    <section id={sectionId} className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {showHeader && (
          <div className="text-center mb-16">
            <h3 className="text-5xl md:text-6xl font-bold mb-4">CURRENT STOCK</h3>
            <p className="text-muted-foreground text-lg">
              All vehicles are Japan- and UK-imported, URA duty paid, and ready for immediate
              registration with UNRA.
            </p>
          </div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-12 h-12">
            <TabsTrigger
              value="all"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              ALL
            </TabsTrigger>
            <TabsTrigger
              value="luxury"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              LUXURY
            </TabsTrigger>
            <TabsTrigger
              value="sport"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              SPORT
            </TabsTrigger>
            <TabsTrigger
              value="4x4"
              className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              4X4
            </TabsTrigger>
          </TabsList>

          {(["all", "luxury", "sport", "4x4"] as InventoryTab[]).map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filterByTab(tab).map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
