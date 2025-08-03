import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, FileText, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";

interface LoanApplication {
  id: string;
  amount: number;
  status: string;
  payment_status?: string;
  eligibility_result?: string;
  max_loan_amount?: number;
  interest_rate?: number;
  created_at: string;
  updated_at: string;
}

interface PaymentVerification {
  id: string;
  status: string;
  payment_method: string;
  reference_number: string;
  amount: number;
  admin_notes?: string;
  created_at: string;
}

export const LoanStatus = () => {
  usePageTitle("Fact Zeel - Loan Status");
  const navigate = useNavigate();
  const [loanApplication, setLoanApplication] = useState<LoanApplication | null>(null);
  const [paymentVerification, setPaymentVerification] = useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserLoanStatus();
  }, []);

  const fetchUserLoanStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch latest loan application
      const { data: loanData, error: loanError } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loanError) throw loanError;

      setLoanApplication(loanData);

      // If there's a loan application, fetch payment verification
      if (loanData) {
        const { data: paymentData, error: paymentError } = await supabase
          .from('payment_verifications')
          .select('*')
          .eq('user_id', user.id)
          .eq('loan_application_id', loanData.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (paymentError && paymentError.code !== 'PGRST116') {
          console.error('Payment fetch error:', paymentError);
        } else {
          setPaymentVerification(paymentData);
        }
      }
    } catch (error) {
      console.error('Error fetching loan status:', error);
      toast({
        title: "Алдаа",
        description: "Зээлийн мэдээлэл татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!loanApplication) {
      return {
        title: "Зээлийн хүсэлт байхгүй",
        description: "Та зээлийн хүсэлт гаргаагүй байна",
        variant: "outline" as const,
        icon: AlertTriangle,
        color: "text-muted-foreground"
      };
    }

    switch (loanApplication.status) {
      case 'pending':
        return {
          title: "Шинжилгээ хүлээгдэж байна",
          description: "Таны зээлийн хүсэлт админы хэсэгт хүлээгдэж байна",
          variant: "outline" as const,
          icon: Clock,
          color: "text-yellow-600"
        };
      case 'payment_submitted':
        return {
          title: "Төлбөр хүлээгдэж байна",
          description: "Таны төлбөр админаас баталгаажуулагдахыг хүлээж байна",
          variant: "outline" as const,
          icon: Clock,
          color: "text-blue-600"
        };
      case 'payment_verified':
        return {
          title: "Төлбөр баталгаажлаа",
          description: "Зээлийн шинжилгээ удахгүй эхлэнэ",
          variant: "outline" as const,
          icon: CheckCircle,
          color: "text-green-600"
        };
      case 'payment_rejected':
        return {
          title: "Төлбөр татгалзлаа",
          description: "Төлбөрийн баталгаажуулалт амжилтгүй болсон",
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-600"
        };
      case 'approved':
        return {
          title: "Зээл зөвшөөрөгдлөө! 🎉",
          description: "Таны зээлийн хүсэлт зөвшөөрөгдлөө",
          variant: "default" as const,
          icon: CheckCircle,
          color: "text-green-600"
        };
      case 'rejected':
        return {
          title: "Зээл татгалзлаа",
          description: "Таны зээлийн хүсэлт татгалзлаа",
          variant: "destructive" as const,
          icon: XCircle,
          color: "text-red-600"
        };
      default:
        return {
          title: "Тодорхойгүй төлөв",
          description: "Төлөвийг тодорхойлох боломжгүй",
          variant: "outline" as const,
          icon: AlertTriangle,
          color: "text-muted-foreground"
        };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
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
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Card className="neu-card max-w-sm mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Мэдээлэл татаж байна...</h3>
            <p className="text-muted-foreground">Таны зээлийн мэдээллийг шалгаж байна</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Зээлийн төлөв</h1>
        </div>

        {/* Status Card */}
        <Card className={`neu-card mb-6 ${statusInfo.variant === 'destructive' ? 'border-destructive bg-destructive/5' : statusInfo.variant === 'default' ? 'border-success bg-success/5' : ''}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
              <div>
                <h3 className="font-medium text-lg">{statusInfo.title}</h3>
                <p className="text-sm text-muted-foreground">{statusInfo.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loan Application Details */}
        {loanApplication && (
          <Card className="neu-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Зээлийн хүсэлт
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Хүссэн дүн:</p>
                  <p className="text-muted-foreground">{loanApplication.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Огноо:</p>
                  <p className="text-muted-foreground">{new Date(loanApplication.created_at).toLocaleDateString('mn-MN')}</p>
                </div>
              </div>

              {loanApplication.status === 'approved' && loanApplication.max_loan_amount && (
                <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                  <h4 className="font-medium text-success mb-2">Зөвшөөрөгдсөн зээл</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Зөвшөөрөгдсөн дүн:</p>
                      <p className="text-success font-semibold">{loanApplication.max_loan_amount.toLocaleString()}₮</p>
                    </div>
                    {loanApplication.interest_rate && (
                      <div>
                        <p className="font-medium">Хүүгийн хэмжээ:</p>
                        <p className="text-success font-semibold">{loanApplication.interest_rate}%</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {loanApplication.eligibility_result && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Админы тэмдэглэл:</p>
                  <p className="text-xs text-muted-foreground">{loanApplication.eligibility_result}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Verification Details */}
        {paymentVerification && (
          <Card className="neu-card mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Төлбөрийн мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Төлбөрийн төлөв:</span>
                {getPaymentStatusBadge(paymentVerification.status)}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Төлбөрийн арга:</p>
                  <p className="text-muted-foreground">{paymentVerification.payment_method}</p>
                </div>
                <div>
                  <p className="font-medium">Дүн:</p>
                  <p className="text-muted-foreground">{paymentVerification.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Лавлах дугаар:</p>
                  <p className="text-muted-foreground">{paymentVerification.reference_number}</p>
                </div>
                <div>
                  <p className="font-medium">Огноо:</p>
                  <p className="text-muted-foreground">{new Date(paymentVerification.created_at).toLocaleDateString('mn-MN')}</p>
                </div>
              </div>

              {paymentVerification.admin_notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Админы тэмдэглэл:</p>
                  <p className="text-xs text-muted-foreground">{paymentVerification.admin_notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 text-lg"
          >
            Нүүр хуудас руу буцах
          </Button>

          {!loanApplication && (
            <Button
              variant="outline"
              onClick={() => navigate("/loan-eligibility")}
              className="w-full"
            >
              Зээлийн хүсэлт гаргах
            </Button>
          )}

          {loanApplication?.status === 'payment_rejected' && (
            <Button
              variant="outline"
              onClick={() => navigate("/loan-payment")}
              className="w-full"
            >
              Дахин төлбөр төлөх
            </Button>
          )}
        </div>

        {/* Contact Support */}
        <div className="text-center mt-8 p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Асуулт байвал холбогдоно уу</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>И-мэйл: adfactloan@gmail.com</p>
            <p>Утас: +976 72100627</p>
          </div>
        </div>
      </div>
    </div>
  );
};