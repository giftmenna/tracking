import { Link } from "react-router-dom";
import { useState } from "react";
import { 
  Headphones, 
  MessageCircle, 
  Phone, 
  Mail, 
  Clock,
  HelpCircle,
  Search,
  BookOpen,
  FileText,
  Users,
  Zap,
  CheckCircle2,
  Package
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const supportCategories = [
  {
    icon: Package,
    title: "Shipping & Tracking",
    description: "Questions about shipment status, tracking numbers, and delivery times",
    articles: 24,
    color: "text-blue-600"
  },
  {
    icon: FileText,
    title: "Billing & Payments",
    description: "Invoices, payment methods, pricing, and account balance inquiries",
    articles: 18,
    color: "text-green-600"
  },
  {
    icon: Users,
    title: "Account Management",
    description: "Profile settings, user permissions, and account configuration",
    articles: 15,
    color: "text-purple-600"
  },
  {
    icon: HelpCircle,
    title: "Technical Support",
    description: "System issues, API integration, and technical troubleshooting",
    articles: 32,
    color: "text-orange-600"
  }
];

const popularArticles = [
  {
    title: "How to track your shipment",
    category: "Shipping & Tracking",
    views: "15.2k"
  },
  {
    title: "Understanding delivery timeframes",
    category: "Shipping & Tracking", 
    views: "12.8k"
  },
  {
    title: "How to file a claim for damaged items",
    category: "Shipping & Tracking",
    views: "9.4k"
  },
  {
    title: "Payment methods and billing cycles",
    category: "Billing & Payments",
    views: "8.7k"
  },
  {
    title: "Setting up business accounts",
    category: "Account Management",
    views: "7.2k"
  },
  {
    title: "API integration guide",
    category: "Technical Support",
    views: "6.5k"
  }
];

const contactOptions = [
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Get instant help from our support agents",
    contact: "Start Chat",
    hours: "24/7 Available",
    availability: "Online",
    color: "bg-green-100 text-green-800"
  }
];

const faqs = [
  {
    question: "How do I track my shipment?",
    answer: "You can track your shipment by entering your tracking number on our Track page or by logging into your account. You'll receive real-time updates on your shipment's location and estimated delivery time."
  },
  {
    question: "What should I do if my package is delayed?",
    answer: "If your package is delayed, first check the tracking information for any updates. If there are no recent updates, contact our support team with your tracking number, and we'll investigate the delay immediately."
  },
  {
    question: "How do I file a claim for damaged items?",
    answer: "To file a claim for damaged items, contact our support team within 48 hours of delivery. You'll need to provide photos of the damage, the original packaging, and your tracking number. We'll process your claim within 5 business days."
  },
  {
    question: "What are your shipping rates?",
    answer: "Our shipping rates vary based on package weight, dimensions, destination, and service level (Standard, Express, or Same Day). You can get an instant quote on our Ship Now page or contact our sales team for bulk shipping discounts."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we offer international shipping to over 200 countries. Rates and delivery times vary by destination. Contact our international shipping team for custom quotes and documentation requirements."
  },
  {
    question: "How do I change my delivery address?",
    answer: "If your shipment hasn't been dispatched, you can change the delivery address through your account or by contacting support. For shipments already in transit, address changes may incur additional fees and depend on the current location."
  }
];

export default function Support() {
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'assistant', content: 'Hello! I\'m your AI shipping assistant. How can I help you today?' }]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(input);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    }, 1000);
  };

  const generateAIResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('track')) {
      return 'To track your shipment, go to the Track page and enter your tracking number. You can also receive SMS updates.';
    } else if (lowerQuery.includes('ship')) {
      return 'To ship a package, visit our Ship Now page. We offer various services including express delivery.';
    } else if (lowerQuery.includes('cost') || lowerQuery.includes('price')) {
      return 'Shipping costs depend on weight, distance, and service type. Use our quote calculator for accurate pricing.';
    } else if (lowerQuery.includes('delivery') || lowerQuery.includes('time')) {
      return 'Delivery times vary: Standard (3-5 days), Express (1-2 days), Same-day (same day). Check tracking for updates.';
    } else {
      return 'I\'m here to help with shipping questions. Please ask about tracking, shipping, pricing, or delivery times.';
    }
  };
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
              <Headphones className="h-4 w-4 text-accent" />
              24/7 Customer Support
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight animate-slide-up">
              How Can We
              <span className="text-gradient"> Help You?</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "100ms" }}>
              Get instant answers to common questions, track your shipments, or connect with our support team for personalized assistance.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto pt-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-12 h-12 text-lg bg-background/20 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                />
              </div>
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

      {/* Quick Contact Options */}
      <section className="py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Quick Contact Options
            </h2>
            <p className="text-muted-foreground text-lg">
              Get help instantly through your preferred contact method
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {contactOptions.map((option, index) => (
              <Card
                key={option.title}
                className="group p-6 rounded-2xl bg-card border border-border shadow-card hover:shadow-card-hover hover:border-primary/20 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <option.icon className="h-6 w-6 text-accent" />
                    </div>
                    <Badge className={option.color}>
                      {option.availability}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{option.title}</CardTitle>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold">{option.contact}</p>
                    <p className="text-sm text-muted-foreground">{option.hours}</p>
                  </div>
                  <Button className="w-full" variant="accent" onClick={() => setChatOpen(true)}>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Browse Help Categories
            </h2>
            <p className="text-muted-foreground text-lg">
              Find detailed guides and articles organized by topic
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportCategories.map((category, index) => (
              <Link key={category.title} to="/auth" className="block">
                <Card
                  className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                      <category.icon className={`h-6 w-6 ${category.color}`} />
                    </div>
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{category.articles} articles</span>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/auth">
                          Browse →
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Popular Help Articles
              </h2>
              <p className="text-muted-foreground text-lg">
                Frequently accessed guides and solutions
              </p>
            </div>

            <div className="space-y-4">
              {popularArticles.map((article, index) => (
                <Link key={article.title} to="/auth" className="block">
                  <Card
                    className="p-4 hover:bg-muted/50 transition-colors animate-slide-up"
                    style={{ animationDelay: `${index * 25}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{article.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.views} views</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/auth">
                          Read →
                        </Link>
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-lg">
                Quick answers to common questions
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card
                  key={faq.question}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3 flex items-start gap-3">
                      <HelpCircle className="h-5 w-5 text-accent mt-1 flex-shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 md:p-12 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/20">
              <CardContent className="text-center space-y-6">
                <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto">
                  <Headphones className="h-8 w-8 text-accent" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Still Need Help?
                </h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Our dedicated support team is here to help you with any questions or concerns. 
                  Don't hesitate to reach out – we're committed to ensuring your shipping experience is smooth and hassle-free.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button variant="accent" size="lg" asChild>
                    <Link to="/auth">
                      Contact Support Team
                      <MessageCircle className="h-5 w-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/track">
                      Track Your Shipment
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md h-[600px] flex flex-col">
          <DialogHeader>
            <DialogTitle>AI Shipping Assistant</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="flex gap-2 p-4 border-t">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about shipping..."
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
