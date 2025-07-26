import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Plus, ShoppingCart, TrendingUp, ArrowUpRight, ArrowDownLeft, Eye, EyeOff } from "lucide-react";

interface LoanData {
  activeLoan?: {
    amount: number;
    balance: number;
    monthlyPayment: number;
    nextPayment: string;
    term: number;
    status: "active" | "overdue" | "completed";
  };
  creditScore: number;
  totalPaid: number;
}

export const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loanData, setLoanData] = useState<LoanData>({
    creditScore: 750,
    totalPaid: 0
  });

  useEffect(() => {
    const userData = localStorage.getItem("simple_loan_user");
    if (!userData) {
      navigate("/login");
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Load loan data from localStorage
    const savedLoanData = localStorage.getItem("simple_loan_data");
    if (savedLoanData) {
      setLoanData(JSON.parse(savedLoanData));
    }
  }, [navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "overdue":
        return "bg-destructive";
      case "completed":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

  const calculateProgress = () => {
    if (!loanData.activeLoan) return 0;
    const { amount, balance } = loanData.activeLoan;
    return ((amount - balance) / amount) * 100;
  };

  if (!user) return null;

  return (
    <Layout showBack={false}>
      <div className="p-4 space-y-6">
        {/* Balance Card */}
        <div className="balance-card rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-dark to-primary opacity-90"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm font-medium">Сайн байна уу, {user.name}</p>
                <p className="text-white/60 text-xs">{user.phone}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/80 text-sm mb-1">Нийт үлдэгдэл</p>
              <h2 className="text-3xl font-bold text-white">
                {balanceVisible ? `₮${(1250000).toLocaleString()}` : "••••••"}
              </h2>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-white/60">
                <p>Кредит оноо: <span className="text-white font-semibold">{loanData.creditScore}</span></p>
              </div>
              <Badge className="bg-white/20 text-white border-white/30">
                Саруул
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => navigate("/apply")}
            className="financial-card h-16 p-4 text-white border-0 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-light"></div>
            <div className="relative z-10 flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Орлого нэмэх</p>
                <p className="text-xs opacity-80">Зээл авах</p>
              </div>
            </div>
          </Button>

          <Button 
            onClick={() => navigate("/repay")}
            variant="outline"
            className="neu-card h-16 p-4 border-border/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                <ArrowDownLeft className="w-4 h-4 text-destructive" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Зарлага нэмэх</p>
                <p className="text-xs text-muted-foreground">Төлбөр төлөх</p>
              </div>
            </div>
          </Button>
        </div>

        {/* Services Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Таны үйлчилгээ</h3>
          
          {loanData.activeLoan ? (
            <Card className="neu-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Идэвхтэй зээл</h4>
                <Badge className={`${getStatusColor(loanData.activeLoan.status)} text-white`}>
                  {loanData.activeLoan.status === "active" ? "ИДЭВХТЭЙ" : loanData.activeLoan.status.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Үлдэгдэл</span>
                  <span className="font-semibold">₮{loanData.activeLoan.balance.toLocaleString()}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Төлөлтийн явц</span>
                    <span className="text-muted-foreground">{Math.round(calculateProgress())}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Сарын төлбөр</span>
                  <span className="font-semibold">₮{loanData.activeLoan.monthlyPayment.toLocaleString()}</span>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="neu-card p-6 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">Идэвхтэй зээл байхгүй</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Эхлэхийн тулд зээл хүсэлт гаргана уу
              </p>
            </Card>
          )}

          <Button 
            onClick={() => navigate("/simple-buy")}
            variant="outline"
            className="neu-card w-full h-14 justify-start gap-3"
          >
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-warning" />
            </div>
            <div className="text-left">
              <div className="font-medium">Худалдан авах</div>
              <div className="text-sm text-muted-foreground">Одоо авч, дараа төлөх</div>
            </div>
          </Button>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Сүүлийн гүйлгээ</h3>
          
          <Card className="neu-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="font-medium">Зээлийн төлбөр</p>
                  <p className="text-sm text-muted-foreground">Өнөөдөр</p>
                </div>
              </div>
              <span className="font-semibold text-success">+₮{loanData.totalPaid.toLocaleString()}</span>
            </div>
          </Card>

          <Card className="neu-card p-4">
            <div className="text-center py-6">
              <p className="text-muted-foreground">Бусад гүйлгээ байхгүй</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};