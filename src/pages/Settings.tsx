import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePageTitle } from "@/hooks/use-page-title";
import { 
  Settings as SettingsIcon, 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  Volume2, 
  Vibrate,
  Mail,
  MessageSquare,
  CreditCard,
  Shield,
  HelpCircle,
  Star
} from "lucide-react";

export const Settings = () => {
  usePageTitle("Fact Zeel - Settings");
  const [language, setLanguage] = useState("mn");
  const [theme, setTheme] = useState("system");
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loanAlerts, setLoanAlerts] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Тохиргоо хадгалагдлаа",
      description: "Таны тохиргоо амжилттай хадгалагдлаа",
    });
  };

  return (
    <Layout title="Тохиргоо">
      <div className="p-4 space-y-6">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            Ерөнхий тохиргоо
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4" />
                <label className="font-medium">Хэл</label>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Хэл сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mn">Монгол</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4" />
                <label className="font-medium">Харагдац</label>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue placeholder="Харагдац сонгох" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Цагаан</SelectItem>
                  <SelectItem value="dark">Хар</SelectItem>
                  <SelectItem value="system">Системийн дагуу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Мэдэгдлийн тохиргоо
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <div>
                  <p className="font-medium">Push мэдэгдэл</p>
                  <p className="text-sm text-muted-foreground">Апп дээр мэдэгдэл харуулах</p>
                </div>
              </div>
              <Switch
                checked={pushNotifications}
                onCheckedChange={setPushNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <div>
                  <p className="font-medium">И-мэйл мэдэгдэл</p>
                  <p className="text-sm text-muted-foreground">И-мэйлээр мэдэгдэл илгээх</p>
                </div>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <div>
                  <p className="font-medium">SMS мэдэгдэл</p>
                  <p className="text-sm text-muted-foreground">Утсанд SMS илгээх</p>
                </div>
              </div>
              <Switch
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
              />
            </div>
          </div>
        </Card>

        {/* Loan & Payment Settings */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Зээл ба төлбөрийн мэдэгдэл
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Зээлийн статус мэдэгдэл</p>
                <p className="text-sm text-muted-foreground">Зээлийн хүсэлтийн явцын талаар</p>
              </div>
              <Switch
                checked={loanAlerts}
                onCheckedChange={setLoanAlerts}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Төлбөрийн сануулга</p>
                <p className="text-sm text-muted-foreground">Төлбөрийн хуваарийн сануулга</p>
              </div>
              <Switch
                checked={paymentReminders}
                onCheckedChange={setPaymentReminders}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Маркетингийн и-мэйл</p>
                <p className="text-sm text-muted-foreground">Шинэ бүтээгдэхүүн, урамшуулал</p>
              </div>
              <Switch
                checked={marketingEmails}
                onCheckedChange={setMarketingEmails}
              />
            </div>
          </div>
        </Card>

        {/* Sound & Vibration */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5" />
            Дуу ба чичиргээ
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                <div>
                  <p className="font-medium">Дуу</p>
                  <p className="text-sm text-muted-foreground">Мэдэгдлийн дуу</p>
                </div>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Vibrate className="w-4 h-4" />
                <div>
                  <p className="font-medium">Чичиргээ</p>
                  <p className="text-sm text-muted-foreground">Мэдэгдлийн чичиргээ</p>
                </div>
              </div>
              <Switch
                checked={vibrationEnabled}
                onCheckedChange={setVibrationEnabled}
              />
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Хурдан холбоос</h3>
          
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <Shield className="w-4 h-4 mr-2" />
              Аюулгүй байдал
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="w-4 h-4 mr-2" />
              Тусламж ба дэмжлэг
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Star className="w-4 h-4 mr-2" />
              Апп-г үнэлэх
            </Button>
          </div>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSaveSettings} className="w-full">
          Тохиргоо хадгалах
        </Button>

        {/* App Version */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Simple Loan v1.0.0</p>
          <p>© 2024 Бүх эрх хуулиар хамгаалагдсан</p>
        </div>
      </div>
    </Layout>
  );
};