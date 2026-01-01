import { Link } from "react-router-dom";
import { 
  Truck, 
  Clock, 
  Shield, 
  Globe, 
  Zap,
  Package,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: Truck,
    title: "Standard Shipping",
    description: "Reliable ground shipping with 3-5 business day delivery. Perfect for non-urgent packages and cost-effective shipments.",
    features: ["3-5 business days", "Real-time tracking", "Insurance included", "Door-to-door delivery"],
    price: "From $10"
  },
  {
    icon: Zap,
    title: "Express Delivery",
    description: "Fast and efficient delivery service with 1-2 business day transit. Ideal for time-sensitive documents and packages.",
    features: ["1-2 business days", "Priority handling", "Express tracking", "Guaranteed delivery"],
    price: "From $15"
  },
  {
    icon: Clock,
    title: "Same Day Delivery",
    description: "Ultra-fast same-day delivery for urgent shipments within the same city. Perfect for emergency situations.",
    features: ["Same day delivery", "Dedicated courier", "Live GPS tracking", "Instant notifications"],
    price: "From $30"
  },
  {
    icon: Shield,
    title: "Freight & Cargo",
    description: "Comprehensive freight solutions for large shipments and commercial cargo. Full truckload and LTL options available.",
    features: ["Full truckload & LTL", "Cargo insurance", "Warehousing options", "Supply chain solutions"],
    price: "Custom Quote"
  },
  {
    icon: Package,
    title: "Package Solutions",
    description: "Specialized packaging and handling solutions for fragile, valuable, or oversized items with extra care.",
    features: ["Custom packaging", "Fragile handling", "Value protection", "Special delivery"],
    price: "From $12"
  },
  {
    icon: Globe,
    title: "International Shipping",
    description: "Global shipping solutions with customs clearance and international tracking. Connect to over 200 countries.",
    features: ["200+ countries", "Customs clearance", "International tracking", "Multi-lingual support"],
    price: "From $60"
  }
];

const additionalServices = [
  {
    title: "Insurance Coverage",
    description: "Comprehensive insurance options for valuable items up to $3,000 coverage."
  },
  {
    title: "Saturday Delivery",
    description: "Available Saturday delivery options for time-critical shipments."
  },
  {
    title: "Warehousing & Storage",
    description: "Secure storage solutions with climate control and 24/7 surveillance."
  },
  {
    title: "Customs Brokerage",
    description: "Full customs clearance services for international shipments."
  },
  {
    title: "Return Management",
    description: "Hassle-free return shipping and reverse logistics solutions."
  },
  {
    title: "Bulk Shipping",
    description: "Discounted rates for high-volume shippers and businesses."
  }
];

export default function Services() {
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
              <Truck className="h-4 w-4 text-accent" />
              Comprehensive Shipping Solutions
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-slide-up">
              Shipping Services
              <span className="text-gradient"> Tailored for You</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              From standard delivery to express freight, we offer comprehensive shipping solutions 
              designed to meet your unique needs with reliability and speed.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  Get Quote
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/auth">
                  Contact Sales
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

      {/* Main Services Grid */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Core Services
            </h2>
            <p className="text-muted-foreground text-lg">
              Choose from our range of shipping services designed for different needs and budgets
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.title}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <service.icon className="h-6 w-6 text-accent" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-accent">{service.price}</span>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/auth">Choose Service</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Additional Services
            </h2>
            <p className="text-muted-foreground text-lg">
              Enhance your shipping experience with our value-added services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalServices.map((service, index) => (
              <Card
                key={service.title}
                className="p-6 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
            <div className="text-center space-y-6">
              <h2 className="text-2xl md:text-3xl font-bold">
                Need a Custom Shipping Solution?
              </h2>
              <p className="text-muted-foreground text-lg">
                Our team can create tailored shipping solutions for your specific requirements. 
                Contact us to discuss your unique shipping needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/auth">
                    Contact Sales Team
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/track">
                    Track Existing Shipment
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
