'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Building } from 'lucide-react';
import api from '@/lib/api-client';

interface SupplierDetail {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  tin?: string;
  currentBalance: number;
  isActive: boolean;
}

export default function SupplierDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [supplier, setSupplier] = useState<SupplierDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;
    api.get(`/suppliers/${id}`)
      .then(res => setSupplier(res.data))
      .finally(() => setLoading(false));
  }, [user, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!supplier) {
    return <div>Supplier not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">{supplier.name}</h1>
          <p className="text-muted-foreground">Supplier details</p>
        </div>
        <Badge variant={supplier.isActive ? 'default' : 'destructive'}>
          {supplier.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Phone className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{supplier.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{supplier.email || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{supplier.address || '-'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-deep border border-white/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Building className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">TIN</p>
              <p className="font-medium">{supplier.tin || '-'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}