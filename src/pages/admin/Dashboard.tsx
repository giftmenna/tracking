import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import type { Shipment } from "@/lib/supabase-types";

const stats = [
  {
    title: "Total Shipments",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Package,
    color: "text-info",
    bgColor: "bg-info/10",
  },
  {
    title: "In Transit",
    value: "456",
    change: "+5%",
    trend: "up",
    icon: Truck,
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    title: "Delivered Today",
    value: "89",
    change: "+23%",
    trend: "up",
    icon: CheckCircle2,
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Exceptions",
    value: "12",
    change: "-8%",
    trend: "down",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

const statusVariant = {
  "created": "pending",
  "received_at_origin": "default",
  "in_transit": "transit",
  "out_for_delivery": "transit",
  "delivered": "delivered",
  "exception": "exception",
  "returned": "pending",
  "cancelled": "pending",
} as const;

export default function Dashboard() {
  const [recentShipments, setRecentShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentShipments();
  }, []);

  const fetchRecentShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentShipments(data || []);
    } catch (error) {
      console.error('Error fetching recent shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your shipping operations
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Clock className="h-4 w-4 mr-2" />
            Last 7 days
          </Button>
          <Button variant="accent" asChild>
            <Link to="/admin/shipments/new">
              <Package className="h-4 w-4 mr-2" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card
            key={stat.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <div
                    className={`flex items-center gap-1 text-sm mt-2 ${
                      stat.trend === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    {stat.change} from last week
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Shipments & Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Shipments Table */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Shipments</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/shipments">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">
                      Tracking #
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2 hidden sm:table-cell">
                      Route
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">
                      Status
                    </th>
                    <th className="text-left text-sm font-medium text-muted-foreground py-3 px-2">
                      ETA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Loading recent shipments...</p>
                      </td>
                    </tr>
                  ) : recentShipments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <p className="text-muted-foreground">No shipments found</p>
                      </td>
                    </tr>
                  ) : (
                    recentShipments.map((shipment) => (
                      <tr
                        key={shipment.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-2">
                          <Link
                            to={`/admin/shipments/${shipment.id}`}
                            className="font-medium text-sm hover:text-primary transition-colors"
                          >
                            {shipment.tracking_number}
                          </Link>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground hidden sm:table-cell">
                          {shipment.sender_city} → {shipment.receiver_city}
                        </td>
                        <td className="py-3 px-2">
                          <Badge
                            variant={
                              statusVariant[
                                shipment.status as keyof typeof statusVariant
                              ] || "pending"
                            }
                          >
                            {shipment.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {shipment.estimated_delivery 
                            ? new Date(shipment.estimated_delivery).toLocaleDateString()
                            : 'Not set'
                          }
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/admin/shipments/new">
                <Package className="h-4 w-4 mr-3" />
                Create Shipment
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/admin/scan">
                <Truck className="h-4 w-4 mr-3" />
                Scan Package
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/admin/reports">
                <TrendingUp className="h-4 w-4 mr-3" />
                View Reports
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/admin/drivers">
                <Truck className="h-4 w-4 mr-3" />
                Manage Drivers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
