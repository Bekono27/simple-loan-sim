import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Mail, Lock, Phone, Calendar, IdCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [signupData, setSignupData] = useState({
    email: "",
    password: "",
    username: "",
    fullName: "",
    birthDate: "",
    registerNumber: "",
    phoneNumber: ""
  });

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message === "Invalid login credentials" 
            ? "И-мэйл эсвэл нууц үг буруу байна"
            : "Нэвтрэхэд алдаа гарлаа",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Амжилттай нэвтэрлээ",
          description: "Тавтай морилно уу!"
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Нэвтрэхэд алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agreedToTerms) {
      toast({
        title: "Анхаар",
        description: "Үйлчилгээний нөхцөлийг зөвшөөрөх шаардлагатай",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            username: signupData.username,
            full_name: signupData.fullName,
            birth_date: signupData.birthDate,
            register_number: signupData.registerNumber,
            phone_number: signupData.phoneNumber,
          }
        }
      });

      if (error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message === "User already registered" 
            ? "Энэ и-мэйл хаягаар аль хэдийн бүртгүүлсэн байна"
            : "Бүртгэлд алдаа гарлаа",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Амжилттай бүртгэгдлээ",
          description: "И-мэйл хаягаа шалгаад баталгаажуулна уу"
        });
      }
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Бүртгэлд алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Простой Зээл</h1>
          <p className="text-muted-foreground mt-2">Таны зээлийн платформд тавтай морилно уу</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Нэвтрэх</TabsTrigger>
            <TabsTrigger value="signup">Бүртгүүлэх</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Нэвтрэх</CardTitle>
                <CardDescription>
                  И-мэйл хаяг болон нууц үгээ оруулна уу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">И-мэйл хаяг</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Нууц үг</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Нэвтрэх
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Бүртгүүлэх</CardTitle>
                <CardDescription>
                  Шинэ данс үүсгэхээр бүртгэлийн мэдээллээ бөглөнө үү
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="username"
                          placeholder="username"
                          className="pl-10"
                          value={signupData.username}
                          onChange={(e) => setSignupData(prev => ({ ...prev, username: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fullName">Бүтэн нэр</Label>
                      <Input
                        id="fullName"
                        placeholder="Нэр овог"
                        value={signupData.fullName}
                        onChange={(e) => setSignupData(prev => ({ ...prev, fullName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">И-мэйл хаяг</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        value={signupData.email}
                        onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Нууц үг</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={signupData.password}
                        onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Төрсөн огноо</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="birthDate"
                          type="date"
                          className="pl-10"
                          value={signupData.birthDate}
                          onChange={(e) => setSignupData(prev => ({ ...prev, birthDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registerNumber">Регистрийн дугаар</Label>
                      <div className="relative">
                        <IdCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="registerNumber"
                          placeholder="УА12345678"
                          className="pl-10"
                          value={signupData.registerNumber}
                          onChange={(e) => setSignupData(prev => ({ ...prev, registerNumber: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Утасны дугаар</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        placeholder="99123456"
                        className="pl-10"
                        value={signupData.phoneNumber}
                        onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Би{" "}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-primary underline"
                      >
                        Үйлчилгээний нөхцөл болон Нууцлалын бодлого
                      </button>
                      -той зөвшөөрч байна
                    </label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Бүртгүүлэх
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-muted-foreground"
          >
            ← Буцах
          </Button>
        </div>

        {/* Terms and Conditions Dialog */}
        <Dialog open={showTerms} onOpenChange={setShowTerms}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Үйлчилгээний нөхцөл болон Нууцлалын бодлого</DialogTitle>
              <DialogDescription>
                Сүүлд шинэчлэгдсэн: 2025 оны 1 сар
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">1. Бидний цуглуулах мэдээлэл</h4>
                <p>• Нэр, и-мэйл, холбоо барих мэдээлэл</p>
                <p>• Банкны хуулга (зээлийн боломж тооцоолоход)</p>
                <p>• Төхөөрөмжийн мэдээлэл аюулгүй байдалд</p>
              </div>
              
              <div>
                <h4 className="font-semibold">2. Мэдээлэл ашиглалт</h4>
                <p>• Зээлийн боломжийн тооцоолол (зөвхөн мэдээлэл зорилгоор)</p>
                <p>• Гуравдагч талд зөвшөөрөлгүйгээр өгөхгүй</p>
                <p>• Таны мэдээллийг зарахгүй эсвэл буруу ашиглахгүй</p>
              </div>

              <div>
                <h4 className="font-semibold">3. Мэдээлэл хадгалалт</h4>
                <p>• Таны мэдээллийг аюулгүй шифрлэлттэйгээр хадгална</p>
                <p>• Зөвхөн эрх бүхий хүмүүст хандах эрх</p>
              </div>

              <div>
                <h4 className="font-semibold">4. Таны эрх</h4>
                <p>• Хүссэн үедээ мэдээллээ устгуулах эрхтэй</p>
                <p>• Асуудал гарвал [и-мэйл/холбоо]-д хандана уу</p>
              </div>

              <div>
                <h4 className="font-semibold">5. Татгалзал</h4>
                <p>• Бид зээл олгодоггүй. Зөвхөн мэдээлэл өгөх зорилготой.</p>
                <p>• Төлбөр (5,000₮) нь шинжилгээний ажлын төлөө.</p>
                <p>• Бүх төлбөр буцаагдахгүй.</p>
              </div>

              <div>
                <h4 className="font-semibold">Үйлчилгээний нөхцөл</h4>
                <p>Энэ үйлчилгээг ашигласнаар та дараах зүйлийг зөвшөөрч байна:</p>
                <p>• Төлбөр (5,000₮) нь зөвхөн зээлийн боломжийн шинжилгээнд</p>
                <p>• Бид зээл олгохгүй эсвэл баталгаа өгөхгүй</p>
                <p>• Шинжилгээний үр дүн зөвхөн мэдээлэл зорилготой</p>
                <p>• Шинжилгээ эхлэсний дараа бүх төлбөр буцаагдахгүй</p>
              </div>
            </div>
            <Button onClick={() => setShowTerms(false)} className="w-full">
              Ойлголоо
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};