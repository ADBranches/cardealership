import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatUGX } from "../utils/formatUGX";
import type { Vehicle } from "../types";

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="bg-card border-border overflow-hidden group cursor-pointer transition-all hover:border-primary/50">
      <div className="relative h-64 overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(event) => {
            const target = event.target as HTMLImageElement;
            target.src =
              "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80";
          }}
        />
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-sm">
          {vehicle.year}
        </div>
        <div
          className={`absolute top-4 right-24 px-3 py-1 text-xs font-bold rounded-sm ${
            vehicle.condition === "Used"
              ? "bg-orange-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          {vehicle.condition}
        </div>
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold tracking-wide rounded-sm">
          {vehicle.brand}
        </div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-primary text-sm font-semibold mb-1 tracking-wide">{vehicle.type}</p>
          <h4 className="text-2xl font-bold mb-2">{vehicle.name}</h4>
          <p className="text-3xl font-bold text-primary">{formatUGX(vehicle.price)}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">POWER</p>
            <p className="text-sm font-semibold">{vehicle.specs.power}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">ENGINE</p>
            <p className="text-sm font-semibold">{vehicle.specs.engine}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">DRIVE</p>
            <p className="text-sm font-semibold">{vehicle.specs.drive}</p>
          </div>
        </div>
        <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold">
          VIEW DETAILS <ChevronRight className="ml-2" size={18} />
        </Button>
      </CardContent>
    </Card>
  );
}
