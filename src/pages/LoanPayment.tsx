import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PaymentMethods } from "@/components/PaymentMethods";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, AlertTriangle, Copy, CheckCircle, QrCode } from "lucide-react";

export const LoanPayment = () => {
  const navigate = useNavigate();
  const [agreedToPay, setAgreedToPay] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"qpay" | "bank" | "">("");
  const [isProcessing, setIsProcessing] = useState(false);

  const analysisfee = 3000;

  const bankDetails = {
    accountNumber: "5001234567",
    accountName: "ЗЭЭЛИЙН ШИНЖИЛГЭЭ ХХК",
    bank: "Хаан банк",
    reference: `LOAN${Date.now().toString().slice(-6)}`
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Хуулагдлаа",
      description: "Буферт хадгалагдлаа"
    });
  };

  const handleProceedAfterPayment = () => {
    if (!agreedToPay) {
      toast({
        title: "Алдаа",
        description: "Төлбөрийн нөхцөлийг зөвшөөрнө үү",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    // Update application status
    const existingApp = localStorage.getItem("loanApplication");
    if (existingApp) {
      const appData = JSON.parse(existingApp);
      appData.status = "payment_confirmed";
      appData.paymentMethod = paymentMethod;
      appData.paymentDate = new Date().toISOString();
      appData.referenceNumber = bankDetails.reference;
      localStorage.setItem("loanApplication", JSON.stringify(appData));
    }

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      navigate("/loan-result");
    }, 3000);
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
                  <p>• Энэ төлбөр нь буцаагддаггүй</p>
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
          <CardContent className="space-y-4">
            {/* QPay Option */}
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
                <div>
                  <h3 className="font-medium">QPay / Цахим шилжүүлэг</h3>
                  <p className="text-sm text-muted-foreground">Хурдан бөгөөд аюулгүй</p>
                </div>
                {paymentMethod === "qpay" && (
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
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
                  <span className="text-sm font-bold text-primary">₮</span>
                </div>
                <div>
                  <h3 className="font-medium">Банкны шилжүүлэг</h3>
                  <p className="text-sm text-muted-foreground">Дансаас данс руу</p>
                </div>
                {paymentMethod === "bank" && (
                  <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        {paymentMethod && (
          <Card className="neu-card mb-6">
            <CardHeader>
              <CardTitle>
                {paymentMethod === "qpay" ? "QPay QR код" : "Банкны мэдээлэл"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentMethod === "qpay" ? (
                <div className="text-center">
                  <div className="w-48 h-48 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-24 h-24 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Дээрх QR кодыг QPay аппаар уншуулна уу
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
                    <p className="text-sm font-medium">Дансны дугаар</p>
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Methods Recommendation */}
        <PaymentMethods />

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