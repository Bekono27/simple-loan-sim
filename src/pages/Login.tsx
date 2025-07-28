import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, User, Lock } from "lucide-react";

export const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчийн нэр болон нууц үгээ оруулна уу",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      // Check if user exists in localStorage (simple simulation)
      const existingUser = localStorage.getItem("currentUser");
      
      if (existingUser) {
        const userData = JSON.parse(existingUser);
        if (userData.username === formData.username) {
          localStorage.setItem("isLoggedIn", "true");
          toast({
            title: "Амжилттай",
            description: "Тавтай морилно уу!"
          });
          navigate("/dashboard");
        } else {
          toast({
            title: "Алдаа",
            description: "Хэрэглэгчийн нэр эсвэл нууц үг буруу байна",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Алдаа", 
          description: "Бүртгэлгүй хэрэглэгч байна. Эхлээд бүртгүүлнэ үү",
          variant: "destructive"
        });
      }
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-md mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Нэвтрэх</h1>
        </div>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="text-center">Дансанд нэвтрэх</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Username */}
            <div>
              <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Хэрэглэгчийн нэр"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Нууц үг</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="pl-10"
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full h-12 text-lg"
            >
              {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
            </Button>

            {/* Divider */}
            <div className="text-center">
              <span className="text-muted-foreground">эсвэл</span>
            </div>

            {/* Signup Button */}
            <Button
              variant="outline"
              onClick={() => navigate("/signup")}
              className="w-full h-12 text-lg"
            >
              Шинэ данс үүсгэх
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground">
                Нууц үг мартсан уу?
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};