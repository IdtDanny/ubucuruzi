'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Building, FileText, Receipt, Package } from 'lucide-react';
import api from '@/lib/api-client';

interface CustomerDetail {
  id: string;
  name: string;
  companyName?: string;
  phone: string;
  email?: string;
  address?: string;
  tin?: string;
  currentBalance: number;
  invoices: any[];
  quotations: any[];
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    api.get(`/customers/${id}/relations`)
      .then(res => setCustomer(res.data))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{customer.name}</h1>
          {customer.companyName && (
            <p className="text-muted-foreground">{customer.companyName}</p>
          )}
        </div>
        <Badge variant={customer.currentBalance > 0 ? 'destructive' : 'outline'}>
          Balance: RWF {customer.currentBalance.toLocaleString()}
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{customer.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{customer.email || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{customer.address || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">TIN</p>
              <p className="font-medium">{customer.tin || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Documents */}
      <Tabs defaultValue="invoices" className="glass-deep border border-white/5 rounded-xl p-4">
        <TabsList className="bg-transparent border-b border-white/5">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Invoices
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> Quotations
          </TabsTrigger>
          <TabsTrigger value="requisitions" className="flex items-center gap-2">
            <Package className="h-4 w-4" /> Requisitions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="invoices" className="mt-4">
          {customer.invoices.length === 0 ? (
            <p className="text-muted-foreground">No invoices yet.</p>
          ) : (
            <div className="space-y-2">
              {customer.invoices.map((inv) => (
                <div key={inv.id} className="flex justify-between items-center p-3 glass-modern rounded-lg">
                  <div>
                    <p className="font-medium">{inv.number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">RWF {inv.total.toLocaleString()}</span>
                    <Badge variant={inv.status === 'PAID' ? 'default' : 'secondary'}>
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="quotations" className="mt-4">
          {customer.quotations.length === 0 ? (
            <p className="text-muted-foreground">No quotations yet.</p>
          ) : (
            // Similar layout
            <div className="space-y-2">
              {customer.quotations.map((q) => (
                <div key={q.id} className="flex justify-between items-center p-3 glass-modern rounded-lg">
                  <div>
                    <p className="font-medium">{q.number}</p>
                    <p className="text-sm text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold">RWF {q.total.toLocaleString()}</span>
                    <Badge variant={q.status === 'ACCEPTED' ? 'default' : 'secondary'}>
                      {q.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="requisitions" className="mt-4">
          <p className="text-muted-foreground">Requisitions module coming soon.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}