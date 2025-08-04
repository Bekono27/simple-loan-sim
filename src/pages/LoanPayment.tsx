import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PaymentMethods } from "@/components/PaymentMethods";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle, Copy, CheckCircle, QrCode, CreditCard, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/use-page-title";

export const LoanPayment = () => {
  usePageTitle("Fact Zeel - Loan Payment");
  const navigate = useNavigate();
  const [agreedToPay, setAgreedToPay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qpay" | "bank" | "visa" | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  const analysisfee = 3000;

  // Generate a truly unique reference number
  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString();
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `FL${timestamp.slice(-8)}${randomSuffix}`;
  };

  const bankDetails = {
    accountNumber: "MN24001500 2015180476",
    accountName: "Byektas Syerikbyek",
    bank: "Хаан банк",
    reference: generateReferenceNumber()
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Хуулагдлаа",
      description: "Буферт хадгалагдлаа"
    });
  };

  const handleProceedAfterPayment = async () => {
    if (!agreedToPay) {
      toast({
        title: "Алдаа",
        description: "Төлбөрийн нөхцөлийг зөвшөөрнө үү",
        variant: "destructive"
      });
      return;
    }

    if (paymentMethod === "visa") {
      toast({
        title: "Тун удахгүй",
        description: "Visa картын төлбөр тун удахгүй нэмэгдэнэ",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Алдаа",
          description: "Нэвтэрч орно уу",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Get loan application
      const existingApp = localStorage.getItem("loanApplication");
      if (!existingApp) {
        toast({
          title: "Алдаа", 
          description: "Зээлийн өргөдөл олдсонгүй",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      const appData = JSON.parse(existingApp);
      
      // Create payment verification record
      const { error } = await supabase
        .from('payment_verifications')
        .insert({
          user_id: user.id,
          loan_application_id: appData.id || null,
          payment_method: paymentMethod,
          reference_number: bankDetails.reference,
          amount: analysisfee,
          status: 'pending'
        });

      if (error) {
        console.error('Payment verification error:', error);
        toast({
          title: "Алдаа",
          description: "Төлбөрийн мэдээлэл хадгалахад алдаа гарлаа",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Update application status
      appData.status = "payment_submitted";
      appData.paymentMethod = paymentMethod;
      appData.paymentDate = new Date().toISOString();
      appData.referenceNumber = bankDetails.reference;
      localStorage.setItem("loanApplication", JSON.stringify(appData));

      toast({
        title: "Амжилттай",
        description: "Төлбөрийн мэдээлэл админд илгээгдлээ. Баталгаажуулалтыг хүлээнэ үү."
      });

      // Simulate processing time
      setTimeout(() => {
        setIsProcessing(false);
        navigate("/loan-result");
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Алдаа",
        description: "Алдаа гарлаа. Дахин оролдоно уу.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Card className="neu-card max-w-sm mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Төлбөр шалгаж байна...</h3>
            <p className="text-muted-foreground">Таны төлбөрийг баталгаажуулж байна</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Төлбөр төлөх</h1>
        </div>

        {/* Fee Information */}
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning mt-1" />
              <div>
                <h3 className="font-medium text-lg mb-2">Шинжилгээний зардал</h3>
                <p className="text-2xl font-bold text-foreground mb-2">{analysisfee.toLocaleString()}₮</p>
                <div className="text-sm space-y-1">
                  <p>• Энэ төлбөр нь буцаагдахгүй</p>
                  <p>• Зөвхөн мэдээллийн зорилготой шинжилгээ</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="neu-card mb-6">
          <CardHeader>
            <CardTitle>Төлбөрийн арга сонгох</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* QR Code / QPay Option */}
            <div 
              onClick={() => setPaymentMethod("qpay")}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "qpay" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">QR код / QPay</h3>
                  <p className="text-sm text-muted-foreground">Тун удахгүй</p>
                </div>
                <div className="text-xs bg-muted px-2 py-1 rounded">Удахгүй</div>
                {paymentMethod === "qpay" && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>

            {/* Bank Transfer Option */}
            <div 
              onClick={() => setPaymentMethod("bank")}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                paymentMethod === "bank" 
                  ? "border-primary bg-primary/5" 
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">Банкны шилжүүлэг</h3>
                  <p className="text-sm text-muted-foreground">Дансаас данс руу</p>
                </div>
                <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Боломжтой</div>
                {paymentMethod === "bank" && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>

            {/* Other Methods Coming Soon */}
            <div className="p-4 border border-dashed border-muted-foreground/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Бусад төлбөрийн аргууд тун удахгүй нэмэгдэнэ
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        {paymentMethod && paymentMethod !== "visa" && (
          <Card className="neu-card mb-6">
            <CardHeader>
              <CardTitle>
                {paymentMethod === "qpay" ? "QR код мэдээлэл" : "Банкны мэдээлэл"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethod === "qpay" ? (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-24 h-24 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    QR код тун удахгүй нэмэгдэнэ
                  </p>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Гүйлгээний утга</p>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm">{bankDetails.reference}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.reference)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Банк</p>
                    <p className="text-sm">{bankDetails.bank}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">IBAN дугаар</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{bankDetails.accountNumber}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.accountNumber)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Данс эзэмшигч</p>
                    <p className="text-sm">{bankDetails.accountName}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium">Гүйлгээний утга</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm">{bankDetails.reference}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bankDetails.reference)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Админы баталгаажуулалт</h4>
                    <p className="text-xs text-blue-700">
                      Төлбөр хийсний дараа ажилтан таны төлбөрийг шалгаж баталгаажуулна. 
                       Бид танд 30 минутын дотор хариу өгнө.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}


        {/* Agreement and Proceed */}
        <Card className="neu-card">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="paymentAgreement"
                checked={agreedToPay}
                onCheckedChange={(checked) => setAgreedToPay(!!checked)}
              />
              <Label htmlFor="paymentAgreement" className="text-sm leading-5">
                Би {analysisfee.toLocaleString()}₮ төлбөр төлснийг ойлгож байна. 
                Энэ төлбөр нь зээл олгохыг баталгаажуулдаггүй бөгөөд буцаагддаггүй.
              </Label>
            </div>

            <Button
              onClick={handleProceedAfterPayment}
              className="w-full h-12 text-lg"
              disabled={!agreedToPay || !paymentMethod}
            >
              Төлсөн → Үргэлжлүүлэх
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Төлбөр төлсний дараа энэ товчлуурыг дарна уу
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};