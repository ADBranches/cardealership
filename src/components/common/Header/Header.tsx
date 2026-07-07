export function HeaderBrand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 border-2 border-primary flex items-center justify-center">
        <div className="w-3 h-3 bg-primary" />
      </div>
      <h1 className="text-2xl font-bold">
        <span className="text-primary">PANDA</span>
        <span className="text-foreground ml-2">MOTORS</span>
      </h1>
    </div>
  );
}
