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
        title: "Invalid amount",
        description: "Minimum payment is ₮1,000",
        variant: "destructive"
      });
      return;
    }

    if (amount > loanData.activeLoan.balance) {
      toast({
        title: "Amount too high",
        description: "Payment cannot exceed remaining balance",
        variant: "destructive"
      });
      return;
    }

    setShowQR(true);
  };

  const handlePaymentComplete = () => {
    const amount = parseInt(paymentAmount);
    const newBalance = loanData.activeLoan.balance - amount;
    const newTotalPaid = loanData.totalPaid + amount;

    const updatedLoanData = {
      ...loanData,
      activeLoan: newBalance > 0 ? {
        ...loanData.activeLoan,
        balance: newBalance,
        status: "active" as const
      } : null,
      totalPaid: newTotalPaid
    };

    localStorage.setItem("simple_loan_data", JSON.stringify(updatedLoanData));
    setPaymentComplete(true);
    
    toast({
      title: "Payment successful!",
      description: `₮${amount.toLocaleString()} has been paid`,
    });

    setTimeout(() => {
      navigate("/dashboard");
    }, 2000);
  };

  if (!loanData || !loanData.activeLoan) {
    return (
      <Layout title="Repayment">
        <div className="p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">No Active Loan</h2>
            <p className="text-muted-foreground mb-4">
              You don't have any active loans to repay
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  if (paymentComplete) {
    return (
      <Layout title="Payment Complete">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Payment Successful!</h2>
            <p className="text-muted-foreground mb-4">
              Your payment of ₮{parseInt(paymentAmount).toLocaleString()} has been processed
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting to dashboard...
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showQR) {
    return (
      <Layout title="QPay Payment">
        <div className="p-4">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Scan to Pay</h2>
              <p className="text-muted-foreground">Use your banking app to scan the QR code</p>
            </div>

            {/* Mock QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-gray-900 via-gray-700 to-gray-900 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">QPay QR Code</p>
                  <p className="text-xs">₮{parseInt(paymentAmount).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Amount</span>
                <span className="font-semibold">₮{parseInt(paymentAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-semibold">Simple Loan</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handlePaymentComplete}
                className="w-full"
              >
                I've Completed Payment
              </Button>
              <Button 
                onClick={() => setShowQR(false)}
                variant="outline"
                className="w-full"
              >
                Back
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              This is a demo QR code for testing purposes
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Loan Repayment">
      <div className="p-4 space-y-6">
        {/* Loan Summary */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Loan Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outstanding Balance</span>
              <span className="font-semibold text-lg">₮{loanData.activeLoan.balance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Payment</span>
              <span className="font-semibold">₮{loanData.activeLoan.monthlyPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Next Due Date</span>
              <span className="font-semibold">{loanData.activeLoan.nextPayment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="secondary" className="bg-success/10 text-success">
                {loanData.activeLoan.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Payment Form */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Make a Payment</h2>
            <p className="text-muted-foreground">Choose your payment amount</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Payment Amount (₮)</Label>
              <Input
                id="amount"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="1000"
                max={loanData.activeLoan.balance}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum: ₮1,000 | Maximum: ₮{loanData.activeLoan.balance.toLocaleString()}
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(loanData.activeLoan.monthlyPayment.toString())}
                  className="text-xs"
                >
                  Monthly Payment
                  <br />₮{loanData.activeLoan.monthlyPayment.toLocaleString()}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPaymentAmount(loanData.activeLoan.balance.toString())}
                  className="text-xs"
                >
                  Full Balance
                  <br />₮{loanData.activeLoan.balance.toLocaleString()}
                </Button>
              </div>
            </div>

            <Button 
              onClick={handlePaymentSubmit}
              className="w-full"
              disabled={!paymentAmount || parseInt(paymentAmount) < 1000}
            >
              Proceed to Payment
            </Button>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Accepted Payment Methods</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-2 border rounded-lg">
              <QrCode className="w-6 h-6 text-primary" />
              <div>
                <div className="font-medium">QPay</div>
                <div className="text-sm text-muted-foreground">Scan QR code with your banking app</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};