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
          <h1 className="text-3xl font-bold text-foreground mb-2">Простой Зээл</h1>
          <p className="text-lg text-muted-foreground">Зээлийн боломжийг шалгах платформ</p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-12">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Хурдан шалгалт</h3>
                <p className="text-sm text-muted-foreground">Зээлийн боломжийг хурдан мэдээрэй</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">P2P зээл</h3>
                <p className="text-sm text-muted-foreground">Хүмүүсийн хооронд зээл</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Аюулгүй мэдээлэл</h3>
                <p className="text-sm text-muted-foreground">Зөвхөн боломжийн талаар мэдээлэл</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/login")}
            className="w-full h-12 text-lg font-medium"
          >
            Нэвтрэх
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate("/signup")}
            className="w-full h-12 text-lg font-medium"
          >
            Бүртгүүлэх
          </Button>
        </div>

        {/* Footer Links */}
        <div className="flex justify-center gap-6 mt-8 text-sm">
          <button 
            onClick={() => navigate("/faq")}
            className="text-muted-foreground hover:text-foreground"
          >
            Асуулт хариулт
          </button>
          <button 
            onClick={() => navigate("/support")}
            className="text-muted-foreground hover:text-foreground"
          >
            Тусламж
          </button>
        </div>
      </div>
    </div>
  );
};