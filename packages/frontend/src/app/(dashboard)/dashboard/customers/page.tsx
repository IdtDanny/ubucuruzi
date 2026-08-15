'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  companyName: string | null;
  phone: string;
  email: string | null;
  tin: string | null;
  creditLimit: number | null;
  currentBalance: number;
  isActive: boolean;
}

export default function CustomersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchCustomers = useCallback(async (page = 1, searchVal = search) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      if (searchVal) params.append('search', searchVal);
      const res = await api.get(`/customers?${params.toString()}`);
      setCustomers(res.data.data);
      setPagination({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, search]);

  useEffect(() => {
    if (!user) return;
    fetchCustomers();
  }, [user, fetchCustomers]);

  const handleSearch = () => fetchCustomers(1);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchCustomers(newPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const renderPagination = () => {
    const { page, totalPages } = pagination;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handlePageChange(p)}
            className={cn('h-8 w-8 p-0', p === page && 'glass-modern')}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger>
            <Button className="gradient-primary text-white shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-deep border border-white/5">
            <DialogHeader>
              <DialogTitle className="gradient-text">Add New Customer</DialogTitle>
            </DialogHeader>
            <div className="p-4 text-center text-muted-foreground">
              Customer form will be implemented in the next phase.
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, phone, TIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 glass-modern border-white/10 bg-transparent"
          />
        </div>
        <Button onClick={handleSearch} variant="outline" className="glass-modern border-white/10">
          Search
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl glass-deep border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Company</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold text-right">Balance</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.companyName || '-'}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      {customer.currentBalance.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        customer.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      )}>
                        {customer.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="hover:bg-white/10" type="button">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-deep border border-white/5" align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/customers/${customer.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(customer.id)} className="text-red-500">
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-t border-white/5">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            {renderPagination()}
          </div>
        </div>
      </div>
    </div>
  );
}