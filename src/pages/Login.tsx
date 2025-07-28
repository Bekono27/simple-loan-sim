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
        title: "Утасны дугаар буруу",
        description: "Зөв утасны дугаар оруулна уу",
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
        title: "Баталгаажуулах код илгээгдлээ!",
        description: "Үргэлжлүүлэхийн тулд 1234 оруулна уу (жишээ)",
      });
    }, 1000);
  };

  const handleOtpSubmit = async () => {
    if (otp !== "1234") {
      toast({
        title: "Баталгаажуулах код буруу",
        description: "Зөв баталгаажуулах код оруулна уу (1234)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    // Simulate login
    setTimeout(() => {
      const userData = {
        id: "1",
        name: "Бат-Эрдэнэ",
        phone: phone,
        joinedDate: new Date().toISOString()
      };
      
      localStorage.setItem("simple_loan_user", JSON.stringify(userData));
      setLoading(false);
      
      toast({
        title: "Тавтай морилно уу!",
        description: "Амжилттай нэвтэрлээ",
      });
      
      navigate("/dashboard");
    }, 1000);
  };

  return (
    <Layout title="Нэвтрэх" showBottomNav={false}>
      <div className="p-4">
        <Card className="p-6">
          {step === "phone" ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Утасны дугаараа оруулна уу</h2>
                <p className="text-muted-foreground">Бид танд баталгаажуулах код илгээх болно</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="phone">Утасны дугаар</Label>
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
                {loading ? "Илгээж байна..." : "Код илгээх"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Баталгаажуулах код оруулна уу</h2>
                <p className="text-muted-foreground">
                  +976 {phone} дугаарт код илгээгдлээ
                </p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="otp">Баталгаажуулах код</Label>
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
                  Жишээ: Үргэлжлүүлэхийн тулд 1234 оруулна уу
                </p>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={handleOtpSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Шалгаж байна..." : "Баталгаажуулаад нэвтрэх"}
                </Button>
                
                <Button 
                  variant="ghost"
                  onClick={() => setStep("phone")}
                  className="w-full"
                >
                  Утасны дугаар солих
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};