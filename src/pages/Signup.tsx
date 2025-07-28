import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Camera, ArrowLeft } from "lucide-react";

export const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    fullName: "",
    profilePicture: null as File | null
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, profilePicture: file }));
  };

  const handleSignup = () => {
    if (!formData.username || !formData.password || !formData.email || !formData.fullName) {
      toast({
        title: "Алдаа",
        description: "Бүх шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive"
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Алдаа", 
        description: "Үйлчилгээний нөхцөл болон нууцлалын бодлогыг зөвшөөрнө үү",
        variant: "destructive"
      });
      return;
    }

    // Store user data in localStorage
    const userData = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName,
      profilePicture: formData.profilePicture?.name || null,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem("currentUser", JSON.stringify(userData));
    
    toast({
      title: "Амжилттай",
      description: "Бүртгэл амжилттай үүслээ"
    });

    navigate("/dashboard");
  };

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
          <h1 className="text-2xl font-bold">Бүртгүүлэх</h1>
        </div>

        <Card className="neu-card">
          <CardHeader>
            <CardTitle className="text-center">Шинэ данс үүсгэх</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-2">
                  {formData.profilePicture ? (
                    <img
                      src={URL.createObjectURL(formData.profilePicture)}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-20 h-20 opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-sm text-muted-foreground">Профайл зураг (заавал биш)</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="fullName">Бүтэн нэр *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Таны бүтэн нэр"
                />
              </div>

              <div>
                <Label htmlFor="username">Хэрэглэгчийн нэр *</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                />
              </div>

              <div>
                <Label htmlFor="email">Имэйл хаяг *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">Нууц үг *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
              />
              <Label htmlFor="terms" className="text-sm leading-5">
                Би{" "}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-primary underline"
                >
                  Үйлчилгээний нөхцөл болон Нууцлалын бодлого
                </button>
                -тай зөвшөөрч байна
              </Label>
            </div>

            <Button onClick={handleSignup} className="w-full">
              Бүртгүүлэх
            </Button>

            <div className="text-center">
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Аль хэдийн данстай юу? Нэвтрэх
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Terms Modal */}
        {showTerms && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="max-w-md max-h-[80vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Үйлчилгээний нөхцөл ба Нууцлалын бодлого</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Нууцлалын бодлого</h4>
                  <p>Бид таны хувийн мэдээллийг хамгаалж, аюулгүй хадгалахад тууштай байна.</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">1. Цуглуулдаг мэдээлэл</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Нэр, имэйл, холбоо барих мэдээлэл</li>
                    <li>Банкны хуулга (зээлийн чадварын шинжилгээнд)</li>
                    <li>Төхөөрөмжийн мэдээлэл (аюулгүй байдлын зорилгоор)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium mb-2">2. Мэдээллийн ашиглалт</h4>
                  <p>Зөвхөн зээлийн чадварын шинжилгээ хийх зорилгоор ашиглана. Бид таны мэдээллийг гуравдахь этгээдэд дамжуулдаггүй.</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">3. Анхааруулга</h4>
                  <p className="font-medium text-warning">Бид зээл олгодоггүй. Зөвхөн мэдээллийн зорилгоор шинжилгээ хийдэг. Төлбөр нь буцаагддаггүй.</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Үйлчилгээний нөхцөл</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Төлбөр (5,000₮) нь зөвхөн шинжилгээний зардал</li>
                    <li>Бид зээл олгохыг баталгаажуулдаггүй</li>
                    <li>Үр дүн нь зөвхөн мэдээллийн зорилготой</li>
                    <li>Төлбөр буцаагддаггүй</li>
                  </ul>
                </div>

                <Button onClick={() => setShowTerms(false)} className="w-full">
                  Ойлгосон
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};