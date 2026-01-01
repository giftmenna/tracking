import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Printer,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import type { Shipment } from "@/lib/supabase-types";

const statusVariant = {
  created: "pending",
  received_at_origin: "transit",
  in_transit: "transit",
  arrived_at_destination: "transit",
  out_for_delivery: "transit",
  delivered: "delivered",
  exception: "exception",
  returned: "exception",
  cancelled: "exception",
} as const;

export default function Shipments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      console.log('Attempting to fetch shipments...');
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Database error details:', error);
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('row level security') || error.code === '42501') {
          toast({
            variant: "destructive",
            title: "Permission Error",
            description: "Database permissions need to be configured. Please run the latest migration.",
          });
        } else if (error.message.includes('JWT') || error.code === '401') {
          toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "Please log in again to access shipments.",
          });
        } else if (error.message.includes('connection') || error.code === '08006') {
          toast({
            variant: "destructive",
            title: "Connection Error",
            description: "Cannot connect to database. Check your internet connection.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Database Error",
            description: `Error: ${error.message || 'Unknown database error'}`,
          });
        }
        return;
      }
      
      console.log('Successfully fetched shipments:', data?.length || 0, 'items');
      setShipments(data || []);
      
      // Show friendly message if no shipments exist
      if (!data || data.length === 0) {
        toast({
          title: "No Shipments Found",
          description: "There are no shipments in the system yet. Create your first shipment to get started!",
        });
      } else {
        toast({
          title: "Shipments Loaded",
          description: `Successfully loaded ${data.length} shipment(s)`,
        });
      }
    } catch (error: any) {
      console.error('Unexpected error fetching shipments:', error);
      toast({
        variant: "destructive",
        title: "System Error",
        description: `Unexpected error: ${error.message || 'Unknown error occurred'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this shipment?')) return;

    try {
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Shipment deleted",
        description: "The shipment has been deleted successfully",
      });
      
      fetchShipments();
    } catch (error: any) {
      console.error('Error deleting shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete shipment",
      });
    }
  };

  const handlePrintLabel = (shipment: Shipment) => {
    // Create a simple printable label
    const labelContent = `
SWIFTSHIP SHIPPING LABEL
===============================
Tracking Number: ${shipment.tracking_number}
Sender: ${shipment.sender_name}
Phone: ${shipment.sender_phone}
Receiver: ${shipment.receiver_name}
Phone: ${shipment.receiver_phone}
Service: ${shipment.service_level}
Weight: ${shipment.weight} kg
Status: ${shipment.status.replace('_', ' ').toUpperCase()}
Created: ${new Date(shipment.created_at).toLocaleDateString()}
===============================
    `.trim();

    // Create a new window and print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Shipping Label - ${shipment.tracking_number}</title>
            <style>
              body { 
                font-family: monospace; 
                font-size: 12px; 
                padding: 20px; 
                white-space: pre-wrap; 
                line-height: 1.4;
              }
              @media print {
                body { padding: 10px; }
              }
            </style>
          </head>
          <body>${labelContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }

    toast({
      title: "Print Label",
      description: `Printing label for ${shipment.tracking_number}`,
    });
  };

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.receiver_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || shipment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading shipments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Shipments</h1>
          <p className="text-muted-foreground">
            Manage and track all shipments
          </p>
        </div>
        <Button variant="accent" asChild>
          <Link to="/admin/shipments/new">
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tracking #, sender, or receiver..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="received_at_origin">Received at Origin</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="arrived_at_destination">Arrived at Destination</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="exception">Exception</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4">
                    Tracking #
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4 hidden lg:table-cell">
                    Sender
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4 hidden lg:table-cell">
                    Receiver
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4 hidden md:table-cell">
                    Route
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4 hidden sm:table-cell">
                    Service
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground py-4 px-4 hidden sm:table-cell">
                    Created
                  </th>
                  <th className="text-right text-sm font-medium text-muted-foreground py-4 px-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((shipment) => (
                  <tr
                    key={shipment.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        to={`/admin/shipments/${shipment.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <Package className="h-4 w-4 text-muted-foreground" />
                        {shipment.tracking_number}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-sm hidden lg:table-cell">
                      {shipment.sender_name}
                    </td>
                    <td className="py-4 px-4 text-sm hidden lg:table-cell">
                      {shipment.receiver_name}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground hidden md:table-cell">
                      {shipment.sender_city} → {shipment.receiver_city}
                    </td>
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4 text-sm hidden sm:table-cell">
                      {shipment.service_level}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground hidden sm:table-cell">
                      {new Date(shipment.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/shipments/${shipment.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/shipments/${shipment.id}/edit`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handlePrintLabel(shipment)}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Label
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDelete(shipment.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredShipments.length === 0 && (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No shipments found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
