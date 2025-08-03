import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileText, AlertTriangle, Wallet, CreditCard, ShoppingBag, User } from "lucide-react";

export const LoanEligibility = () => {
  const navigate = useNavigate();
  const [loanAmount, setLoanAmount] = useState("");
  const [bankStatement, setBankStatement] = useState<File | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setBankStatement(file);
  };

  const formatNumber = (num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleLoanAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setLoanAmount(value);
  };

  const handleCalculateEligibility = async () => {
    if (!loanAmount) {
      toast({
        title: "Алдаа",
        description: "Зээлийн дүнгээ оруулна уу",
        variant: "destructive"
      });
      return;
    }

    if (!bankStatement) {
      toast({
        title: "Алдаа", 
        description: "Банкны хуулгаа оруулна уу",
        variant: "destructive"
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Convert file to base64 for verification
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const fileContent = e.target?.result as string;
        
        try {
          // Verify if it's actually a bank statement
          const { data: verificationResult, error } = await supabase.functions.invoke('verify-bank-statement', {
            body: {
              fileContent: fileContent.substring(0, 10000), // First 10k chars for analysis
              fileName: bankStatement.name,
              fileType: bankStatement.type
            }
          });

          if (error) {
            throw new Error('Банкны хуулга шалгахад алдаа гарлаа');
          }

          if (!verificationResult.isValid) {
            setIsCalculating(false);
            toast({
              title: "Файл буруу байна",
              description: `${verificationResult.reason} Банкны хуулга оруулна уу.`,
              variant: "destructive"
            });
            return;
          }

          // Store loan application data
          const applicationData = {
            loanAmount: Number(loanAmount),
            bankStatementFile: bankStatement.name,
            applicationDate: new Date().toISOString(),
            status: "pending_payment",
            verificationResult: verificationResult
          };

          localStorage.setItem("loanApplication", JSON.stringify(applicationData));

          // Simulate processing time
          setTimeout(() => {
            setIsCalculating(false);
            navigate("/loan-payment");
          }, 2000);

        } catch (error) {
          setIsCalculating(false);
          toast({
            title: "Алдаа гарлаа",
            description: "Банкны хуулга шалгахад алдаа гарлаа",
            variant: "destructive"
          });
        }
      };

      fileReader.readAsText(bankStatement);
    } catch (error) {
      setIsCalculating(false);
      toast({
        title: "Алдаа гарлаа",
        description: "Файл уншихад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  if (isCalculating) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Card className="neu-card max-w-sm mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Банкны хуулга шалгаж байна...</h3>
            <p className="text-muted-foreground">Таны файл банкны хуулга мөн эсэхийг шалгаж байна</p>
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
          <h1 className="text-2xl font-bold">Зээлийн чадвар шалгах</h1>
        </div>

        {/* Warning Card */}
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Анхааруулга</p>
                <p>Энэ шинжилгээ нь зөвхөн мэдээллийн зорилготой. Бид зээл олгодоггүй.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle>Зээлийн мэдээлэл оруулах</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loan Amount */}
            <div>
              <Label htmlFor="loanAmount">Хүссэн зээлийн дүн (₮)</Label>
              <Input
                id="loanAmount"
                value={formatNumber(loanAmount)}
                onChange={handleLoanAmountChange}
                placeholder="1,000,000"
                className="text-right text-lg"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Хамгийн бага: 300,000₮ • Хүү: 2.1% (долоо хоног тутам)
              </p>
            </div>

            {/* Bank Statement Upload */}
            <div>
              <Label>Банкны хуулга</Label>
              <div className="mt-2">
                {bankStatement ? (
                  <div className="flex items-center gap-3 p-3 border rounded-lg bg-success/5 border-success">
                    <FileText className="w-5 h-5 text-success" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{bankStatement.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(bankStatement.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBankStatement(null)}
                    >
                      Устгах
                    </Button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium">Файл оруулах</p>
                      <p className="text-xs text-muted-foreground">
                        PDF эсвэл зураг (5MB хүртэл)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Сүүлийн 3 сарын банкны хуулга шаардлагатай
              </p>
            </div>

            {/* Calculate Button */}
            <Button
              onClick={handleCalculateEligibility}
              className="w-full h-12 text-lg"
              disabled={!loanAmount || !bankStatement}
            >
              Зээлийн чадвар тооцоолох
            </Button>

            {/* Info Section */}
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-3">Шаардлага</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  18-65 насны иргэн
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Тогтмол орлоготой
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  Банкны дансны түүх
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Navigation Icons */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around items-center">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Хэтэвч</span>
              </button>
              <button
                onClick={() => navigate("/loan-eligibility")}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-primary bg-primary/10"
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Зээл</span>
              </button>
              <button
                onClick={() => navigate("/simple-buy")}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                <ShoppingBag className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Үйлчилгээ</span>
              </button>
              <button
                onClick={() => navigate("/profile")}
                className="flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 text-muted-foreground hover:text-foreground"
              >
                <User className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Профайл</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};