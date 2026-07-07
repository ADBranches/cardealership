export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-5xl md:text-6xl font-bold mb-6">
              BANDA'S
              <br />
              <span className="text-primary">TRUSTED DEALER</span>
              <br />
              SINCE 2025
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Panda Motors Ltd was founded in Banda with one goal: bring world-class vehicles to
              Ugandan roads. From day one we have been the preferred choice for business leaders,
              entrepreneurs, and discerning drivers across East Africa.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Every vehicle is sourced directly from Japan, the UK, and the UAE — inspected before
              shipment, cleared through URA, and registered with UNRA on your behalf.
            </p>
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-sm text-muted-foreground">Vehicles Sold</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">EST.</p>
                <p className="text-sm text-muted-foreground">2025 — Banda</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">EA-WIDE</p>
                <p className="text-sm text-muted-foreground">Delivery Network</p>
              </div>
            </div>
          </div>
          <div className="relative h-[500px] rounded-lg overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"
              alt="Showroom"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
