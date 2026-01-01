import { Link } from "react-router-dom";
import { 
  Package, 
  Truck, 
  Clock, 
  Shield, 
  Globe, 
  Zap,
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { TrackingSearch } from "@/components/TrackingSearch";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function Index() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Truck,
      title: t('home.features.realTimeTracking.title'),
      description: t('home.features.realTimeTracking.description'),
    },
    {
      icon: Clock,
      title: t('home.features.expressDelivery.title'),
      description: t('home.features.expressDelivery.description'),
    },
    {
      icon: Shield,
      title: t('home.features.secureHandling.title'),
      description: t('home.features.secureHandling.description'),
    },
    {
      icon: Globe,
      title: t('home.features.nationwideCoverage.title'),
      description: t('home.features.nationwideCoverage.description'),
    },
    {
      icon: Zap,
      title: t('home.features.instantNotifications.title'),
      description: t('home.features.instantNotifications.description'),
    },
    {
      icon: Package,
      title: t('home.features.proofOfDelivery.title'),
      description: t('home.features.proofOfDelivery.description'),
    },
  ];

  const stats = [
    { value: "10M+", label: t('home.stats.packages') },
    { value: "500+", label: t('home.stats.locations') },
    { value: "99.9%", label: t('home.stats.onTime') },
    { value: "24/7", label: t('home.stats.support') },
  ];
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
              <Zap className="h-4 w-4 text-accent" />
              {t('home.hero.badge')}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-slide-up">
              {t('home.hero.title')}
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              {t('home.hero.description')}
            </p>

            <div className="animate-slide-up" style={{ animationDelay: "200ms" }}>
              <TrackingSearch />
            </div>

            <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">
                  {t('home.hero.shipNow')}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/services">
                  {t('home.hero.learnMore')}
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

      {/* Stats Section */}
      <section className="py-12 border-b border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={stat.label} 
                className="text-center animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-extrabold text-gradient">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('home.features.description')}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="max-w-4xl mx-auto bg-card rounded-3xl p-8 md:p-12 shadow-xl border border-border">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  {t('home.cta.title')}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {t('home.cta.description')}
                </p>
                <ul className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    {t('home.cta.noHiddenFees')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    {t('home.cta.freeTracking')}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    {t('home.cta.insuranceIncluded')}
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="accent" size="lg" asChild>
                  <Link to="/auth">
                    {t('home.cta.getStarted')}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/support">
                    {t('home.cta.contactSales')}
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
