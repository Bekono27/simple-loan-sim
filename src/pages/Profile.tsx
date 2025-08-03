import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { usePageTitle } from "@/hooks/use-page-title";
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
  FileText,
  Upload,
  Download
} from "lucide-react";

export const Profile = () => {
  usePageTitle("Fact Zeel - Profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData);
      }
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Профайл мэдээлэл ачаалахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Амжилттай хадгалагдлаа",
        description: "Таны мэдээлэл шинэчлэгдлээ",
      });
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Мэдээлэл хадгалахад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Амжилттай гарлаа",
        description: "Дахин уулзах хүртэл",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Гарахад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout title="Профайл">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

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
                <h2 className="text-xl font-bold">{profile?.full_name || profile?.username || 'Хэрэглэгч'}</h2>
                <p className="text-muted-foreground">{profile?.phone_number && `+976 ${profile.phone_number}`}</p>
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
                <Label htmlFor="name">Овог нэр</Label>
                <Input
                  id="name"
                  value={profile?.full_name || ''}
                  onChange={(e) => setProfile((prev: any) => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
                <Input
                  id="username"
                  value={profile?.username || ''}
                  onChange={(e) => setProfile((prev: any) => ({ ...prev, username: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Утасны дугаар</Label>
                <Input
                  id="phone"
                  value={profile?.phone_number || ''}
                  onChange={(e) => setProfile((prev: any) => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="register">Регистрийн дугаар</Label>
                <Input
                  id="register"
                  value={profile?.register_number || ''}
                  onChange={(e) => setProfile((prev: any) => ({ ...prev, register_number: e.target.value }))}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Хадгалах
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profile?.username || 'Тодорхойгүй'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{profile?.phone_number || 'Утас нэмэгдээгүй'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">
                  Элссэн: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('mn-MN') : 'Тодорхойгүй'}
                </span>
              </div>
              {profile?.register_number && (
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">РД: {profile.register_number}</span>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Факт зээлийн үнэлгээ</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">1</div>
            <div className="text-sm text-muted-foreground">Идэвхтэй факт зээл</div>
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
                  <div className="font-medium">Миний факт зээлүүд</div>
                  <div className="text-sm text-muted-foreground">Факт зээлийн түүх харах</div>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/documents")}>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/security")}>
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
                Тохируулах
              </Button>
            </div>
          </Card>

          {/* Terms and Conditions */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Үйлчилгээний нөхцөл</div>
                  <div className="text-sm text-muted-foreground">Гэрээ болон нууцлалын бодлого</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowTerms(true)}>
                Унших
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
          <p>FACT LLC - FACT Loan v1.0</p>
          <p>© 2025 Бүх эрх хуулиар хамгаалагдсан</p>
        </div>

        {/* Terms and Conditions Dialog */}
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Үйлчилгээний нөхцөл болон Нууцлалын бодлого</DialogTitle>
              <DialogDescription>
                Сүүлд шинэчлэгдсэн: 2025 оны 8 сар
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">1. Бидний цуглуулах мэдээлэл</h4>
                <p>• Нэр, и-мэйл, холбоо барих мэдээлэл</p>
                <p>• Банкны хуулга (факт зээлийн боломж тооцоолоход)</p>
                <p>• Төхөөрөмжийн мэдээлэл аюулгүй байдалд</p>
              </div>
              
              <div>
                <h4 className="font-semibold">2. Мэдээлэл ашиглалт</h4>
                <p>• Факт зээлийн боломжийн тооцоолол (зөвхөн мэдээлэл зорилгоор)</p>
                <p>• Гуравдагч талд зөвшөөрөлгүйгээр өгөхгүй</p>
                <p>• Таны мэдээллийг зарахгүй эсвэл буруу ашиглахгүй</p>
              </div>

              <div>
                <h4 className="font-semibold">3. Факт зээлийн үйлчилгээний талаар</h4>
                <p>• Энэ нь зөвхөн мэдээллийн үйлчилгээ</p>
                <p>• Бид бодит зээл олгодоггүй</p>
                <p>• Үр дүн нь зөвхөн танин мэдэхүйн зорилготой</p>
                <p>• Төлбөр нь шинжилгээний зардал болон системийн хөгжүүлэлтэд зарцуулагдана</p>
              </div>

              <div>
                <h4 className="font-semibold">4. Мэдээлэл хадгалалт</h4>
                <p>• Таны мэдээллийг аюулгүй шифрлэлттэйгээр хадгална</p>
                <p>• Зөвхөн эрх бүхий хүмүүст хандах эрх</p>
                <p>• Мэдээлэл задруулах, алдагдахаас хамгаална</p>
              </div>

              <div>
                <h4 className="font-semibold">5. Таны эрх</h4>
                <p>• Хүссэн үедээ мэдээллээ устгуулах эрхтэй</p>
                <p>• Мэдээллээ засварлах, шинэчлэх эрхтэй</p>
                <p>• Асуудал гарвал adfactloan@gmail.com хандана уу</p>
                <p>• Тусламжийн утас: +976 72100627</p>
              </div>

              <div>
                <h4 className="font-semibold">6. Төлбөрийн нөхцөл</h4>
                <p>• Факт зээлийн тооцоололын төлбөр: 3,000₮</p>
                <p>• Энэ төлбөр нь зөвхөн системийн шинжилгээнд ашиглагдана</p>
                <p>• Төлбөр нь буцаагдахгүй</p>
                <p>• Шинжилгээ эхлэсний дараа бүх төлбөр буцаагдахгүй</p>
              </div>

              <div>
                <h4 className="font-semibold">7. Аюулгүй байдал</h4>
                <p>• Нууц үг нь хүчтэй байх ёстой (8+ тэмдэгт, том/жижиг үсэг, тоо, тусгай тэмдэгт)</p>
                <p>• Нэвтрэх мэдээллээ хэзээ ч хуваалцахгүй</p>
                <p>• Хуурамч вэбсайтаас болгоомжилж байна уу</p>
                <p>• Албан ёсны домэйн: factloan.mn</p>
              </div>

              <div>
                <h4 className="font-semibold">8. Хариуцлагын хязгаарлалт</h4>
                <p>• FACT LLC нь зөвхөн мэдээллийн үйлчилгээ үзүүлдэг</p>
                <p>• Бодит зээлийн асуудлаар хариуцлага хүлээхгүй</p>
                <p>• Тооцоололын үр дүн нь зөвхөн лавлах мэдээлэл</p>
              </div>
            </div>
            <Button onClick={() => setShowTerms(false)} className="w-full">
              Ойлголоо
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};