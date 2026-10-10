import { VehicleCardSkeleton } from "./VehicleCardSkeleton";


export function VehicleInventorySkeleton() {
  return (
    <div
      className="
        grid
        grid-cols-1
        gap-6
        sm:grid-cols-2
        lg:grid-cols-3
      "
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <VehicleCardSkeleton key={index} />
      ))}
    </div>
  );
}