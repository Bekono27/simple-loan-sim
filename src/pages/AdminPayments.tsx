import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";

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
}

export const AdminPayments = () => {
  const [payments, setPayments] = useState<PaymentVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_verifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Төлбөрийн баталгаажуулалт</h1>
        <Button onClick={fetchPayments} variant="outline">
          Шинэчлэх
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">#{payment.reference_number}</CardTitle>
                {getStatusBadge(payment.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(payment.created_at).toLocaleDateString('mn-MN')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Төлбөрийн арга:</p>
                  <p className="text-muted-foreground">{payment.payment_method}</p>
                </div>
                <div>
                  <p className="font-medium">Дүн:</p>
                  <p className="text-muted-foreground">{payment.amount.toLocaleString()}₮</p>
                </div>
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

      {payments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Төлбөрийн мэдээлэл олдсонгүй</p>
        </div>
      )}

      {/* Payment Review Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Төлбөр шалгах</CardTitle>
              <p className="text-sm text-muted-foreground">
                #{selectedPayment.reference_number}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Төлбөрийн арга:</p>
                  <p>{selectedPayment.payment_method}</p>
                </div>
                <div>
                  <p className="font-medium">Дүн:</p>
                  <p>{selectedPayment.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Огноо:</p>
                  <p>{new Date(selectedPayment.payment_date).toLocaleDateString('mn-MN')}</p>
                </div>
                <div>
                  <p className="font-medium">Лавлах дугаар:</p>
                  <p>{selectedPayment.reference_number}</p>
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