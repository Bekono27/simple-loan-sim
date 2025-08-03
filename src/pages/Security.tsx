import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Lock, 
  Fingerprint, 
  Smartphone, 
  Eye, 
  EyeOff,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

export const Security = () => {
  usePageTitle("Fact Zeel - Security");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const { toast } = useToast();

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Алдаа гарлаа",
        description: "Шинэ нууц үг тохирохгүй байна",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Алдаа гарлаа",
        description: "Нууц үг дор хаяж 8 тэмдэгт байх ёстой",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Амжилттай",
      description: "Нууц үг амжилттай солигдлоо",
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Layout title="Аюулгүй байдал">
      <div className="p-4 space-y-6">
        {/* Security Status */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-600">Аюулгүй</h3>
              <p className="text-sm text-muted-foreground">Таны данс хамгаалагдсан байна</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Хоёр түвшний нотолгоо</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium">Хуруугийн хээ</p>
            </div>
          </div>
        </Card>

        {/* Password Change */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Нууц үг солих
          </h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Одоогийн нууц үг</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="new-password">Шинэ нууц үг</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="confirm-password">Нууц үг давтах</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            
            <Button onClick={handlePasswordChange} className="w-full">
              Нууц үг солих
            </Button>
          </div>
        </Card>

        {/* Biometric Authentication */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Fingerprint className="w-5 h-5" />
            Биометрик нотолгоо
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Хуруугийн хээгээр нэвтрэх</p>
                <p className="text-sm text-muted-foreground">Хуруугийн хээгээр апп нээх</p>
              </div>
              <Switch
                checked={biometricEnabled}
                onCheckedChange={setBiometricEnabled}
              />
            </div>
          </div>
        </Card>

        {/* Two-Factor Authentication */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Хоёр түвшний нотолгоо
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS код</p>
                <p className="text-sm text-muted-foreground">Утсанд SMS код илгээх</p>
              </div>
              <Switch
                checked={smsEnabled}
                onCheckedChange={setSmsEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">И-мэйл код</p>
                <p className="text-sm text-muted-foreground">И-мэйлээр код илгээх</p>
              </div>
              <Switch
                checked={emailEnabled}
                onCheckedChange={setEmailEnabled}
              />
            </div>
          </div>
        </Card>

        {/* Security Tips */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Аюулгүй байдлын зөвлөмж
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">Нууц үгээ хэн нэгэнд хэлж болохгүй</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">Хүчтэй нууц үг ашиглаарай (8+ тэмдэгт, тоо, үсэг)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">Нээлттэй wifi-д банкны үйлдэл бүү хийгээрэй</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
              <p className="text-sm">Хуруугийн хээ болон PIN код идэвхжүүлээрэй</p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};