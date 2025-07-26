import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Zap, Clock } from "lucide-react";

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Logo and Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-primary-foreground">SL</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Simple Loan</h1>
          <p className="text-lg text-muted-foreground">Fast, Easy, Secure Loans</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Instant Approval</h3>
                <p className="text-sm text-muted-foreground">Get approved in minutes</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Flexible Terms</h3>
                <p className="text-sm text-muted-foreground">3-40 months repayment</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">100% Secure</h3>
                <p className="text-sm text-muted-foreground">Bank-level security</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/apply")}
            className="w-full h-12 text-lg font-medium"
          >
            Apply Now
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/login")}
            className="w-full h-12 text-lg font-medium"
          >
            Login
          </Button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-sm">
          <button 
            onClick={() => navigate("/faq")}
            className="text-muted-foreground hover:text-foreground"
          >
            FAQ
          </button>
          <button 
            onClick={() => navigate("/support")}
            className="text-muted-foreground hover:text-foreground"
          >
            Support
          </button>
        </div>
      </div>
    </div>
  );
};