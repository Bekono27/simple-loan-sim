import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, CreditCard, CheckCircle } from "lucide-react";

export const Repayment = () => {
  const [loanData, setLoanData] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const userData = localStorage.getItem("simple_loan_user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const savedLoanData = localStorage.getItem("simple_loan_data");
    if (!savedLoanData) {
      navigate("/dashboard");
      return;
    }

    const data = JSON.parse(savedLoanData);
    setLoanData(data);
    
    if (data.activeLoan) {
      setPaymentAmount(data.activeLoan.monthlyPayment.toString());
    }
  }, [navigate]);

  const handlePaymentSubmit = () => {
    const amount = parseInt(paymentAmount);
    
    if (!amount || amount < 1000) {
      toast({
        title: "Буруу дүн",
        description: "Хамгийн бага төлбөр ₮1,000",
        variant: "destructive"
      });
      return;
    }

    setShowQR(true);
  };

  const handlePaymentComplete = () => {
    const amount = parseInt(paymentAmount);
    
    // Зээлийн үлдэгдэл шинэчлэх
    if (loanData?.activeLoan) {
      const updatedBalance = Math.max(0, loanData.activeLoan.balance - amount);
      const updatedLoanData = {
        ...loanData,
        activeLoan: {
          ...loanData.activeLoan,
          balance: updatedBalance,
          status: updatedBalance === 0 ? "completed" : "active"
        }
      };
      
      localStorage.setItem("simple_loan_data", JSON.stringify(updatedLoanData));
      setLoanData(updatedLoanData);
    }

    setPaymentComplete(true);
    setShowQR(false);
    
    toast({
      title: "Төлбөр амжилттай!",
      description: `₮${parseInt(paymentAmount).toLocaleString()} төлбөр амжилттай төлөгдлөө`,
    });

    setTimeout(() => {
      setPaymentComplete(false);
      navigate("/dashboard");
    }, 3000);
  };

  if (paymentComplete) {
    return (
      <Layout title="Төлбөр төлөх">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Төлбөр амжилттай!</h2>
            <p className="text-muted-foreground mb-4">
              ₮{parseInt(paymentAmount).toLocaleString()} төлбөр амжилттай төлөгдлөө
            </p>
            <p className="text-sm text-muted-foreground">
              Хэтэвч рүү шилжүүлж байна...
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showQR) {
    return (
      <Layout title="QPay төлбөр">
        <div className="p-4">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">QPay QR код</h2>
              <p className="text-muted-foreground">Банкны апп-аараа QR кодыг уншуулна уу</p>
            </div>

            {/* Mock QR Code */}
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-muted mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <QrCode className="w-20 h-20 mx-auto mb-2" />
                  <p className="text-sm font-semibold">QPay</p>
                  <p className="text-xs">₮{parseInt(paymentAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Хүлээн авагч</span>
                <span className="font-semibold">Энгийн Зээл ХХК</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Дүн</span>
                <span className="font-semibold">₮{parseInt(paymentAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Утга</span>
                <span className="font-semibold">Зээлийн төлбөр</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handlePaymentComplete}
                className="w-full"
              >
                Төлбөр хийгдсэн
              </Button>
              <Button 
                onClick={() => setShowQR(false)}
                variant="outline"
                className="w-full"
              >
                Цуцлах
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Энэ бол туршилтын QR код бөгөөд бодит төлбөр хийхгүй
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!loanData?.activeLoan) {
    return (
      <Layout title="Төлбөр төлөх">
        <div className="p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Идэвхтэй зээл байхгүй</h2>
            <p className="text-muted-foreground mb-4">
              Танд одоогоор төлөх ёстой зээл байхгүй байна
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Хэтэвч рүү буцах
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Төлбөр төлөх">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Зээлийн төлбөр</h1>
          <p className="text-muted-foreground">QPay эсвэл банкны картаар төлнө үү</p>
        </Card>

        {/* Current Loan Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Идэвхтэй зээл</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Үлдэгдэл</span>
              <span className="font-bold text-xl">₮{loanData.activeLoan.balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Сарын төлбөр</span>
              <span className="font-semibold">₮{loanData.activeLoan.monthlyPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Статус</span>
              <Badge variant={loanData.activeLoan.status === "active" ? "default" : "secondary"}>
                {loanData.activeLoan.status === "active" ? "Идэвхтэй" : "Дууссан"}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Төлбөрийн дүн</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Төлөх дүн (₮)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1000"
                max={loanData.activeLoan.balance}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Хамгийн бага: ₮1,000
              </p>
            </div>

            {/* Quick Payment Options */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Хурдан сонголт</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(loanData.activeLoan.monthlyPayment.toString())}
                >
                  Сарын төлбөр
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(loanData.activeLoan.balance.toString())}
                >
                  Бүх үлдэгдэл
                </Button>
              </div>
            </div>

            <Button onClick={handlePaymentSubmit} className="w-full">
              QPay-аар төлөх
            </Button>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">Төлбөрийн аргууд</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span>QPay QR код</span>
              <Badge variant="secondary">Идэвхтэй</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span>Банкны шилжүүлэг</span>
              <Badge variant="outline">Удахгүй</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <span>Автомат суутгах</span>
              <Badge variant="outline">Тохируулах</Badge>
            </div>
          </div>
        </Card>

        {/* Important Notes */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Анхаарах зүйлс</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Төлбөр боловсруулахад 1-2 өдөр хугацаа шаардагдана</li>
            <li>• Хоцрогдсон төлбөрт нэмэлт төлбөр ногдуулна</li>
            <li>• Урьдчилан төлбөр төлөхөд торгууль байхгүй</li>
            <li>• Асуудал гарвал 24/7 тусламжтай холбогдоно уу</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};