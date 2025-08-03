import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, AlertTriangle, Download, Share2 } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export const LoanResult = () => {
  usePageTitle("Fact Zeel - Loan Result");
  const navigate = useNavigate();
  const [applicationData, setApplicationData] = useState<any>(null);
  const [calculatedResult, setCalculatedResult] = useState<any>(null);

  useEffect(() => {
    // Get application data
    const appData = localStorage.getItem("loanApplication");
    if (appData) {
      const parsed = JSON.parse(appData);
      setApplicationData(parsed);

      // Simulate loan eligibility calculation
      const eligibilityResult = calculateEligibility(parsed.loanAmount);
      setCalculatedResult(eligibilityResult);

      // Update application with result
      parsed.result = eligibilityResult;
      parsed.status = "completed";
      localStorage.setItem("loanApplication", JSON.stringify(parsed));
    }
  }, []);

  const calculateEligibility = (requestedAmount: number) => {
    // Simulate eligibility calculation based on requested amount
    const baseEligibility = Math.floor(requestedAmount * (0.6 + Math.random() * 0.3));
    const interestRate = 18 + Math.random() * 12; // 18-30%
    
    return {
      eligible: true,
      maxAmount: baseEligibility,
      interestRate: Math.round(interestRate * 10) / 10,
      term: "3-36 сар",
      monthlyPayment: Math.round((baseEligibility * (interestRate / 100 / 12)) / (1 - Math.pow(1 + (interestRate / 100 / 12), -24))),
      score: Math.floor(600 + Math.random() * 250) // Credit score simulation
    };
  };

  const shareResult = () => {
    if (navigator.share && calculatedResult) {
      navigator.share({
        title: "Зээлийн чадварын үр дүн",
        text: `Миний зээлийн чадвар: ${calculatedResult.maxAmount.toLocaleString()}₮ хүртэл зээл авах боломжтой`,
      });
    }
  };

  const downloadResult = () => {
    // Create a simple text report
    const report = `
Зээлийн чадварын шинжилгээний үр дүн
=====================================

Хүсэлт гаргасан дүн: ${applicationData?.loanAmount.toLocaleString()}₮
Зөвшөөрөгдсөн дүн: ${calculatedResult?.maxAmount.toLocaleString()}₮
Хүүгийн хэмжээ: ${calculatedResult?.interestRate}%
Хугацаа: ${calculatedResult?.term}
Сарын төлбөр: ${calculatedResult?.monthlyPayment.toLocaleString()}₮

АНХААРУУЛГА: Энэ нь зөвхөн мэдээллийн зорилготой шинжилгээ юм.
Бид зээл олгодоггүй.
`;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "loan-eligibility-result.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!applicationData || !calculatedResult) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <Card className="neu-card max-w-sm mx-4">
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">Үр дүн бэлтгэж байна...</h3>
            <p className="text-muted-foreground">Таны зээлийн чадварыг тооцоолж байна</p>
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
            onClick={() => navigate("/dashboard")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Шинжилгээний үр дүн</h1>
        </div>

        {/* Success Status */}
        <Card className="border-success bg-success/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <h3 className="font-medium">Шинжилгээ амжилттай</h3>
                <p className="text-sm text-muted-foreground">
                  Таны зээлийн чадварын үр дүн бэлэн боллоо
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Result */}
        <Card className="neu-card mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Зээлийн чадварын үр дүн</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Eligibility Amount */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Таны зээлийн чадвар</p>
              <p className="text-4xl font-bold text-primary mb-2">
                {calculatedResult.maxAmount.toLocaleString()}₮
              </p>
              <p className="text-sm text-muted-foreground">хүртэл зээл авах боломжтой</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Хүүгийн хэмжээ</p>
                <p className="text-lg font-bold">{calculatedResult.interestRate}%</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Хугацаа</p>
                <p className="text-lg font-bold">{calculatedResult.term}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Сарын төлбөр</p>
                <p className="text-lg font-bold">{calculatedResult.monthlyPayment.toLocaleString()}₮</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Зээлийн оноо</p>
                <p className="text-lg font-bold">{calculatedResult.score}</p>
              </div>
            </div>

            {/* Request vs Approved */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Харьцуулалт</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Хүссэн дүн:</span>
                  <span>{applicationData.loanAmount.toLocaleString()}₮</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Зөвшөөрөгдсөн дүн:</span>
                  <span className="text-primary">{calculatedResult.maxAmount.toLocaleString()}₮</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Хувь:</span>
                  <span className="text-success">
                    {Math.round((calculatedResult.maxAmount / applicationData.loanAmount) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Disclaimer */}
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-warning mt-1" />
              <div>
                <h3 className="font-medium mb-2">Чухал анхааруулга</h3>
                <div className="text-sm space-y-1">
                  <p>• Энэ нь зөвхөн мэдээллийн зорилготой шинжилгээ</p>
                  <p>• Бид зээл олгодоггүй</p>
                  <p>• Зээл авахын тулд банкинд хандана уу</p>
                  <p>• Үр дүн нь таний одоогийн байдалд тулгуурласан</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={downloadResult}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Татах
            </Button>
            <Button
              variant="outline"
              onClick={shareResult}
              className="flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Хуваалцах
            </Button>
          </div>
          
          <Button
            onClick={() => navigate("/dashboard")}
            className="w-full h-12 text-lg"
          >
            Нүүр хуудас руу буцах
          </Button>

          <Button
            variant="outline"
            onClick={() => navigate("/loan-eligibility")}
            className="w-full"
          >
            Дахин шинжлэх
          </Button>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-8 text-xs text-muted-foreground">
          <p>Үр дүн: {new Date(applicationData.applicationDate).toLocaleDateString('mn-MN')}</p>
          <p>Лавлах дугаар: {applicationData.referenceNumber}</p>
        </div>
      </div>
    </div>
  );
};