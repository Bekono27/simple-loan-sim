import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Eye, Search, Copy, User, Phone, CreditCard, Calendar, Hash, ArrowLeft } from "lucide-react";

interface PaymentVerification {
  id: string;
  user_id: string;
  loan_application_id?: string;
  payment_method: string;
  reference_number: string;
  amount: number;
  status: string;
  payment_date: string;
  admin_notes?: string;
  created_at: string;
  profiles?: {
    full_name?: string;
    phone_number?: string;
    register_number?: string;
    email?: string;
  } | null;
}

export const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchQuery, statusFilter]);

  const fetchPayments = async () => {
    try {
      // First fetch payment verifications
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (paymentsError) throw paymentsError;

      // Then fetch user profiles separately and merge
      const enrichedPayments = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_number, register_number, email')
            .eq('user_id', payment.user_id)
            .maybeSingle();

          return {
            ...payment,
            profiles: profile
          };
        })
      );

      setPayments(enrichedPayments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast({
        title: "Алдаа",
        description: "Төлбөрийн мэдээлэл татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    // Filter by search query (reference number, user name, phone)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.reference_number.toLowerCase().includes(query) ||
        payment.profiles?.full_name?.toLowerCase().includes(query) ||
        payment.profiles?.phone_number?.includes(query) ||
        payment.profiles?.register_number?.includes(query)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Хуулагдлаа",
      description: "Буферт хадгалагдлаа"
    });
  };

  const updatePaymentStatus = async (paymentId: string, status: 'verified' | 'rejected', notes: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Update payment verification status
      const { error: paymentError } = await supabase
        .from('payment_verifications')
        .update({
          status,
          admin_notes: notes,
          verified_by: user?.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (paymentError) throw paymentError;

      // If payment is verified, also update the loan application status
      if (status === 'verified') {
        const payment = payments.find(p => p.id === paymentId);
        if (payment?.loan_application_id) {
          const { error: loanError } = await supabase
            .from('loan_applications')
            .update({
              payment_status: 'paid',
              status: 'payment_verified'
            })
            .eq('id', payment.loan_application_id);

          if (loanError) {
            console.error('Error updating loan application:', loanError);
          }
        }
      } else if (status === 'rejected') {
        // If payment is rejected, update loan application to rejected
        const payment = payments.find(p => p.id === paymentId);
        if (payment?.loan_application_id) {
          const { error: loanError } = await supabase
            .from('loan_applications')
            .update({
              payment_status: 'rejected',
              status: 'payment_rejected'
            })
            .eq('id', payment.loan_application_id);

          if (loanError) {
            console.error('Error updating loan application:', loanError);
          }
        }
      }

      toast({
        title: "Амжилттай",
        description: `Төлбөр ${status === 'verified' ? 'баталгаажлаа' : 'татгалзлаа'}`
      });

      fetchPayments();
      setSelectedPayment(null);
      setAdminNotes("");
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Алдаа",
        description: "Төлбөрийн статус шинэчлэхэд алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Хүлээгдэж байна</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Баталгаажсан</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Татгалзсан</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
        <h1 className="text-3xl font-bold">Төлбөрийн баталгаажуулалт</h1>
        <div className="flex gap-3">
          <Button onClick={fetchPayments} variant="outline">
            Шинэчлэх
          </Button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Хайлт ба шүүлтүүр
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="search">Лавлах дугаар / Хэрэглэгчийн нэр / Утас</Label>
              <Input
                id="search"
                placeholder="FL12345678ABCD эсвэл хэрэглэгчийн нэр..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="status">Төлбөрийн төлөв</Label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Бүгд</option>
                <option value="pending">Хүлээгдэж байна</option>
                <option value="verified">Баталгаажсан</option>
                <option value="rejected">Татгалзсан</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span>Нийт: {payments.length}</span>
            <span>Шүүлтийн үр дүн: {filteredPayments.length}</span>
            <span>Хүлээгдэж байна: {payments.filter(p => p.status === 'pending').length}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">#{payment.reference_number}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(payment.reference_number)}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                {getStatusBadge(payment.status)}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  {payment.profiles?.full_name || 'Тодорхойгүй хэрэглэгч'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(payment.created_at).toLocaleDateString('mn-MN')} {new Date(payment.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Төлбөрийн арга:</span>
                  <span className="text-muted-foreground">{payment.payment_method}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Дүн:</span>
                  <span className="text-muted-foreground font-semibold">{payment.amount.toLocaleString()}₮</span>
                </div>
                {payment.profiles?.phone_number && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Утас:</span>
                    <span className="text-muted-foreground">+976 {payment.profiles.phone_number}</span>
                  </div>
                )}
              </div>
              
              {payment.admin_notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Админы тэмдэглэл:</p>
                  <p className="text-xs text-muted-foreground">{payment.admin_notes}</p>
                </div>
              )}

              {payment.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedPayment(payment);
                      setAdminNotes(payment.admin_notes || "");
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Шалгах
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchQuery || statusFilter !== 'all' ? 'Хайлтын үр дүн олдсонгүй' : 'Төлбөрийн мэдээлэл олдсонгүй'}
          </p>
        </div>
      )}

      {/* Payment Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Төлбөр шалгах - #{selectedPayment.reference_number}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedPayment.reference_number)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Лавлах дугаар хуулах
                </Button>
                {getStatusBadge(selectedPayment.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User Information Section */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Хэрэглэгчийн мэдээлэл
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground">Овог нэр:</span>
                      <span className="text-right font-medium">
                        {selectedPayment.profiles?.full_name || 'Тодорхойгүй'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground">И-мэйл:</span>
                      <span className="text-right">
                        {selectedPayment.profiles?.email || 'Бүртгэгдээгүй'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        Утасны дугаар:
                      </span>
                      <span className="text-right font-mono">
                        {selectedPayment.profiles?.phone_number 
                          ? `+976 ${selectedPayment.profiles.phone_number}` 
                          : 'Бүртгэгдээгүй'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground">Регистрийн дугаар:</span>
                      <span className="text-right font-mono">
                        {selectedPayment.profiles?.register_number || 'Бүртгэгдээгүй'}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground">Хэрэглэгчийн ID:</span>
                      <span className="text-right font-mono text-xs">
                        {selectedPayment.user_id}
                      </span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="font-medium text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Бүртгүүлсэн:
                      </span>
                      <span className="text-right text-xs">
                        Системийн мэдээлэл
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Contact Verification */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h5 className="font-medium text-yellow-800 mb-2">Холбогдох мэдээлэл</h5>
                  <div className="space-y-1 text-xs text-yellow-700">
                    {selectedPayment.profiles?.phone_number && (
                      <p>✓ Утас: +976 {selectedPayment.profiles.phone_number}</p>
                    )}
                    {selectedPayment.profiles?.email && (
                      <p>✓ И-мэйл: {selectedPayment.profiles.email}</p>
                    )}
                    {(!selectedPayment.profiles?.phone_number && !selectedPayment.profiles?.email) && (
                      <p>⚠️ Холбогдох мэдээлэл дутуу байна</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bank Account Information */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium mb-4 flex items-center gap-2 text-blue-900">
                  <Hash className="w-4 h-4" />
                  Банкны данстай тулгах мэдээлэл
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Хүлээн авагчийн данс:</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-800">Факт Зээл</Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>IBAN дугаар:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded">MN24001500 2015180476</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard("MN24001500 2015180476")}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Данс эзэмшигч:</span>
                        <span className="font-medium">Byektas Syerikbyek</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Банк:</span>
                        <span>Хаан банк</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Тулгах мэдээлэл:</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Лавлах дугаар:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded font-semibold text-primary">
                            {selectedPayment.reference_number}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(selectedPayment.reference_number)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Төлөх ёстой дүн:</span>
                        <span className="font-semibold text-lg">{selectedPayment.amount.toLocaleString()}₮</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Төлбөрийн арга:</span>
                        <span className="capitalize">{selectedPayment.payment_method}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                    <h5 className="font-medium text-amber-800 mb-2 flex items-center gap-1">
                      <Search className="w-4 h-4" />
                      Банкны системд шалгах алхам:
                    </h5>
                    <ol className="text-xs text-amber-700 space-y-1 list-decimal list-inside">
                      <li>Банкны системд нэвтэрч орох</li>
                      <li>Лавлах дугаар <strong>{selectedPayment.reference_number}</strong> гэж хайх</li>
                      <li>Дансны дугаар <strong>MN24001500 2015180476</strong> тулгах</li>
                      <li>Гүйлгээний дүн <strong>{selectedPayment.amount.toLocaleString()}₮</strong> тулгах</li>
                      <li>Хэрэглэгчийн мэдээлэл тохирч байвал ЗӨВШӨӨРӨХ</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Payment Transaction Details */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium mb-3 flex items-center gap-2 text-green-900">
                  <CreditCard className="w-4 h-4" />
                  Гүйлгээний дэлгэрэнгүй
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Төлбөрийн арга:</span>
                      <span className="font-medium capitalize">{selectedPayment.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Гүйлгээний дүн:</span>
                      <span className="font-semibold text-lg text-green-700">{selectedPayment.amount.toLocaleString()}₮</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Төлсөн огноо:</span>
                      <span>{new Date(selectedPayment.payment_date).toLocaleDateString('mn-MN')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Хүсэлт гаргасан:</span>
                      <span>{new Date(selectedPayment.created_at).toLocaleDateString('mn-MN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Цаг:</span>
                      <span>{new Date(selectedPayment.created_at).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Статус:</span>
                      <div>{getStatusBadge(selectedPayment.status)}</div>
                    </div>
                  </div>
                </div>
                
                {/* Transaction Summary */}
                <div className="mt-4 p-3 bg-white border rounded">
                  <h5 className="font-medium mb-2">Гүйлгээний хураангуй:</h5>
                  <div className="text-xs space-y-1">
                    <p><strong>Төлбөр хүлээн авагч:</strong> Факт Зээл системийн шинжилгээний төлбөр</p>
                    <p><strong>Зориулалт:</strong> Зээлийн боломжийн шинжилгээний төлбөр - {selectedPayment.amount.toLocaleString()}₮</p>
                    <p><strong>Лавлах:</strong> {selectedPayment.reference_number}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Админы тэмдэглэл:</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Тэмдэглэл бичих..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedPayment(null);
                    setAdminNotes("");
                  }}
                >
                  Цуцлах
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updatePaymentStatus(selectedPayment.id, 'rejected', adminNotes)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Татгалзах
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => updatePaymentStatus(selectedPayment.id, 'verified', adminNotes)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Баталгаажуулах
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};