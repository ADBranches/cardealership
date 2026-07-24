import { Calendar, FileText, Shield, Wrench } from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: Shield,
      title: "URA Duty Clearance",
      description:
        "Full import duty processing and Uganda Revenue Authority clearance handled for you",
    },
    {
      icon: FileText,
      title: "Import Documentation",
      description:
        "Pre-shipment inspection, bond clearance, and all customs paperwork managed end-to-end",
    },
    {
      icon: Wrench,
      title: "Certified Workshop",
      description: "State-of-the-art service centre with trained technicians for all major brands",
    },
    {
      icon: Calendar,
      title: "Flexible Financing",
      description:
        "Partnered with Centenary Bank, Stanbic, and DFCU for competitive auto loan rates",
    },
  ];

  return (
    <section id="services" className="py-24 px-6 lg:px-8 bg-card border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-5xl md:text-6xl font-bold mb-4">OUR SERVICES</h3>
          <p className="text-muted-foreground text-lg">
            From import to keys-in-hand — we handle every step so you drive with total confidence.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service) => (
            <div key={service.title} className="text-center group">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all">
                <service.icon className="text-primary" size={40} />
              </div>
              <h4 className="text-xl font-bold mb-3">{service.title}</h4>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
