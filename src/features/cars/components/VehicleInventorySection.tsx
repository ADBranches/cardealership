import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";

import { VehicleCard } from "./VehicleCard";
import { VehicleInventorySkeleton } from "./VehicleInventorySkeleton";

import type {
  InventoryTab,
  Vehicle,
} from "../types";

import { Button } from "../../../components/ui/button";

import { SearchX } from "lucide-react";

interface VehicleInventorySectionProps {
  vehicles: Vehicle[];

  filterByTab: (
    tab: InventoryTab,
    list?: Vehicle[]
  ) => Vehicle[];

  loading?: boolean;

  sectionId?: string;

  showHeader?: boolean;

  resetFilters?: () => void;
}

export function VehicleInventorySection({
  vehicles,
  filterByTab,
  loading = false,
  sectionId = "inventory",
  showHeader = true,
  resetFilters,
}: VehicleInventorySectionProps) {
  const [currentTab, setCurrentTab] =
    useState<InventoryTab>("all");

  function EmptyInventoryState() {
    return (
      <div
        className="
          flex
          flex-col
          items-center
          justify-center
          rounded-xl
          border
          bg-card
          p-12
          text-center
          min-h-[350px]
        "
      >
        <div
          className="
            rounded-full
            bg-muted
            p-5
            mb-5
          "
        >
          <SearchX size={45} />
        </div>

        <h3 className="text-2xl font-bold mb-3">
          No Cars Match Your Budget
        </h3>

        <p className="max-w-md text-muted-foreground mb-6">
          We could not find vehicles matching your current
          search criteria. Try adjusting your budget or
          resetting your filters.
        </p>

        {resetFilters && (
          <Button
            onClick={() => {
              resetFilters();
              setCurrentTab("all");
            }}
          >
            Reset Filters
          </Button>
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <section
        id={sectionId}
        className="py-24 px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          {showHeader && (
            <div className="text-center mb-16">
              <h3
                className="
                  text-5xl
                  md:text-6xl
                  font-bold
                  mb-4
                "
              >
                CURRENT STOCK
              </h3>

              <p className="text-muted-foreground text-lg">
                Loading available vehicles...
              </p>
            </div>
          )}

          <VehicleInventorySkeleton />
        </div>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      className="py-24 px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {showHeader && (
          <div className="text-center mb-16">
            <h3
              className="
                text-5xl
                md:text-6xl
                font-bold
                mb-4
              "
            >
              CURRENT STOCK
            </h3>

            <p className="text-muted-foreground text-lg">
              All vehicles are Japan- and UK-imported,
              URA duty paid, and ready for immediate
              registration with UNRA.
            </p>
          </div>
        )}

        <Tabs
          value={currentTab}
          onValueChange={(value) =>
            setCurrentTab(value as InventoryTab)
          }
          className="w-full"
        >
          <TabsList
            className="
              grid
              w-full
              max-w-md
              mx-auto
              grid-cols-4
              mb-12
              h-12
            "
          >
            <TabsTrigger
              value="all"
              className="
                font-semibold
                data-[state=active]:bg-primary
                data-[state=active]:text-white
              "
            >
              ALL
            </TabsTrigger>

            <TabsTrigger
              value="luxury"
              className="
                font-semibold
                data-[state=active]:bg-primary
                data-[state=active]:text-white
              "
            >
              LUXURY
            </TabsTrigger>

            <TabsTrigger
              value="sport"
              className="
                font-semibold
                data-[state=active]:bg-primary
                data-[state=active]:text-white
              "
            >
              SPORT
            </TabsTrigger>

            <TabsTrigger
              value="4x4"
              className="
                font-semibold
                data-[state=active]:bg-primary
                data-[state=active]:text-white
              "
            >
              4X4
            </TabsTrigger>
          </TabsList>

          {(
            [
              "all",
              "luxury",
              "sport",
              "4x4",
            ] as InventoryTab[]
          ).map((tab) => (
            <TabsContent
              key={tab}
              value={tab}
            >
              {filterByTab(tab).length === 0 ? (
                <EmptyInventoryState />
              ) : (
                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    lg:grid-cols-3
                    gap-8
                  "
                >
                  {filterByTab(tab).map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}