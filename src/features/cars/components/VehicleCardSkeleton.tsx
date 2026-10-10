export function VehicleCardSkeleton() {
  return (
    <div
      className="
        rounded-xl
        border
        bg-card
        overflow-hidden
        animate-pulse
      "
    >

      {/* Vehicle image placeholder */}
      <div
        className="
          h-56
          bg-muted
        "
      />


      <div className="p-5 space-y-4">

        {/* Vehicle name */}
        <div
          className="
            h-6
            w-3/4
            rounded
            bg-muted
          "
        />


        {/* Brand and year */}
        <div
          className="
            h-4
            w-1/2
            rounded
            bg-muted
          "
        />


        {/* Vehicle specifications */}
        <div
          className="
            h-4
            w-full
            rounded
            bg-muted
          "
        />


        <div
          className="
            h-4
            w-5/6
            rounded
            bg-muted
          "
        />


        {/* Action button */}
        <div
          className="
            h-10
            w-full
            rounded-lg
            bg-muted
          "
        />

      </div>

    </div>
  );
}