import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Settings, 
  Shield,
  Database,
  RefreshCw,
  AlertTriangle
} from "lucide-react";

export const AdminConfig = () => {
  const [loading, setLoading] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maxLoanAmount, setMaxLoanAmount] = useState("10000000");
  const [minLoanAmount, setMinLoanAmount] = useState("100000");
  const [defaultInterestRate, setDefaultInterestRate] = useState("15");
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admrstb");
      return;
    }

    const session = JSON.parse(adminSession);
    // Check if session is expired (24 hours)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("adminSession");
      navigate("/admrstb");
      return;
    }

    loadConfig();
  }, [navigate]);

  const loadConfig = () => {
    // Load configuration from localStorage (in a real app, this would come from database)
    const config = localStorage.getItem("adminConfig");
    if (config) {
      const parsedConfig = JSON.parse(config);
      setMaintenanceMode(parsedConfig.maintenanceMode || false);
      setMaxLoanAmount(parsedConfig.maxLoanAmount || "10000000");
      setMinLoanAmount(parsedConfig.minLoanAmount || "100000");
      setDefaultInterestRate(parsedConfig.defaultInterestRate || "15");
      setSessionTimeout(parsedConfig.sessionTimeout || "24");
    }
  };

  const saveConfig = () => {
    setLoading(true);
    
    const config = {
      maintenanceMode,
      maxLoanAmount,
      minLoanAmount,
      defaultInterestRate,
      sessionTimeout,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem("adminConfig", JSON.stringify(config));
    
    toast({
      title: "Амжилттай хадгаллаа",
      description: "Системийн тохиргоо шинэчлэгдлээ"
    });
    
    setLoading(false);
  };

  const resetToDefaults = () => {
    setMaintenanceMode(false);
    setMaxLoanAmount("10000000");
    setMinLoanAmount("100000");
    setDefaultInterestRate("15");
    setSessionTimeout("24");
    
    toast({
      title: "Анхны утга сэргээлээ",
      description: "Бүх тохиргоо анхны утга руу буцаалаа"
    });
  };

  const clearCache = () => {
    setLoading(true);
    
    // Clear all caches
    localStorage.removeItem("loanApplicationCache");
    localStorage.removeItem("paymentVerificationCache");
    localStorage.removeItem("userProfileCache");
    
    toast({
      title: "Cache цэвэрлэлээ",
      description: "Бүх түр хадгалагдсан өгөгдөл устгагдлаа"
    });
    
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate("/admrstb1")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Системийн тохиргоо</h1>
              <p className="text-muted-foreground">Админы панелийн тохиргоо удирдлага</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Системийн тохиргоо
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Засвар үйлчилгээний горим</Label>
                  <p className="text-sm text-muted-foreground">
                    Системийг түр хаах
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Сешн дуусах хугацаа (цаг)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  min="1"
                  max="168"
                />
              </div>
            </CardContent>
          </Card>

          {/* Loan Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Зээлийн тохиргоо
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="maxLoan">Хамгийн их зээлийн дүн (₮)</Label>
                <Input
                  id="maxLoan"
                  type="number"
                  value={maxLoanAmount}
                  onChange={(e) => setMaxLoanAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minLoan">Хамгийн бага зээлийн дүн (₮)</Label>
                <Input
                  id="minLoan"
                  type="number"
                  value={minLoanAmount}
                  onChange={(e) => setMinLoanAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interestRate">Анхны хүү (%)</Label>
                <Input
                  id="interestRate"
                  type="number"
                  value={defaultInterestRate}
                  onChange={(e) => setDefaultInterestRate(e.target.value)}
                  step="0.1"
                  min="0"
                  max="100"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>Системийн статус</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Суппабейс холболт</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Өгөгдлийн сан</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Файл хадгалалт</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <span>Засвар үйлчилгээ</span>
                <div className={`w-3 h-3 rounded-full ${maintenanceMode ? 'bg-red-500' : 'bg-green-500'}`}></div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Админы хэрэгслүүд
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={clearCache} 
                variant="outline" 
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Cache цэвэрлэх
              </Button>

              <Button 
                onClick={resetToDefaults} 
                variant="outline" 
                className="w-full"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Анхны утга сэргээх
              </Button>

              <Button 
                onClick={() => navigate("/admrstb6")} 
                variant="outline" 
                className="w-full"
              >
                Гүйлгээний тайлан
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button onClick={saveConfig} disabled={loading}>
            {loading ? "Хадгалж байна..." : "Хадгалах"}
          </Button>
          <Button variant="outline" onClick={() => navigate("/admrstb1")}>
            Буцах
          </Button>
        </div>
      </div>
    </div>
  );
};