import { useState, useEffect } from "react";
import {
  Menu, X, ChevronRight, Phone, Mail, MapPin, Search, Calendar,
  Shield, Wrench, FileText, MessageCircle, ArrowUp
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent } from "./components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

function formatUGX(amount: number) {
  if (amount >= 1_000_000_000) return `UGX ${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `UGX ${(amount / 1_000_000).toFixed(0)}M`;
  return `UGX ${amount.toLocaleString()}`;
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState(500000000);
  const [searchBrand, setSearchBrand] = useState("");
  const [searchYear, setSearchYear] = useState("");
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowWhatsApp(window.scrollY > 300);
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const vehicles = [
    {
      id: 1,
      name: "Land Cruiser V8",
      brand: "Toyota",
      type: "Luxury SUV",
      year: 2023,
      price: 285000000,
      image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80",
      specs: {
        power: "309 HP",
        engine: "4.5L V8",
        drive: "4WD",
      },
      category: "luxury",
      condition: "New",
    },
    {
      id: 2,
      name: "S-Class S500",
      brand: "Mercedes-Benz",
      type: "Luxury Sedan",
      year: 2023,
      price: 360000000,
      image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
      specs: {
        power: "429 HP",
        engine: "3.0L V6T",
        drive: "RWD",
      },
      category: "luxury",
      condition: "New",
    },
    {
      id: 3,
      name: "Range Rover Sport",
      brand: "Land Rover",
      type: "Sport Luxury SUV",
      year: 2023,
      price: 420000000,
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
      specs: {
        power: "395 HP",
        engine: "3.0L I6T",
        drive: "AWD",
      },
      category: "sport",
      condition: "New",
    },
    {
      id: 4,
      name: "X5 xDrive40i",
      brand: "BMW",
      type: "Sports SUV",
      year: 2023,
      price: 195000000,
      image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
      specs: {
        power: "335 HP",
        engine: "3.0L I6T",
        drive: "AWD",
      },
      category: "sport",
      condition: "New",
    },
    {
      id: 5,
      name: "Land Cruiser Prado TZ",
      brand: "Toyota",
      type: "Premium SUV",
      year: 2022,
      price: 168000000,
      image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
      specs: {
        power: "177 HP",
        engine: "2.8L Diesel",
        drive: "4WD",
      },
      category: "luxury",
      condition: "Used",
    },
    {
      id: 6,
      name: "LX 570",
      brand: "Lexus",
      type: "Ultra Luxury SUV",
      year: 2023,
      price: 390000000,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80",
      specs: {
        power: "383 HP",
        engine: "5.7L V8",
        drive: "4WD",
      },
      category: "luxury",
      condition: "New",
    },
  ];

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesBrand = searchBrand ? vehicle.brand.toLowerCase().includes(searchBrand.toLowerCase()) : true;
    const matchesYear = searchYear ? vehicle.year.toString().includes(searchYear) : true;
    const matchesPrice = vehicle.price <= priceRange;
    return matchesBrand && matchesYear && matchesPrice;
  });

  const VehicleCard = ({ vehicle }: { vehicle: typeof vehicles[0] }) => (
    <Card className="bg-card border-border overflow-hidden group cursor-pointer transition-all hover:border-primary/50">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={vehicle.image} 
          alt={vehicle.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&q=80";
          }}
        />
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 text-xs font-bold rounded-sm">{vehicle.year}</div>
        <div className={`absolute top-4 right-24 px-3 py-1 text-xs font-bold rounded-sm ${vehicle.condition === 'Used' ? 'bg-orange-500 text-white' : 'bg-green-500 text-white'}`}>
          {vehicle.condition}
        </div>
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 text-xs font-bold tracking-wide rounded-sm">{vehicle.brand}</div>
      </div>
      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-primary text-sm font-semibold mb-1 tracking-wide">{vehicle.type}</p>
          <h4 className="text-2xl font-bold mb-2">{vehicle.name}</h4>
          <p className="text-3xl font-bold text-primary">{formatUGX(vehicle.price)}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          <div><p className="text-xs text-muted-foreground mb-1">POWER</p><p className="text-sm font-semibold">{vehicle.specs.power}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">ENGINE</p><p className="text-sm font-semibold">{vehicle.specs.engine}</p></div>
          <div><p className="text-xs text-muted-foreground mb-1">DRIVE</p><p className="text-sm font-semibold">{vehicle.specs.drive}</p></div>
        </div>
        <Button className="w-full mt-6 bg-primary hover:bg-primary/90 text-white font-semibold">VIEW DETAILS <ChevronRight className="ml-2" size={18} /></Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary flex items-center justify-center"><div className="w-3 h-3 bg-primary" /></div>
              <h1 className="text-2xl font-bold"><span className="text-primary">PANDA</span><span className="text-foreground ml-2">MOTORS</span></h1>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#inventory" className="text-sm font-medium hover:text-primary transition-colors">INVENTORY</a>
              <a href="#services" className="text-sm font-medium hover:text-primary transition-colors">SERVICES</a>
              <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">ABOUT</a>
              <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">CONTACT</a>
              <Button className="bg-primary text-white hover:bg-primary/90">BOOK TEST DRIVE</Button>
            </nav>
            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
        <img src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=1600&q=80" alt="Premium Vehicle" className="absolute inset-0 w-full h-full object-cover" />
        <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <p className="text-primary text-sm font-bold tracking-[0.3em] mb-4 uppercase">Kampala, Uganda</p>
            <h2 className="text-6xl md:text-8xl font-bold mb-6 leading-none text-white">DRIVE THE<br /><span className="text-primary">PEARL OF</span><br />AFRICA</h2>
            <p className="text-lg md:text-xl text-gray-200 mb-8">Uganda's premier destination for luxury and 4x4 vehicles. Imported, cleared, and ready to conquer Kampala's roads and beyond.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary text-white hover:bg-primary/90" onClick={() => document.getElementById("inventory")?.scrollIntoView({ behavior: "smooth" })}>EXPLORE STOCK <ChevronRight className="ml-2" /></Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}>GET A QUOTE</Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-20 flex h-2">
          <div className="flex-1 bg-black" /><div className="flex-1 bg-[#FCDC04]" /><div className="flex-1 bg-[#DE3908]" />
          <div className="flex-1 bg-black" /><div className="flex-1 bg-[#FCDC04]" /><div className="flex-1 bg-[#DE3908]" />
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16 px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-6 tracking-widest font-semibold">SEARCH OUR BANDA SHOWROOM INVENTORY</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input type="text" placeholder="Brand (Toyota, BMW...)" value={searchBrand} onChange={(e) => setSearchBrand(e.target.value)} className="h-12" />
            <Input type="text" placeholder="Model Year" value={searchYear} onChange={(e) => setSearchYear(e.target.value)} className="h-12" />
            <Input type="text" placeholder="Max Budget (UGX)" value={priceRange === 500000000 ? "No Limit" : formatUGX(priceRange)} readOnly className="h-12 cursor-pointer" onClick={() => setShowAdvanced(!showAdvanced)} />
            <Button className="h-12" onClick={() => { setSearchBrand(""); setSearchYear(""); setPriceRange(500000000); }}><Search className="mr-2" size={18} />RESET FILTERS</Button>
          </div>

          {/* Advanced Price Slider */}
          <div className="mt-6 p-6 border rounded-lg bg-background">
            <button onClick={() => setShowAdvanced(!showAdvanced)} className="text-sm text-primary font-semibold mb-4">
              {showAdvanced ? '▼' : '▶'} {showAdvanced ? 'Hide' : 'Show'} Advanced Price Filter
            </button>
            {showAdvanced && (
              <div className="mt-4">
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium">Max Price: <span className="text-primary font-bold text-lg">{priceRange === 500000000 ? "No Limit" : formatUGX(priceRange)}</span></label>
                </div>
                <input type="range" min="0" max="500000000" step="10000000" value={priceRange} onChange={(e) => setPriceRange(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>UGX 0</span><span>UGX 50M</span><span>UGX 100M</span><span>UGX 250M</span><span>UGX 500M+</span>
                </div>
                <div className="flex gap-2 mt-4 flex-wrap">
                  {[50000000, 100000000, 200000000, 300000000, 400000000, 500000000].map(price => (
                    <button key={price} onClick={() => setPriceRange(price)} className={`text-xs px-3 py-1 rounded-sm transition-colors ${priceRange === price ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                      {price === 500000000 ? "No Limit" : formatUGX(price)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center"><p className="text-sm">Found <span className="font-bold text-primary">{filteredVehicles.length}</span> vehicles</p></div>
        </div>
      </section>

      {/* Inventory Section with Tabs */}
      <section id="inventory" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl md:text-6xl font-bold mb-4">CURRENT STOCK</h3>
            <p className="text-muted-foreground text-lg">All vehicles are Japan- and UK-imported, URA duty paid, and ready for immediate registration with UNRA.</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-12 h-12">
              <TabsTrigger value="all" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">ALL</TabsTrigger>
              <TabsTrigger value="luxury" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">LUXURY</TabsTrigger>
              <TabsTrigger value="sport" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">SPORT</TabsTrigger>
              <TabsTrigger value="4x4" className="font-semibold data-[state=active]:bg-primary data-[state=active]:text-white">4X4</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVehicles.map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>
            </TabsContent>

            <TabsContent value="luxury">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVehicles.filter(v => v.category === "luxury").map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>
            </TabsContent>

            <TabsContent value="sport">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVehicles.filter(v => v.category === "sport").map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>
            </TabsContent>

            <TabsContent value="4x4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVehicles.filter(v => v.specs.drive === "4WD" || v.specs.drive === "AWD").map(vehicle => <VehicleCard key={vehicle.id} vehicle={vehicle} />)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-6 lg:px-8 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-5xl md:text-6xl font-bold mb-4">OUR SERVICES</h3>
            <p className="text-muted-foreground text-lg">From import to keys-in-hand — we handle every step so you drive with total confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group"><div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all"><Shield className="text-primary" size={40} /></div><h4 className="text-xl font-bold mb-3">URA Duty Clearance</h4><p className="text-muted-foreground">Full import duty processing and Uganda Revenue Authority clearance handled for you</p></div>
            <div className="text-center group"><div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all"><FileText className="text-primary" size={40} /></div><h4 className="text-xl font-bold mb-3">Import Documentation</h4><p className="text-muted-foreground">Pre-shipment inspection, bond clearance, and all customs paperwork managed end-to-end</p></div>
            <div className="text-center group"><div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all"><Wrench className="text-primary" size={40} /></div><h4 className="text-xl font-bold mb-3">Certified Workshop</h4><p className="text-muted-foreground">State-of-the-art service centre with trained technicians for all major brands</p></div>
            <div className="text-center group"><div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-all"><Calendar className="text-primary" size={40} /></div><h4 className="text-xl font-bold mb-3">Flexible Financing</h4><p className="text-muted-foreground">Partnered with Centenary Bank, Stanbic, and DFCU for competitive auto loan rates</p></div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-5xl md:text-6xl font-bold mb-6">BANDA'S<br /><span className="text-primary">TRUSTED DEALER</span><br />SINCE 2025</h3>
              <p className="text-lg text-muted-foreground mb-6">Panda Motors Ltd was founded in Banda with one goal: bring world-class vehicles to Ugandan roads. From day one we have been the preferred choice for business leaders, entrepreneurs, and discerning drivers across East Africa.</p>
              <p className="text-lg text-muted-foreground mb-8">Every vehicle is sourced directly from Japan, the UK, and the UAE — inspected before shipment, cleared through URA, and registered with UNRA on your behalf.</p>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-border">
                <div><p className="text-4xl font-bold text-primary mb-2">500+</p><p className="text-sm text-muted-foreground">Vehicles Sold</p></div>
                <div><p className="text-4xl font-bold text-primary mb-2">EST.</p><p className="text-sm text-muted-foreground">2025 — Banda</p></div>
                <div><p className="text-4xl font-bold text-primary mb-2">EA-WIDE</p><p className="text-sm text-muted-foreground">Delivery Network</p></div>
              </div>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80" alt="Showroom" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 lg:px-8 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h3 className="text-5xl md:text-6xl font-bold mb-6">VISIT OUR<br /><span className="text-primary">BANDA</span><br />SHOWROOM</h3>
              <p className="text-lg text-muted-foreground mb-8">Walk in or call ahead. Our consultants speak Luganda, English, and Swahili — no pressure, just expert advice.</p>
              <div className="space-y-6">
                <div className="flex items-start gap-4"><MapPin className="text-primary mt-1" size={24} /><div><h4 className="font-bold mb-1">ADDRESS</h4><p className="text-muted-foreground">Banda, Jinja Road<br />Kampala, Uganda</p></div></div>
                <div className="flex items-start gap-4"><Phone className="text-primary mt-1" size={24} /><div><h4 className="font-bold mb-1">PHONE / WHATSAPP</h4><p className="text-muted-foreground">+256 770 826 951<br />+256 756 053 475</p></div></div>
                <div className="flex items-start gap-4"><Mail className="text-primary mt-1" size={24} /><div><h4 className="font-bold mb-1">EMAIL</h4><p className="text-muted-foreground">sales@pandamotors.co.ug</p></div></div>
                <div className="flex items-start gap-4"><Calendar className="text-primary mt-1" size={24} /><div><h4 className="font-bold mb-1">OPENING HOURS</h4><p className="text-muted-foreground">Monday – Friday: 8:00 AM – 6:00 PM<br />Saturday: 9:00 AM – 5:00 PM<br />Sunday: Closed</p></div></div>
              </div>
            </div>
            <div className="bg-background border border-border rounded-lg p-8">
              <h4 className="text-2xl font-bold mb-2">REQUEST A QUOTE</h4>
              <p className="text-muted-foreground text-sm mb-6">We respond within 30 minutes during business hours.</p>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4"><Input placeholder="First Name" className="h-12" /><Input placeholder="Last Name" className="h-12" /></div>
                <Input type="email" placeholder="Email Address" className="h-12" />
                <Input type="tel" placeholder="+256 700 000 000" className="h-12" />
                <Input placeholder="Vehicle of Interest (e.g. Land Cruiser V8)" className="h-12" />
                <textarea placeholder="Any additional requirements or questions..." rows={4} className="w-full px-4 py-3 border border-border rounded-lg bg-background" />
                <Button className="w-full h-12 bg-primary text-white hover:bg-primary/90">SEND ENQUIRY</Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div><h4 className="text-xl font-bold mb-4"><span className="text-primary">PANDA</span> MOTORS LTD</h4><p className="text-sm text-muted-foreground">Banda, Jinja Road, Kampala, Uganda</p><p className="text-sm text-muted-foreground mt-2">Uganda's trusted luxury vehicle importer, established 2025.</p></div>
            <div><h5 className="font-bold mb-4">QUICK LINKS</h5><ul className="space-y-2 text-sm text-muted-foreground"><li><a href="#inventory" className="hover:text-primary transition-colors">Stock</a></li><li><a href="#services" className="hover:text-primary transition-colors">Services</a></li><li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li><li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li></ul></div>
            <div><h5 className="font-bold mb-4">SERVICES</h5><ul className="space-y-2 text-sm text-muted-foreground"><li>URA Import Clearance</li><li>Bank Financing</li><li>Vehicle Inspection</li><li>UNRA Registration</li></ul></div>
            <div><h5 className="font-bold mb-4">CONNECT</h5><ul className="space-y-2 text-sm text-muted-foreground"><li>Facebook</li><li>Instagram</li><li>WhatsApp</li><li>TikTok</li></ul></div>
          </div>
          <div className="pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© 2025 Panda Motors Ltd. All rights reserved. | Banda, Jinja Road, Kampala</p>
            <div className="flex justify-center gap-1 h-3 mt-4">
              <div className="w-8 bg-black" /><div className="w-8 bg-[#FCDC04]" /><div className="w-8 bg-[#DE3908]" />
            </div>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button onClick={scrollToTop} className="fixed bottom-24 right-6 z-50 bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/80 transition-all duration-300 hover:scale-110">
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* WhatsApp Button */}
      {showWhatsApp && (
        <a href="https://wa.me/256770826951?text=Hello%20Panda%20Motors%2C%20I'm%20interested%20in%20a%20vehicle%20from%20your%20showroom" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-pulse">
          <MessageCircle className="w-6 h-6" />
        </a>
      )}
    </div>
  );
}