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

interface RepaymentPlan {
  monthlyPayment: number;
  totalInterest: number;
  totalAmount: number;
}

export const LoanApplication = () => {
  const [step, setStep] = useState<"application" | "processing" | "result">("application");
  const [amount, setAmount] = useState("");
  const [term, setTerm] = useState("");
  const [repaymentPlan, setRepaymentPlan] = useState<RepaymentPlan | null>(null);
  const [approvalResult, setApprovalResult] = useState<"approved" | "rejected" | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const calculateRepayment = (loanAmount: number, months: number): RepaymentPlan => {
    const interestRate = 0.15; // 15% annual interest rate
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
        title: "Invalid amount",
        description: "Amount must be between ₮100,000 and ₮10,000,000",
        variant: "destructive"
      });
      return;
    }

    if (!loanTerm || loanTerm < 3 || loanTerm > 40) {
      toast({
        title: "Invalid term",
        description: "Term must be between 3 and 40 months",
        variant: "destructive"
      });
      return;
    }

    const plan = calculateRepayment(loanAmount, loanTerm);
    setRepaymentPlan(plan);
  };

  const handleSubmit = async () => {
    if (!repaymentPlan) {
      handleCalculate();
      return;
    }

    setLoading(true);
    setStep("processing");

    // Simulate credit scoring and approval process
    setTimeout(() => {
      const loanAmount = parseInt(amount);
      const creditScore = Math.random() * 300 + 500; // Random score between 500-800
      const isApproved = creditScore > 600 && loanAmount <= 5000000; // Simple approval logic

      setApprovalResult(isApproved ? "approved" : "rejected");
      setStep("result");
      setLoading(false);

      if (isApproved) {
        // Save loan data
        const loanData = {
          activeLoan: {
            amount: loanAmount,
            balance: loanAmount,
            monthlyPayment: repaymentPlan.monthlyPayment,
            nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            term: parseInt(term),
            status: "active" as const
          },
          creditScore: Math.round(creditScore),
          totalPaid: 0
        };

        localStorage.setItem("simple_loan_data", JSON.stringify(loanData));

        toast({
          title: "Congratulations!",
          description: "Your loan has been approved!",
        });
      } else {
        toast({
          title: "Application declined",
          description: "Please try with a smaller amount or improve your credit score",
          variant: "destructive"
        });
      }
    }, 3000);
  };

  const handleAcceptLoan = () => {
    toast({
      title: "Loan activated!",
      description: "Funds will be transferred to your account within 24 hours",
    });
    navigate("/dashboard");
  };

  return (
    <Layout title="Loan Application">
      <div className="p-4">
        {step === "application" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calculator className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Loan Application</h2>
                <p className="text-muted-foreground">Get instant approval in minutes</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Loan Amount (₮)</Label>
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
                    Minimum: ₮100,000 | Maximum: ₮10,000,000
                  </p>
                </div>

                <div>
                  <Label htmlFor="term">Repayment Term (months)</Label>
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
                    Minimum: 3 months | Maximum: 40 months
                  </p>
                </div>

                <Button 
                  onClick={handleCalculate}
                  variant="outline"
                  className="w-full"
                  disabled={!amount || !term}
                >
                  Calculate Repayment
                </Button>
              </div>
            </Card>

            {repaymentPlan && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Repayment Plan</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-semibold">₮{parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Payment</span>
                    <span className="font-semibold">₮{repaymentPlan.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interest</span>
                    <span className="font-semibold">₮{repaymentPlan.totalInterest.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold text-lg">₮{repaymentPlan.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  className="w-full mt-6"
                  disabled={loading}
                >
                  Submit Application
                </Button>
              </Card>
            )}
          </div>
        )}

        {step === "processing" && (
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Processing Application</h2>
            <p className="text-muted-foreground mb-4">
              We're checking your credit score and verifying your information...
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse text-sm text-muted-foreground">
                This usually takes 2-3 minutes
              </div>
            </div>
          </Card>
        )}

        {step === "result" && (
          <Card className="p-8 text-center">
            {approvalResult === "approved" ? (
              <>
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-success">Application Approved!</h2>
                <p className="text-muted-foreground mb-6">
                  Congratulations! Your loan application has been approved.
                </p>
                
                <div className="text-left space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span>Approved Amount:</span>
                    <span className="font-semibold">₮{parseInt(amount).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Payment:</span>
                    <span className="font-semibold">₮{repaymentPlan?.monthlyPayment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Term:</span>
                    <span className="font-semibold">{term} months</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleAcceptLoan} className="w-full">
                    Accept Loan
                  </Button>
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    variant="outline" 
                    className="w-full"
                  >
                    Review Later
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-destructive">Application Declined</h2>
                <p className="text-muted-foreground mb-6">
                  Unfortunately, we cannot approve your loan application at this time.
                </p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => {
                      setStep("application");
                      setAmount("");
                      setTerm("");
                      setRepaymentPlan(null);
                      setApprovalResult(null);
                    }}
                    variant="outline" 
                    className="w-full"
                  >
                    Try Different Amount
                  </Button>
                  <Button 
                    onClick={() => navigate("/dashboard")} 
                    className="w-full"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};