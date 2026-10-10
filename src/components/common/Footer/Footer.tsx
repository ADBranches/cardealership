export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xl font-bold mb-4">
              <span className="text-primary">PANDA</span> MOTORS LTD
            </h4>
            <p className="text-sm text-muted-foreground">Banda, Jinja Road, Kampala, Uganda</p>
            <p className="text-sm text-muted-foreground mt-2">
              Uganda's trusted luxury vehicle importer, established 2025.
            </p>
          </div>
          <div>
            <h5 className="font-bold mb-4">QUICK LINKS</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/#inventory" className="hover:text-primary transition-colors">
                  Stock
                </a>
              </li>
              <li>
                <a href="/#services" className="hover:text-primary transition-colors">
                  Services
                </a>
              </li>
              <li>
                <a href="/#about" className="hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#contact" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">SERVICES</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>URA Import Clearance</li>
              <li>Bank Financing</li>
              <li>Vehicle Inspection</li>
              <li>UNRA Registration</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold mb-4">CONNECT</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Facebook</li>
              <li>Instagram</li>
              <li>WhatsApp</li>
              <li>TikTok</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Panda Motors Ltd. All rights reserved. | Banda, Jinja Road, Kampala
          </p>
          <div className="flex justify-center gap-1 h-3 mt-4">
            <div className="w-8 bg-black" />
            <div className="w-8 bg-[#FCDC04]" />
            <div className="w-8 bg-[#DE3908]" />
          </div>
        </div>
      </div>
    </footer>
  );
}
