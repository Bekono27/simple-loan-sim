import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, XCircle } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export const LoanResult = () => {
  usePageTitle("Fact Zeel - Loan Result");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-destructive/5 to-background">
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
          <h1 className="text-2xl font-bold">Зээлийн үр дүн</h1>
        </div>

        {/* Main Result Card */}
        <Card className="border-destructive bg-destructive/5 mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-destructive">Уучлаарай</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg font-medium">
              Танд зээл олгох боломжгүй боллоо
            </p>
            <p className="text-muted-foreground">
              Таны өгсөн мэдээллийг шинжилсэний дүнд зээлийн шалгуурыг хангаагүй байна.
            </p>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Дараагийн алхамууд</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>• Орлогоо нэмэгдүүлэх</p>
              <p>• Зээлийн түүхээ сайжруулах</p>
              <p>• Өрийн хэмжээгээ бууруулах</p>
              <p>• Хэдэн сарын дараа дахин оролдох</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
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
            Дахин оролдох
          </Button>
        </div>
      </div>
    </div>
  );
};