import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { statusLabels, type ShipmentStatus } from '@/lib/supabase-types';

interface Stats {
  total: number;
  delivered: number;
  inTransit: number;
  exceptions: number;
  todayCreated: number;
  todayDelivered: number;
}

interface StatusCount {
  status: ShipmentStatus;
  count: number;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [stats, setStats] = useState<Stats>({
    total: 0,
    delivered: 0,
    inTransit: 0,
    exceptions: 0,
    todayCreated: 0,
    todayDelivered: 0,
  });
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);

  useEffect(() => {
    fetchReportData();
  }, [period]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(period));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch all shipments in period
      const { data: shipments, error } = await supabase
        .from('shipments')
        .select('status, created_at, delivered_at')
        .gte('created_at', daysAgo.toISOString());

      if (error) throw error;

      const total = shipments?.length || 0;
      const delivered = shipments?.filter((s) => s.status === 'delivered').length || 0;
      const inTransit = shipments?.filter((s) => 
        ['in_transit', 'out_for_delivery', 'arrived_at_destination'].includes(s.status)
      ).length || 0;
      const exceptions = shipments?.filter((s) => 
        ['exception', 'returned', 'cancelled'].includes(s.status)
      ).length || 0;

      const todayCreated = shipments?.filter((s) => 
        new Date(s.created_at) >= today
      ).length || 0;

      const todayDelivered = shipments?.filter((s) => 
        s.delivered_at && new Date(s.delivered_at) >= today
      ).length || 0;

      setStats({
        total,
        delivered,
        inTransit,
        exceptions,
        todayCreated,
        todayDelivered,
      });

      // Count by status
      const counts: Record<string, number> = {};
      shipments?.forEach((s) => {
        counts[s.status] = (counts[s.status] || 0) + 1;
      });

      setStatusCounts(
        Object.entries(counts).map(([status, count]) => ({
          status: status as ShipmentStatus,
          count,
        }))
      );
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const deliveryRate = stats.total > 0 
    ? Math.round((stats.delivered / stats.total) * 100) 
    : 0;

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">Analytics and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-12 text-muted-foreground">Loading reports...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Shipments</p>
                    <p className="text-3xl font-bold">{stats.total}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      +{stats.todayCreated} today
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-info/10">
                    <Package className="h-6 w-6 text-info" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">In Transit</p>
                    <p className="text-3xl font-bold">{stats.inTransit}</p>
                    <p className="text-sm text-accent mt-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Active deliveries
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-accent/10">
                    <Truck className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Delivered</p>
                    <p className="text-3xl font-bold">{stats.delivered}</p>
                    <p className="text-sm text-success mt-1 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {deliveryRate}% success rate
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-success/10">
                    <CheckCircle2 className="h-6 w-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Exceptions</p>
                    <p className="text-3xl font-bold">{stats.exceptions}</p>
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <TrendingDown className="h-4 w-4" />
                      Requires attention
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-destructive/10">
                    <AlertTriangle className="h-6 w-6 text-destructive" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-accent" />
                  Status Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusCounts.map(({ status, count }) => {
                    const percentage = stats.total > 0 
                      ? Math.round((count / stats.total) * 100) 
                      : 0;
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{statusLabels[status]}</span>
                          <span className="font-medium">{count} ({percentage}%)</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Today's Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-accent" />
                      <span>Shipments Created</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.todayCreated}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span>Deliveries Completed</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.todayDelivered}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-info" />
                      <span>Currently In Transit</span>
                    </div>
                    <span className="text-2xl font-bold">{stats.inTransit}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
