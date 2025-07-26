import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Phone } from "lucide-react";

export const Login = () => {
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 8) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStep("otp");
      setLoading(false);
      toast({
        title: "OTP sent!",
        description: "Enter 1234 to continue (demo)",
      });
    }, 1000);
  };

  const handleOtpSubmit = async () => {
    if (otp !== "1234") {
      toast({
        title: "Invalid OTP",
        description: "Please enter the correct OTP (1234)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate login
    setTimeout(() => {
      const userData = {
        id: "1",
        name: "John Doe",
        phone: phone,
        joinedDate: new Date().toISOString()
      };
      
      localStorage.setItem("simple_loan_user", JSON.stringify(userData));
      setLoading(false);
      
      toast({
        title: "Welcome back!",
        description: "Login successful",
      });
      
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <Layout title="Login" showProfile={false}>
      <div className="p-4">
        <Card className="p-6">
          {step === "phone" ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Enter your phone number</h2>
                <p className="text-muted-foreground">We'll send you a verification code</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 rounded-l-md">
                    <span className="text-sm">+976</span>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="88001234"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <Button 
                onClick={handlePhoneSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Enter verification code</h2>
                <p className="text-muted-foreground">
                  Code sent to +976 {phone}
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">
                  Demo: Enter 1234 to continue
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleOtpSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Verifying..." : "Verify & Login"}
                </Button>
                
                <Button 
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full"
                >
                  Change phone number
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};