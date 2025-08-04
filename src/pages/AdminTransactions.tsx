import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download,
  Activity,
  CreditCard,
  Users,
  DollarSign,
  Calendar,
  Eye
} from "lucide-react";

interface TransactionData {
  id: string;
  type: 'loan_application' | 'payment_verification' | 'p2p_loan';
  user_name: string;
  user_phone?: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  reference_number?: string;
  payment_method?: string;
  loan_type?: string;
  details: any;
}

export const AdminTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admrstb");
      return;
    }

    const session = JSON.parse(adminSession);
    // Check if session is expired (24 hours)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("adminSession");
      navigate("/admrstb");
      return;
    }

    fetchAllTransactions();
  }, [navigate]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, typeFilter, statusFilter, dateFilter]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch loan applications
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select(`
          *,
          profiles (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (loansError) throw loansError;

      // Fetch payment verifications
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_verifications')
        .select(`
          *,
          profiles (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Fetch P2P loans
      const { data: p2pLoans, error: p2pError } = await supabase
        .from('p2p_loans')
        .select(`
          *,
          lender:profiles!p2p_loans_lender_id_fkey (
            full_name,
            phone_number
          ),
          borrower:profiles!p2p_loans_borrower_id_fkey (
            full_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (p2pError) throw p2pError;

      // Transform data into unified format
      const allTransactions: TransactionData[] = [];

      // Add loan applications
      loans?.forEach((loan: any) => {
        allTransactions.push({
          id: loan.id,
          type: 'loan_application',
          user_name: loan.profiles?.full_name || 'Тодорхойгүй',
          user_phone: loan.profiles?.phone_number,
          amount: loan.amount,
          status: loan.status,
          created_at: loan.created_at,
          updated_at: loan.updated_at,
          loan_type: 'Факт зээл',
          details: loan
        });
      });

      // Add payment verifications
      payments?.forEach((payment: any) => {
        allTransactions.push({
          id: payment.id,
          type: 'payment_verification',
          user_name: payment.profiles?.full_name || 'Тодорхойгүй',
          user_phone: payment.profiles?.phone_number,
          amount: payment.amount,
          status: payment.status,
          created_at: payment.created_at,
          updated_at: payment.updated_at,
          reference_number: payment.reference_number,
          payment_method: payment.payment_method,
          details: payment
        });
      });

      // Add P2P loans
      p2pLoans?.forEach((p2p: any) => {
        allTransactions.push({
          id: p2p.id,
          type: 'p2p_loan',
          user_name: p2p.lender?.full_name || 'Тодорхойгүй',
          user_phone: p2p.lender?.phone_number,
          amount: p2p.amount,
          status: p2p.status,
          created_at: p2p.created_at,
          updated_at: p2p.updated_at,
          loan_type: 'P2P зээл',
          details: p2p
        });
      });

      // Sort by creation date (newest first)
      allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Алдаа",
        description: "Гүйлгээний мэдээлэл татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction => 
        transaction.user_name.toLowerCase().includes(query) ||
        transaction.user_phone?.includes(query) ||
        transaction.reference_number?.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(transaction => 
          new Date(transaction.created_at) >= filterDate
        );
      }
    }

    setFilteredTransactions(filtered);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'loan_application':
        return 'Факт зээл';
      case 'payment_verification':
        return 'Төлбөр';
      case 'p2p_loan':
        return 'P2P зээл';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    const getVariant = () => {
      if (status === 'pending') return "outline";
      if (status === 'approved' || status === 'verified' || status === 'available') return "default";
      if (status === 'rejected') return "destructive";
      return "secondary";
    };

    const getLabel = () => {
      switch (status) {
        case 'pending':
          return 'Хүлээгдэж байна';
        case 'approved':
          return 'Зөвшөөрөгдсөн';
        case 'rejected':
          return 'Татгалзсан';
        case 'verified':
          return 'Баталгаажсан';
        case 'available':
          return 'Боломжтой';
        case 'funded':
          return 'Санхүүжигдсэн';
        case 'completed':
          return 'Дууссан';
        default:
          return status;
      }
    };

    return <Badge variant={getVariant()}>{getLabel()}</Badge>;
  };

  const exportTransactions = () => {
    const csvContent = [
      ['ID', 'Төрөл', 'Хэрэглэгч', 'Утас', 'Дүн', 'Статус', 'Огноо'].join(','),
      ...filteredTransactions.map(t => [
        t.id,
        getTypeLabel(t.type),
        t.user_name,
        t.user_phone || '',
        t.amount,
        t.status,
        new Date(t.created_at).toLocaleDateString('mn-MN')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admrstb1")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Нийт гүйлгээний мэдээлэл</h1>
        <Button onClick={exportTransactions} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Экспорт
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Нийт гүйлгээ</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Activity className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Факт зээл</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.type === 'loan_application').length}
                </p>
              </div>
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Төлбөр</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.type === 'payment_verification').length}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">P2P зээл</p>
                <p className="text-2xl font-bold">
                  {transactions.filter(t => t.type === 'p2p_loan').length}
                </p>
              </div>
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Шүүлтүүр
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Хайлт</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Нэр, утас, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="type">Төрөл</Label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Бүгд</option>
                <option value="loan_application">Факт зээл</option>
                <option value="payment_verification">Төлбөр</option>
                <option value="p2p_loan">P2P зээл</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="status">Статус</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Бүгд</option>
                <option value="pending">Хүлээгдэж байна</option>
                <option value="approved">Зөвшөөрөгдсөн</option>
                <option value="verified">Баталгаажсан</option>
                <option value="rejected">Татгалзсан</option>
                <option value="available">Боломжтой</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="date">Огноо</Label>
              <select
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Бүгд</option>
                <option value="today">Өнөөдөр</option>
                <option value="week">7 хоног</option>
                <option value="month">Сар</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground">
            <span>Нийт: {transactions.length} | Шүүлтийн үр дүн: {filteredTransactions.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Гүйлгээний жагсаалт</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Төрөл</TableHead>
                <TableHead>Хэрэглэгч</TableHead>
                <TableHead>Утас</TableHead>
                <TableHead>Дүн</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Огноо</TableHead>
                <TableHead>Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getTypeLabel(transaction.type)}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.user_name}
                  </TableCell>
                  <TableCell className="font-mono">
                    {transaction.user_phone ? `+976 ${transaction.user_phone}` : '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {transaction.amount.toLocaleString()}₮
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(transaction.status, transaction.type)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.created_at).toLocaleDateString('mn-MN')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // Navigate to appropriate admin page based on type
                        if (transaction.type === 'loan_application') {
                          navigate('/admrstb3');
                        } else if (transaction.type === 'payment_verification') {
                          navigate('/admrstb2');
                        } else {
                          navigate('/admrstb4');
                        }
                      }}
                    >
                      <Eye className="w-3 h-3" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' 
                  ? 'Хайлтын үр дүн олдсонгүй' 
                  : 'Гүйлгээний мэдээлэл олдсонгүй'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};