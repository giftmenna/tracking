import { Link } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Building,
  Navigation,
  Star
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const locations = [
  {
    city: "San Francisco",
    address: "123 Shipping Lane, Financial District",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
    services: ["All Services", "International Hub", "Cargo Terminal"],
    coordinates: { lat: 37.7749, lng: -122.4194 },
    isMainHub: true
  },
  {
    city: "New York",
    address: "456 Federal Way, Manhattan",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-2PM",
    services: ["Standard & Express", "Business Services", "Document Services"],
    coordinates: { lat: 40.7128, lng: -74.0060 },
    isMainHub: true
  },
  {
    city: "Tokyo",
    address: "789 Industrial Avenue, Shinjuku",
    hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM",
    services: ["Industrial Shipping", "Cargo Services", "Freight Forwarding"],
    coordinates: { lat: 35.6762, lng: 139.6503 },
    isMainHub: false
  },
  {
    city: "Singapore",
    address: "321 Market Street, Central Business District",
    hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM",
    services: ["Asian Hub", "International Forwarding", "Bulk Shipping"],
    coordinates: { lat: 1.3521, lng: 103.8198 },
    isMainHub: false
  },
  {
    city: "Los Angeles",
    address: "654 Liberty Road, Hollywood",
    hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-1PM",
    services: ["West Coast Hub", "Express Delivery", "Package Solutions"],
    coordinates: { lat: 34.0522, lng: -118.2437 },
    isMainHub: false
  },
  {
    city: "Seattle",
    address: "986 Emerald City Way, Downtown",
    hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-12PM",
    services: ["Pacific Northwest Hub", "Tech Services", "Regional Distribution"],
    coordinates: { lat: 47.6062, lng: -122.3321 },
    isMainHub: false
  }
];

const serviceAreas = [
  "California", "New York", "Texas", "Washington", 
  "Illinois", "Florida", "Pennsylvania", "Ohio",
  "Tokyo Region", "Singapore", "Seoul", "Bangkok", "China"
];

export default function Locations() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-hero text-primary-foreground overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container relative py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-sm font-medium animate-fade-in">
              <MapPin className="h-4 w-4 text-accent" />
              Nationwide Network
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-slide-up">
              Find Your Nearest
              <span className="text-gradient"> SwiftShip Location</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              With service centers worldwide, we're always close by. 
              Find your nearest location for drop-offs, pickups, and customer service.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/track">
                  Track Package
                  <Navigation className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/contact">
                  Get Directions
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Global Network
            </h2>
            <p className="text-muted-foreground text-lg">
              Explore our worldwide shipping locations and service areas
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3151.835434509434!2d144.9537353153152!3d-37.816279!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ad642af0f11fd81%3A0xf577d5a4!2sMelbourne%20CBD!5e0!3m2!1sen!2sau!4v1600000000000!5m2!1sen!2sau"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SwiftShip Global Locations"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Main Hubs */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Main Service Hubs
            </h2>
            <p className="text-muted-foreground text-lg">
              Our major hubs offer comprehensive shipping services with extended hours
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {locations.filter(loc => loc.isMainHub).map((location, index) => (
              <Card
                key={location.city}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{location.city}</CardTitle>
                      <CardDescription className="text-base">Main Service Hub</CardDescription>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <Building className="h-6 w-6 text-accent" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{location.address}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{location.hours}</span>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Services Available:</p>
                    <div className="flex flex-wrap gap-2">
                      {location.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <a href={`https://www.google.com/maps?q=${encodeURIComponent(location.address)}`} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    </a>
                    <Button variant="accent" size="sm" className="flex-1" asChild>
                      <Link to="/auth">
                        Contact Branch
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All Locations */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              All Service Centers
            </h2>
            <p className="text-muted-foreground text-lg">
              Find your nearest SwiftShip location worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {locations.filter(loc => !loc.isMainHub).map((location, index) => (
              <Card
                key={location.city}
                className="p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{location.city}</CardTitle>
                  <CardDescription>{location.address}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{location.hours}</span>
                  </div>
                  <div className="pt-2">
                    <a href={`https://www.google.com/maps?q=${encodeURIComponent(location.address)}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Directions
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Service Coverage Areas
              </h2>
              <p className="text-muted-foreground text-lg">
                We provide comprehensive shipping services worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              {serviceAreas.map((area, index) => (
                <div
                  key={area}
                  className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg animate-slide-up"
                  style={{ animationDelay: `${index * 25}ms` }}
                >
                  <Star className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">{area}</span>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Card className="p-6 bg-accent/5 border-accent/20">
                <CardContent className="space-y-4">
                  <h3 className="text-xl font-semibold">Don't see your area?</h3>
                  <p className="text-muted-foreground">
                    We're constantly expanding our network. Contact us to inquire about service availability in your location.
                  </p>
                  <Button variant="accent" size="lg" asChild>
                    <Link to="/contact">
                      Request Service in Your Area
                      <MapPin className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
