import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Calculator, CheckCircle, XCircle, Clock } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

interface RepaymentPlan {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

export const LoanApplication = () => {
  usePageTitle("Fact Zeel - Loan Application");
  const [step, setStep] = useState<"application" | "processing" | "result">("application");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlan | null>(null);
  const [approvalResult, setApprovalResult] = useState<"approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateRepayment = (loanAmount: number, months: number): RepaymentPlan => {
    const interestRate = 0.15; // 15% жилийн хүү
    const monthlyRate = interestRate / 12;
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                          (Math.pow(1 + monthlyRate, months) - 1);
    const totalAmount = monthlyPayment * months;
    const totalInterest = totalAmount - loanAmount;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount)
    };
  };

  const handleCalculate = () => {
    const loanAmount = parseInt(amount);
    const loanTerm = parseInt(term);

    if (!loanAmount || loanAmount < 100000 || loanAmount > 10000000) {
      toast({
        title: "Буруу дүн",
        description: "Дүн нь ₮100,000-₮10,000,000 хооронд байх ёстой",
        variant: "destructive"
      });
      return;
    }

    if (!loanTerm || loanTerm < 3 || loanTerm > 40) {
      toast({
        title: "Буруу хугацаа",
        description: "Хугацаа нь 3-40 сарын хооронд байх ёстой",
        variant: "destructive"
      });
      return;
    }

    const plan = calculateRepayment(loanAmount, loanTerm);
    setRepaymentPlan(plan);
  };

  const handleSubmit = () => {
    if (!repaymentPlan) {
      toast({
        title: "Эхлээд тооцоолно уу",
        description: "Төлбөрийн төлөвлөгөө гаргаснаа дараа хүсэлт илгээнэ үү",
        variant: "destructive"
      });
      return;
    }

    setStep("processing");
    setLoading(true);

    // Зээлийн үнэлгээ симуляци
    setTimeout(() => {
      const approved = Math.random() > 0.3; // 70% зөвшөөрөх магадлал
      setApprovalResult(approved ? "approved" : "rejected");
      setStep("result");
      setLoading(false);

      if (approved) {
        // Зээлийн мэдээлэл хадгалах
        const loanData = {
          id: Date.now().toString(),
          amount: parseInt(amount),
          term: parseInt(term),
          monthlyPayment: repaymentPlan.monthlyPayment,
          totalAmount: repaymentPlan.totalAmount,
          status: "active",
          approvedDate: new Date().toISOString(),
          balance: parseInt(amount)
        };

        localStorage.setItem("simple_loan_data", JSON.stringify({
          activeLoan: loanData,
          loanHistory: [loanData]
        }));

        toast({
          title: "Зээл зөвшөөрөгдлөө!",
          description: "Таны зээлийн хүсэлт амжилттай зөвшөөрөгдлөө",
        });
      } else {
        toast({
          title: "Зээл татгалзагдлаа",
          description: "Уучлаарай, таны хүсэлт одоогоор зөвшөөрөгдөх боломжгүй",
          variant: "destructive"
        });
      }
    }, 3000);
  };

  if (step === "processing") {
    return (
      <Layout title="Зээлийн хүсэлт">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-8 h-8 text-warning" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Зээлийн үнэлгээ хийж байна...</h2>
            <p className="text-muted-foreground mb-4">
              Таны мэдээллийг шалгаж, зээлийн үнэлгээ хийж байна
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full animate-pulse" style={{ width: "70%" }}></div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Энэ нь хэдхэн минут үргэлжилнэ...</p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (step === "result") {
    return (
      <Layout title="Зээлийн хариу">
        <div className="p-4">
          <Card className="p-8 text-center">
            {approvalResult === "approved" ? (
              <>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-success">Зээл зөвшөөрөгдлөө!</h2>
                <p className="text-muted-foreground mb-6">
                  Баяр хүргэе! Таны зээлийн хүсэлт амжилттай зөвшөөрөгдлөө.
                </p>
                
                <div className="space-y-3 mb-6 text-left">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Зээлийн дүн</span>
                    <span className="font-semibold">₮{parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Хугацаа</span>
                    <span className="font-semibold">{term} сар</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Сарын төлбөр</span>
                    <span className="font-semibold">₮{repaymentPlan?.monthlyPayment.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={() => navigate("/dashboard")} className="w-full">
                    Хэтэвч рүү шилжих
                  </Button>
                  <Button onClick={() => navigate("/repay")} variant="outline" className="w-full">
                    Төлбөр төлөх
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-destructive">Зээл татгалзагдлаа</h2>
                <p className="text-muted-foreground mb-6">
                  Уучлаарай, таны зээлийн хүсэлт одоогоор зөвшөөрөгдөх боломжгүй байна.
                </p>
                
                <div className="space-y-3">
                  <Button onClick={() => navigate("/support")} className="w-full">
                    Тусламж авах
                  </Button>
                  <Button onClick={() => navigate("/dashboard")} variant="outline" className="w-full">
                    Хэтэвч рүү буцах
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Зээлийн хүсэлт">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Зээлийн хүсэлт</h1>
          <p className="text-muted-foreground">Зээлийн дүн болон хугацаагаа сонгоно уу</p>
        </Card>

        {/* Loan Form */}
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Зээлийн дүн (₮)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1,000,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="100000"
                max="10000000"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Хамгийн бага: ₮100,000 - Хамгийн их: ₮10,000,000
              </p>
            </div>

            <div>
              <Label htmlFor="term">Хугацаа (сар)</Label>
              <Input
                id="term"
                type="number"
                placeholder="12"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                min="3"
                max="40"
              />
              <p className="text-xs text-muted-foreground mt-1">
                3-40 сарын хооронд
              </p>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Төлбөрийн төлөвлөгөө тооцоолох
            </Button>
          </div>
        </Card>

        {/* Repayment Plan */}
        {repaymentPlan && (
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Төлбөрийн төлөвлөгөө</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Зээлийн дүн</span>
                <span className="font-semibold">₮{parseInt(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сарын төлбөр</span>
                <span className="font-semibold text-primary">
                  ₮{repaymentPlan.monthlyPayment.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Нийт хүү</span>
                <span className="font-semibold">₮{repaymentPlan.totalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3">
                <span className="text-muted-foreground">Нийт төлөх дүн</span>
                <span className="font-bold text-lg">₮{repaymentPlan.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">15% жилийн хүү</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Хүүгийн хэмжээ таны зээлийн түүх болон орлогоос хамаарч өөрчлөгдөж болно
              </p>
            </div>

            <Button onClick={handleSubmit} disabled={loading} className="w-full mt-4">
              {loading ? "Илгээж байна..." : "Зээлийн хүсэлт илгээх"}
            </Button>
          </Card>
        )}

        {/* Info */}
        <Card className="p-4">
          <h3 className="font-medium mb-2">Анхаарах зүйлс</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Зээлийн хүү 15%-аас эхэлнэ</li>
            <li>• Урьдчилан төлбөр төлөхөд торгууль байхгүй</li>
            <li>• Автомат суутгах тохиргоо боломжтой</li>
            <li>• 24/7 тусламжийн үйлчилгээ</li>
          </ul>
        </Card>
      </div>
    </Layout>
  );
};