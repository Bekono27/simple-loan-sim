import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, Plus, ShoppingCart, TrendingUp } from "lucide-react";

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
    <Layout title="Dashboard" showProfile={true} showBack={false}>
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {user.name}!
          </h1>
          <p className="text-muted-foreground">Phone: {user.phone}</p>
        </div>

        {/* Credit Score */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Credit Score
            </h3>
            <Badge variant="secondary" className="bg-success/10 text-success">
              Excellent
            </Badge>
          </div>
          <div className="text-3xl font-bold text-primary mb-2">
            {loanData.creditScore}
          </div>
          <p className="text-sm text-muted-foreground">
            Your credit score is in excellent shape!
          </p>
        </Card>

        {/* Active Loan Status */}
        {loanData.activeLoan ? (
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Active Loan</h3>
              <Badge className={getStatusColor(loanData.activeLoan.status)}>
                {loanData.activeLoan.status.toUpperCase()}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining Balance</span>
                <span className="font-semibold">₮{loanData.activeLoan.balance.toLocaleString()}</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Repayment Progress</span>
                  <span className="text-muted-foreground">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="font-semibold">₮{loanData.activeLoan.monthlyPayment.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Payment</span>
                <span className="font-semibold">{loanData.activeLoan.nextPayment}</span>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold mb-2">No Active Loan</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Apply for a loan to get started
            </p>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="font-semibold">Quick Actions</h3>
          
          <Button 
            onClick={() => navigate("/apply")}
            className="w-full h-14 text-left justify-start gap-3"
            variant={loanData.activeLoan ? "outline" : "default"}
          >
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Apply for Loan</div>
              <div className="text-sm text-muted-foreground">Get money instantly</div>
            </div>
          </Button>

          {loanData.activeLoan && (
            <Button 
              onClick={() => navigate("/repay")}
              variant="outline"
              className="w-full h-14 text-left justify-start gap-3"
            >
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success" />
              </div>
              <div>
                <div className="font-medium">Repay Now</div>
                <div className="text-sm text-muted-foreground">Make a payment</div>
              </div>
            </Button>
          )}

          <Button 
            onClick={() => navigate("/simple-buy")}
            variant="outline"
            className="w-full h-14 text-left justify-start gap-3"
          >
            <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="font-medium">Simple Buy</div>
              <div className="text-sm text-muted-foreground">Buy now, pay later</div>
            </div>
          </Button>
        </div>

        {/* Stats */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Your Stats</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                ₮{loanData.totalPaid.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Repaid</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {loanData.activeLoan ? loanData.activeLoan.term : 0}
              </div>
              <div className="text-sm text-muted-foreground">Months Term</div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};