import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Mail, Lock, Phone, Calendar, IdCard, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("email");

  const [loginData, setLoginData] = useState({
    email: "",
    phone: "",
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
      let authData;
      if (authMethod === "phone") {
        // Validate Mongolian phone number (8 digits)
        if (!/^\d{8}$/.test(loginData.phone)) {
          toast({
            title: "Алдаа гарлаа",
            description: "Утасны дугаар 8 оронтой байх ёстой",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
        authData = {
          phone: `+976${loginData.phone}`,
          password: loginData.password,
        };
      } else {
        authData = {
          email: loginData.email,
          password: loginData.password,
        };
      }

      const { error } = await supabase.auth.signInWithPassword(authData);

      if (error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message === "Invalid login credentials" 
            ? authMethod === "phone" ? "Утас эсвэл нууц үг буруу байна" : "И-мэйл эсвэл нууц үг буруу байна"
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

    // Validate phone number if using phone auth
    if (authMethod === "phone" && !/^\d{8}$/.test(signupData.phoneNumber)) {
      toast({
        title: "Алдаа гарлаа",
        description: "Утасны дугаар 8 оронтой байх ёстой",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      let authData;
      if (authMethod === "phone") {
        authData = {
          phone: `+976${signupData.phoneNumber}`,
          password: signupData.password,
          options: {
            data: {
              username: signupData.username,
              full_name: signupData.fullName,
              birth_date: signupData.birthDate,
              register_number: signupData.registerNumber,
              phone_number: signupData.phoneNumber,
            }
          }
        };
      } else {
        authData = {
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
        };
      }

      const { error } = await supabase.auth.signUp(authData);

      if (error) {
        toast({
          title: "Алдаа гарлаа",
          description: error.message === "User already registered" 
            ? authMethod === "phone" ? "Энэ утасны дугаараар аль хэдийн бүртгүүлсэн байна" : "Энэ и-мэйл хаягаар аль хэдийн бүртгүүлсэн байна"
            : "Бүртгэлд алдаа гарлаа",
          variant: "destructive"
        });
      } else {
        if (authMethod === "phone") {
          toast({
            title: "Амжилттай бүртгэгдлээ",
            description: "Зээлийн тооцоолол хийхээс өмнө баталгаажуулна уу"
          });
          navigate("/loan-eligibility");
        } else {
          toast({
            title: "Амжилттай бүртгэгдлээ",
            description: "И-мэйл хаягаа шалгаад баталгаажуулна уу"
          });
        }
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
          <h1 className="text-3xl font-bold text-primary">FACT Loan</h1>
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
                  <div className="space-y-3">
                    <Label>Нэвтрэх арга</Label>
                    <RadioGroup value={authMethod} onValueChange={(value: "email" | "phone") => setAuthMethod(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="email-method" />
                        <Label htmlFor="email-method">И-мэйл хаяг</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="phone-method" />
                        <Label htmlFor="phone-method">Утасны дугаар (8 орон, Монгол)</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {authMethod === "email" ? (
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
                          required={authMethod === "email"}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Утасны дугаар</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <div className="flex">
                          <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">+976</span>
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="12345678"
                            className="rounded-l-none"
                            maxLength={8}
                            value={loginData.phone}
                            onChange={(e) => setLoginData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))}
                            required={authMethod === "phone"}
                          />
                        </div>
                      </div>
                    </div>
                  )}

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
                  <div className="space-y-3">
                    <Label>Бүртгүүлэх арга</Label>
                    <RadioGroup value={authMethod} onValueChange={(value: "email" | "phone") => setAuthMethod(value)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="email" id="signup-email-method" />
                        <Label htmlFor="signup-email-method">И-мэйл хаяг</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="phone" id="signup-phone-method" />
                        <Label htmlFor="signup-phone-method">Утасны дугаар (8 орон, Монгол)</Label>
                      </div>
                    </RadioGroup>
                  </div>

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

                  {authMethod === "email" ? (
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
                          required={authMethod === "email"}
                        />
                      </div>
                    </div>
                  ) : null}

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
                      <div className="flex">
                        <span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-muted-foreground">+976</span>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="12345678"
                          className="rounded-l-none"
                          maxLength={8}
                          value={signupData.phoneNumber}
                          onChange={(e) => setSignupData(prev => ({ ...prev, phoneNumber: e.target.value.replace(/\D/g, '') }))}
                          required={authMethod === "phone"}
                        />
                      </div>
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
                        Үйлчилгээний нөхцөл, Нууцлалын бодлого болон төлбөрийн нөхцөл
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
                <h4 className="font-semibold">5. Төлбөрийн нөхцөл</h4>
                <p>• Зээлийн тооцоололын төлбөр: 3,000₮</p>
                <p>• Энэ төлбөр нь зөвхөн зээлийн боломжийн шинжилгээнд ашиглагдана</p>
                <p>• Төлбөр нь буцаагдахгүй</p>
                <p>• Шинжилгээ эхлэсний дараа бүх төлбөр буцаагдахгүй</p>
              </div>

              <div>
                <h4 className="font-semibold">6. Утасны дугаараар бүртгэл</h4>
                <p>• Утасны дугаараар бүртгүүлэхэд 8 оронтой дугаар ашиглана</p>
                <p>• Зөвхөн Монгол улсын утасны дугаар хүлээн зөвшөөрөгдөнө</p>
                <p>• Зээлийн тооцоололын өмнө баталгаажуулалт шаардлагатай</p>
              </div>

              <div>
                <h4 className="font-semibold">Үйлчилгээний нөхцөл</h4>
                <p>Энэ үйлчилгээг ашигласнаар та дараах зүйлийг зөвшөөрч байна:</p>
                <p>• Төлбөр (3,000₮) нь зөвхөн зээлийн боломжийн шинжилгээнд</p>
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