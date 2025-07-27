import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Shield, 
  LogOut, 
  Edit3,
  Settings,
  CreditCard,
  FileText
} from "lucide-react";

export const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem("simple_loan_user");
    return stored ? JSON.parse(stored) : {
      id: "1",
      name: "Болдбаатар",
      phone: "88001234",
      email: "bold@email.mn",
      joinedDate: new Date().toISOString(),
      creditScore: 750,
      totalLoans: 2,
      activeLoans: 1
    };
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem("simple_loan_user", JSON.stringify(userData));
    setIsEditing(false);
    toast({
      title: "Амжилттай хадгалагдлаа",
      description: "Таны мэдээлэл шинэчлэгдлээ",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("simple_loan_user");
    toast({
      title: "Амжилттай гарлаа",
      description: "Дахин уулзах хүртэл",
    });
    navigate("/");
  };

  return (
    <Layout title="Профайл">
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{userData.name}</h2>
                <p className="text-muted-foreground">+976 {userData.phone}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              size="sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              {isEditing ? "Цуцлах" : "Засах"}
            </Button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Нэр</Label>
                <Input
                  id="name"
                  value={userData.name}
                  onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="email">И-мэйл</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Хадгалах
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{userData.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Элссэн: {new Date(userData.joinedDate).toLocaleDateString('mn-MN')}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{userData.creditScore}</div>
            <div className="text-sm text-muted-foreground">Зээлийн үнэлгээ</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{userData.activeLoans}</div>
            <div className="text-sm text-muted-foreground">Идэвхтэй зээл</div>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Миний зээлүүд</div>
                  <div className="text-sm text-muted-foreground">Зээлийн түүх харах</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Харах
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Баримт бичиг</div>
                  <div className="text-sm text-muted-foreground">Гэрээ болон баримтууд</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Харах
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Аюулгүй байдал</div>
                  <div className="text-sm text-muted-foreground">Нууц үг, хуруугийн хээ</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Тохируулах
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Тохиргоо</div>
                  <div className="text-sm text-muted-foreground">Мэдэгдэл, хэл сонголт</div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                Тохируулах
              </Button>
            </div>
          </Card>
        </div>

        {/* Logout Button */}
        <Card className="p-4">
          <Button 
            onClick={handleLogout}
            variant="destructive" 
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Гарах
          </Button>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Simpleloan Mongolia v1.0</p>
          <p>© 2024 Бүх эрх хуулиар хамгаалагдсан</p>
        </div>
      </div>
    </Layout>
  );
};