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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Eye,
  Trash2,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Quotation {
  id: string;
  number: string;
  customer: { id: string; name: string };
  total: number;
  status: string;
  issueDate: string;
  validUntil: string;
  createdAt: string;
}

const statusColors = {
  DRAFT: 'bg-gray-500/10 text-gray-500',
  SENT: 'bg-blue-500/10 text-blue-500',
  ACCEPTED: 'bg-green-500/10 text-green-500',
  REJECTED: 'bg-red-500/10 text-red-500',
  EXPIRED: 'bg-amber-500/10 text-amber-500',
};

export default function QuotationsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchQuotations = useCallback(async (page = 1, searchVal = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      if (searchVal) params.append('search', searchVal);
      if (status) params.append('status', status);
      const res = await api.get(`/quotations?${params.toString()}`);
      setQuotations(res.data.data);
      setPagination({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      toast.error('Failed to fetch quotations');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, search, statusFilter]);

  useEffect(() => {
    if (!user) return;
    fetchQuotations();
  }, [user, fetchQuotations]);

  const handleSearch = () => fetchQuotations(1);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchQuotations(newPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quotation?')) return;
    try {
      await api.delete(`/quotations/${id}`);
      toast.success('Quotation deleted');
      fetchQuotations();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading && quotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Quotations</h1>
          <p className="text-muted-foreground">Manage customer quotations</p>
        </div>
        <Button className="gradient-primary text-white shadow-lg shadow-primary/25">
          <Plus className="h-4 w-4 mr-2" /> New Quotation
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by number or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 glass-modern border-white/10 bg-transparent"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(val) => {
            const nextStatus = val ?? '';
            setStatusFilter(nextStatus);
            fetchQuotations(1, search, nextStatus);
          }}
        >
          <SelectTrigger className="w-[150px] glass-modern border-white/10 bg-transparent">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent className="glass-deep border border-white/5">
            <SelectItem value="">All Statuses</SelectItem>
            {Object.keys(statusColors).map(status => (
              <SelectItem key={status} value={status}>{status}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="outline" className="glass-modern border-white/10">
          Search
        </Button>
      </div>

      <div className="rounded-xl glass-deep border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-white/5">
                <TableHead>Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total (RWF)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No quotations found
                  </TableCell>
                </TableRow>
              ) : (
                quotations.map((q) => (
                  <TableRow key={q.id} className="hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono">{q.number}</TableCell>
                    <TableCell>{q.customer.name}</TableCell>
                    <TableCell className="text-right">{q.total.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', statusColors[q.status as keyof typeof statusColors] || 'bg-gray-500/10')}>
                        {q.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(q.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" size="icon" className="hover:bg-white/10">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="glass-deep border border-white/5" align="end">
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/quotations/${q.id}`)}>
                            <Eye className="h-4 w-4 mr-2" /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(q.id)} className="text-red-500">
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">{pagination.page} / {pagination.totalPages}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}