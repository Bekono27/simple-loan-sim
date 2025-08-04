import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export const LoanResult = () => {
  usePageTitle("Fact Zeel - Loan Result");
  const navigate = useNavigate();

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
          <h1 className="text-2xl font-bold">Зээлийн үр дүн</h1>
        </div>

        {/* Processing Status */}
        <Card className="border-primary bg-primary/5 mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <CardTitle className="text-2xl text-primary">Түр Хүлээнэ үү</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg font-medium">
              Таны зээлийн хүсэлтийг шинжилж байна
            </p>
            <p className="text-muted-foreground">
              Ажилтан таны төлбөрийг шалгаад хариу өгөх болно.
            </p>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Үйл явцын дараалал</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Хүсэлт илгээгдсэн</p>
                <p className="text-xs text-muted-foreground">Таны мэдээлэлийг хүлээн авлаа</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center animate-pulse">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-medium text-sm">Төлбөр шалгаж байна</p>
                <p className="text-xs text-muted-foreground">30 минутын дотор шалгах болно</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Ажилтан шалгах</p>
                <p className="text-xs text-muted-foreground">Зөвшөөрөх эсэхийг шийдэх</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                <Clock className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm text-muted-foreground">Эцсийн хариу</p>
                <p className="text-xs text-muted-foreground">Апп дээр мэдэгдэл ирнэ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="border-warning bg-warning/5 mb-6">
          <CardContent className="pt-6">
            <h3 className="font-medium mb-3">Чухал мэдээлэл</h3>
            <div className="text-sm space-y-2 text-muted-foreground">
              <p>• Төлбөрийн шалгалт 30 минут хүртэл үргэлжилнэ</p>
              <p>• Админ таны хүсэлтийг дэлгэрэнгүй шалгана</p>
              <p>• Эцсийн хариу апп дээр мэдэгдэл болон ирнэ</p>
              <p>• Утсаа үргэлж асаалттай байлгана уу</p>
              <p>• Энэ төлбөр нь зөвхөн таны зээлийн мэдээлэлийг шалгахад ашиглагдах болно.</p>
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