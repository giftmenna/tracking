import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  DollarSign,
  Save,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import type { PricingRule } from '@/lib/supabase-types';

interface CompanySettings {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface PricingSettings {
  currency: string;
  tax_rate: number;
  insurance_rate: number;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const [company, setCompany] = useState<CompanySettings>({
    name: 'SwiftShip',
    phone: '',
    email: '',
    address: '',
  });

  const [pricing, setPricing] = useState<PricingSettings>({
    currency: 'USD',
    tax_rate: 7.5,
    insurance_rate: 2,
  });

  const [ruleForm, setRuleForm] = useState({
    name: '',
    origin_zone: '',
    destination_zone: '',
    base_price: '',
    price_per_kg: '',
    express_multiplier: '1.5',
    same_day_multiplier: '2.0',
  });

  useEffect(() => {
    fetchSettings();
    fetchPricingRules();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;

      data?.forEach((setting) => {
        if (setting.key === 'company') {
          setCompany(setting.value as unknown as CompanySettings);
        } else if (setting.key === 'pricing') {
          setPricing(setting.value as unknown as PricingSettings);
        }
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPricingRules = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_rules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPricingRules(data || []);
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
    }
  };

  const saveCompanySettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: company as any })
        .eq('key', 'company');

      if (error) throw error;
      toast({ title: 'Company settings saved' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const savePricingSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('settings')
        .update({ value: pricing as any })
        .eq('key', 'pricing');

      if (error) throw error;
      toast({ title: 'Pricing settings saved' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      name: ruleForm.name,
      origin_zone: ruleForm.origin_zone || null,
      destination_zone: ruleForm.destination_zone || null,
      base_price: parseFloat(ruleForm.base_price) || 0,
      price_per_kg: parseFloat(ruleForm.price_per_kg) || 0,
      express_multiplier: parseFloat(ruleForm.express_multiplier) || 1.5,
      same_day_multiplier: parseFloat(ruleForm.same_day_multiplier) || 2.0,
    };

    try {
      if (editingRule) {
        const { error } = await supabase
          .from('pricing_rules')
          .update(submitData)
          .eq('id', editingRule.id);

        if (error) throw error;
        toast({ title: 'Pricing rule updated' });
      } else {
        const { error } = await supabase
          .from('pricing_rules')
          .insert([submitData]);

        if (error) throw error;
        toast({ title: 'Pricing rule created' });
      }

      setIsPricingDialogOpen(false);
      resetRuleForm();
      fetchPricingRules();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const deleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;

    try {
      const { error } = await supabase.from('pricing_rules').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Pricing rule deleted' });
      fetchPricingRules();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    }
  };

  const resetRuleForm = () => {
    setRuleForm({
      name: '',
      origin_zone: '',
      destination_zone: '',
      base_price: '',
      price_per_kg: '',
      express_multiplier: '1.5',
      same_day_multiplier: '2.0',
    });
    setEditingRule(null);
  };

  const openEditRuleDialog = (rule: PricingRule) => {
    setEditingRule(rule);
    setRuleForm({
      name: rule.name,
      origin_zone: rule.origin_zone || '',
      destination_zone: rule.destination_zone || '',
      base_price: rule.base_price.toString(),
      price_per_kg: rule.price_per_kg.toString(),
      express_multiplier: rule.express_multiplier.toString(),
      same_day_multiplier: rule.same_day_multiplier.toString(),
    });
    setIsPricingDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-center py-12 text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Company Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              Company Information
            </CardTitle>
            <CardDescription>
              Your company details displayed on labels and communications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  value={company.phone}
                  onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  value={company.email}
                  onChange={(e) => setCompany({ ...company, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Address</Label>
                <Input
                  id="companyAddress"
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={saveCompanySettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Company Info
            </Button>
          </CardContent>
        </Card>

        {/* Pricing Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" />
              Pricing Configuration
            </CardTitle>
            <CardDescription>
              General pricing settings like currency and tax rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={pricing.currency}
                  onChange={(e) => setPricing({ ...pricing, currency: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.1"
                  value={pricing.tax_rate}
                  onChange={(e) => setPricing({ ...pricing, tax_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
                <Input
                  id="insuranceRate"
                  type="number"
                  step="0.1"
                  value={pricing.insurance_rate}
                  onChange={(e) => setPricing({ ...pricing, insurance_rate: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button onClick={savePricingSettings} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save Pricing Config
            </Button>
          </CardContent>
        </Card>

        {/* Pricing Rules */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5 text-accent" />
                Pricing Rules
              </CardTitle>
              <CardDescription>
                Define pricing based on zones, weight, and service levels
              </CardDescription>
            </div>
            <Button
              variant="accent"
              onClick={() => {
                resetRuleForm();
                setIsPricingDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin Zone</TableHead>
                  <TableHead>Destination Zone</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Per KG</TableHead>
                  <TableHead>Express (×)</TableHead>
                  <TableHead>Same Day (×)</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.origin_zone || 'All'}</TableCell>
                    <TableCell>{rule.destination_zone || 'All'}</TableCell>
                    <TableCell>${rule.base_price.toLocaleString()}</TableCell>
                    <TableCell>${rule.price_per_kg.toLocaleString()}</TableCell>
                    <TableCell>{rule.express_multiplier}×</TableCell>
                    <TableCell>{rule.same_day_multiplier}×</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditRuleDialog(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Rule Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRule ? 'Edit Pricing Rule' : 'Add Pricing Rule'}
            </DialogTitle>
            <DialogDescription>
              Define pricing for specific zones and service levels
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRuleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ruleName">Rule Name *</Label>
                <Input
                  id="ruleName"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })}
                  placeholder="e.g., San Francisco to Tokyo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originZone">Origin Zone</Label>
                <Input
                  id="originZone"
                  value={ruleForm.origin_zone}
                  onChange={(e) => setRuleForm({ ...ruleForm, origin_zone: e.target.value })}
                  placeholder="e.g., West Coast USA (leave empty for all)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destZone">Destination Zone</Label>
                <Input
                  id="destZone"
                  value={ruleForm.destination_zone}
                  onChange={(e) => setRuleForm({ ...ruleForm, destination_zone: e.target.value })}
                  placeholder="e.g., Asia Pacific (leave empty for all)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price ($) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={ruleForm.base_price}
                  onChange={(e) => setRuleForm({ ...ruleForm, base_price: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerKg">Price per KG ($) *</Label>
                <Input
                  id="pricePerKg"
                  type="number"
                  value={ruleForm.price_per_kg}
                  onChange={(e) => setRuleForm({ ...ruleForm, price_per_kg: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expressMult">Express Multiplier</Label>
                <Input
                  id="expressMult"
                  type="number"
                  step="0.1"
                  value={ruleForm.express_multiplier}
                  onChange={(e) => setRuleForm({ ...ruleForm, express_multiplier: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sameDayMult">Same Day Multiplier</Label>
                <Input
                  id="sameDayMult"
                  type="number"
                  step="0.1"
                  value={ruleForm.same_day_multiplier}
                  onChange={(e) => setRuleForm({ ...ruleForm, same_day_multiplier: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPricingDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="accent">
                {editingRule ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
