'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Edit,
  Eye,
  Trash2,
  Package,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api-client';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  costPrice: number;
  category?: { id: string; name: string };
  warehouseStocks: { quantity: number }[];
  isActive: boolean;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchProducts = useCallback(async (page = 1, searchVal = search, cat = categoryFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', pagination.limit.toString());
      if (searchVal) params.append('search', searchVal);
      if (cat) params.append('categoryId', cat);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data);
      setPagination({
        page: res.data.page,
        limit: res.data.limit,
        total: res.data.total,
        totalPages: res.data.totalPages,
      });
    } catch (err) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, search, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories/select');
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    fetchCategories();
  }, [user, fetchProducts]);

  const handleSearch = () => fetchProducts(1);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchProducts(newPage);
    }
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const res = await api.get(`/products/export/${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format === 'csv' ? 'csv' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Export failed');
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/products/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(`Imported ${res.data.imported} products`);
      fetchProducts();
      setIsImportModalOpen(false);
    } catch (err) {
      toast.error('Import failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
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

  if (loading && products.length === 0) {
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
          <h1 className="text-2xl font-bold gradient-text">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4 mr-2" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-deep border border-white/5">
              <DialogHeader>
                <DialogTitle className="gradient-text">Add New Product</DialogTitle>
              </DialogHeader>
              <div className="p-4 text-center text-muted-foreground">
                Product form will be implemented in the next phase.
              </div>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="glass-modern border-white/10">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass-deep border border-white/5">
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileText className="h-4 w-4 mr-2" /> CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="glass-modern border-white/10">
                <Upload className="h-4 w-4 mr-2" /> Import
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-deep border border-white/5">
              <DialogHeader>
                <DialogTitle className="gradient-text">Import Products</DialogTitle>
              </DialogHeader>
              <div className="border-2 border-dashed rounded-lg p-8 text-center border-white/10">
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                  }}
                  className="hidden"
                  id="import-file"
                />
                <label htmlFor="import-file" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Drop CSV or Excel file here</p>
                  <p className="text-xs text-muted-foreground">Or click to browse</p>
                </label>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 glass-modern border-white/10 bg-transparent"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); fetchProducts(1); }}>
          <SelectTrigger className="w-[180px] glass-modern border-white/10 bg-transparent">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent className="glass-deep border border-white/5">
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                <TableHead className="font-semibold">SKU</TableHead>
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold text-right">Price (RWF)</TableHead>
                <TableHead className="font-semibold text-right">Stock</TableHead>
                <TableHead className="font-semibold text-center">Status</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const totalStock = product.warehouseStocks.reduce((s, ws) => s + ws.quantity, 0);
                  const isLowStock = totalStock <= 5;
                  return (
                    <TableRow key={product.id} className="hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category?.name || '-'}</TableCell>
                      <TableCell className="text-right">{product.unitPrice.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          totalStock <= 0 ? 'bg-red-500/10 text-red-500' :
                          totalStock <= 5 ? 'bg-amber-500/10 text-amber-500' :
                          'bg-green-500/10 text-green-500'
                        )}>
                          {totalStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-xs font-medium',
                          product.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                        )}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-deep border border-white/5" align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
                              <Eye className="h-4 w-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-500">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination */}
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

// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuth } from '@/contexts/auth-context';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import {
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   Plus,
//   Upload,
//   Download,
//   FileSpreadsheet,
//   FileText,
//   MoreHorizontal,
//   Edit,
//   Eye,
//   Trash2,
//   Package,
// } from 'lucide-react';
// import { toast } from 'sonner';
// import api from '@/lib/api-client';

// interface Product {
//   id: string;
//   sku: string;
//   name: string;
//   description?: string;
//   unitPrice: number;
//   costPrice: number;
//   category?: { id: string; name: string };
//   warehouseStocks: { quantity: number }[];
//   isActive: boolean;
// }

// export default function ProductsPage() {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');
//   const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
//   const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
//   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);

//   const fetchProducts = useCallback(async (page = 1, searchVal = search, cat = categoryFilter) => {
//     setLoading(true);
//     try {
//       const params = new URLSearchParams();
//       params.append('page', page.toString());
//       params.append('limit', pagination.limit.toString());
//       if (searchVal) params.append('search', searchVal);
//       if (cat) params.append('categoryId', cat);
//       const res = await api.get(`/products?${params.toString()}`);
//       setProducts(res.data.data);
//       setPagination({
//         page: res.data.page,
//         limit: res.data.limit,
//         total: res.data.total,
//         totalPages: res.data.totalPages,
//       });
//     } catch (err) {
//       toast.error('Failed to fetch products');
//     } finally {
//       setLoading(false);
//     }
//   }, [pagination.limit, search, categoryFilter]);

//   const fetchCategories = async () => {
//     try {
//       const res = await api.get('/categories/select');
//       setCategories(res.data);
//     } catch (err) {
//       console.error('Failed to fetch categories');
//     }
//   };

//   useEffect(() => {
//     if (!user) return;
//     fetchProducts();
//     fetchCategories();
//   }, [user, fetchProducts]);

//   const handleSearch = () => fetchProducts(1);

//   const handlePageChange = (newPage: number) => fetchProducts(newPage);

//   const handleExport = async (format: 'csv' | 'excel') => {
//     try {
//       const res = await api.get(`/products/export/${format}`, { responseType: 'blob' });
//       const url = window.URL.createObjectURL(new Blob([res.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `products.${format === 'csv' ? 'csv' : 'xlsx'}`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       toast.error('Export failed');
//     }
//   };

//   const handleImport = async (file: File) => {
//     const formData = new FormData();
//     formData.append('file', file);
//     try {
//       const res = await api.post('/products/import', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       toast.success(`Imported ${res.data.imported} products`);
//       fetchProducts();
//       setIsImportModalOpen(false);
//     } catch (err) {
//       toast.error('Import failed');
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Delete this product?')) return;
//     try {
//       await api.delete(`/products/${id}`);
//       toast.success('Product deleted');
//       fetchProducts();
//     } catch (err) {
//       toast.error('Failed to delete');
//     }
//   };

//   if (loading && products.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-wrap items-center justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-bold gradient-text">Products</h1>
//           <p className="text-muted-foreground">Manage your product catalog</p>
//         </div>
//         <div className="flex flex-wrap gap-2">
//           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//             <DialogTrigger asChild>
//               <Button>
//                 <Plus className="h-4 w-4 mr-2" /> Add Product
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Add New Product</DialogTitle>
//               </DialogHeader>
//               {/* Add product form – we'll keep simple for now */}
//               <p className="text-muted-foreground text-sm">Product form will go here</p>
//             </DialogContent>
//           </Dialog>

//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline">
//                 <Download className="h-4 w-4 mr-2" /> Export
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={() => handleExport('csv')}>
//                 <FileText className="h-4 w-4 mr-2" /> CSV
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={() => handleExport('excel')}>
//                 <FileSpreadsheet className="h-4 w-4 mr-2" /> Excel
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>

//           <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline">
//                 <Upload className="h-4 w-4 mr-2" /> Import
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Import Products</DialogTitle>
//               </DialogHeader>
//               <div className="border-2 border-dashed rounded-lg p-8 text-center">
//                 <input
//                   type="file"
//                   accept=".csv,.xlsx"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (file) handleImport(file);
//                   }}
//                   className="hidden"
//                   id="import-file"
//                 />
//                 <label htmlFor="import-file" className="cursor-pointer block">
//                   <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
//                   <p className="mt-2 text-sm font-medium">Drop CSV or Excel file here</p>
//                   <p className="text-xs text-muted-foreground">Or click to browse</p>
//                 </label>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Search & Filter */}
//       <div className="flex flex-wrap gap-4 items-center">
//         <div className="flex-1 min-w-[200px] relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//           <Input
//             placeholder="Search by name, SKU, barcode..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
//             className="pl-10"
//           />
//         </div>
//         <Select value={categoryFilter} onValueChange={(val) => { setCategoryFilter(val); fetchProducts(1); }}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="All Categories" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="">All Categories</SelectItem>
//             {categories.map(cat => (
//               <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//         <Button onClick={handleSearch} variant="outline">Search</Button>
//       </div>

//       {/* Table */}
//       <div className="rounded-xl glass-deep border border-white/5 overflow-hidden">
//         <div className="overflow-x-auto">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>SKU</TableHead>
//                 <TableHead>Name</TableHead>
//                 <TableHead>Category</TableHead>
//                 <TableHead className="text-right">Price (RWF)</TableHead>
//                 <TableHead className="text-right">Stock</TableHead>
//                 <TableHead className="text-right">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {products.length === 0 ? (
//                 <TableRow>
//                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
//                     No products found
//                   </TableCell>
//                 </TableRow>
//               ) : (
//                 products.map((product) => {
//                   const totalStock = product.warehouseStocks.reduce((s, ws) => s + ws.quantity, 0);
//                   return (
//                     <TableRow key={product.id}>
//                       <TableCell className="font-mono text-sm">{product.sku}</TableCell>
//                       <TableCell className="font-medium">{product.name}</TableCell>
//                       <TableCell>{product.category?.name || '-'}</TableCell>
//                       <TableCell className="text-right">{product.unitPrice.toLocaleString()}</TableCell>
//                       <TableCell className="text-right">
//                         <span className={totalStock <= 0 ? 'text-red-500 font-medium' : ''}>
//                           {totalStock}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <DropdownMenu>
//                           <DropdownMenuTrigger asChild>
//                             <Button variant="ghost" size="icon">
//                               <MoreHorizontal className="h-4 w-4" />
//                             </Button>
//                           </DropdownMenuTrigger>
//                           <DropdownMenuContent align="end">
//                             <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}`)}>
//                               <Eye className="h-4 w-4 mr-2" /> View
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}>
//                               <Edit className="h-4 w-4 mr-2" /> Edit
//                             </DropdownMenuItem>
//                             <DropdownMenuItem onClick={() => handleDelete(product.id)} className="text-red-500">
//                               <Trash2 className="h-4 w-4 mr-2" /> Delete
//                             </DropdownMenuItem>
//                           </DropdownMenuContent>
//                         </DropdownMenu>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               )}
//             </TableBody>
//           </Table>
//         </div>
//         {/* Pagination */}
//         {pagination.totalPages > 1 && (
//           <div className="flex items-center justify-between p-4 border-t border-white/5">
//             <p className="text-sm text-muted-foreground">
//               Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
//               {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
//             </p>
//             <div className="flex gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={pagination.page <= 1}
//                 onClick={() => handlePageChange(pagination.page - 1)}
//               >
//                 <ChevronLeft className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 disabled={pagination.page >= pagination.totalPages}
//                 onClick={() => handlePageChange(pagination.page + 1)}
//               >
//                 <ChevronRight className="h-4 w-4" />
//               </Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }