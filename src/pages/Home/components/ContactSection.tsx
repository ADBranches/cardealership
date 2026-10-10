import { Calendar, Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h3 className="text-5xl md:text-6xl font-bold mb-6">
              VISIT OUR
              <br />
              <span className="text-primary">BANDA</span>
              <br />
              SHOWROOM
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Walk in or call ahead. Our consultants speak Luganda, English, and Swahili — no
              pressure, just expert advice.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="text-primary mt-1" size={24} />
                <div>
                  <h4 className="font-bold mb-1">ADDRESS</h4>
                  <p className="text-muted-foreground">
                    Banda, Jinja Road
                    <br />
                    Kampala, Uganda
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="text-primary mt-1" size={24} />
                <div>
                  <h4 className="font-bold mb-1">PHONE / WHATSAPP</h4>
                  <p className="text-muted-foreground">
                    +256 770 826 951
                    <br />
                    +256 756 053 475
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="text-primary mt-1" size={24} />
                <div>
                  <h4 className="font-bold mb-1">EMAIL</h4>
                  <p className="text-muted-foreground">sales@pandamotors.co.ug</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Calendar className="text-primary mt-1" size={24} />
                <div>
                  <h4 className="font-bold mb-1">OPENING HOURS</h4>
                  <p className="text-muted-foreground">
                    Monday – Friday: 8:00 AM – 6:00 PM
                    <br />
                    Saturday: 9:00 AM – 5:00 PM
                    <br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-background border border-border rounded-lg p-8">
            <h4 className="text-2xl font-bold mb-2">REQUEST A QUOTE</h4>
            <p className="text-muted-foreground text-sm mb-6">
              We respond within 30 minutes during business hours.
            </p>
            <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="First Name" className="h-12" />
                <Input placeholder="Last Name" className="h-12" />
              </div>
              <Input type="email" placeholder="Email Address" className="h-12" />
              <Input type="tel" placeholder="+256 700 000 000" className="h-12" />
              <Input placeholder="Vehicle of Interest (e.g. Land Cruiser V8)" className="h-12" />
              <textarea
                placeholder="Any additional requirements or questions..."
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background"
              />
              <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90">
                SEND ENQUIRY
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
