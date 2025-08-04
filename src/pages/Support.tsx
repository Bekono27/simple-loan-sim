import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";
import { usePageTitle } from "@/hooks/use-page-title";

export const Support = () => {
  usePageTitle("Fact Zeel - Support");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Мэдээлэл дутуу байна",
        description: "Шаардлагатай талбаруудыг бөглөнө үү",
        variant: "destructive"
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Мессеж илгээгдлээ!",
      description: "Бид 24 цагийн дотор хариулах болно",
    });

    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <Layout title="Тусламж">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Мессеж илгээгдлээ!</h2>
            <p className="text-muted-foreground mb-4">
              Бидэнтэй холбогдсонд баярлалаа. Манай тусламжийн баг 24 цагийн дотор хариулах болно.
            </p>
            <p className="text-sm text-muted-foreground">
              Удахгүй баталгаажуулах имэйл хүлээн авах болно.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Тусламж">
      <div className="p-4 space-y-6">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Тусламж авах</h1>
          <p className="text-muted-foreground">Бид таны асуулт болон асуудалд туслахад бэлэн байна</p>
        </Card>

        {/* Contact Methods */}
        <div className="space-y-3">
          <h3 className="font-semibold">Бидэнтэй холбогдох</h3>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Холбоо барих</div>
                <div className="text-sm text-muted-foreground"> 72100627 (24/7)</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Имэйл тусламж</div>
                <div className="text-sm text-muted-foreground">adfactloan@gmail.com</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Хариу өгөх хугацаа</div>
                <div className="text-sm text-muted-foreground">24 цагийн дотор</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Бидэнд мессеж илгээх</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Нэр *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Таны нэр"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Имэйл *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="таны@имэйл.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Гарчиг</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Таны асуудлын товч тодорхойлолт"
              />
            </div>

            <div>
              <Label htmlFor="message">Мессеж *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Таны асуудал эсвэл асуултыг дэлгэрэнгүй бичнэ үү..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Мессеж илгээх
            </Button>
          </form>
        </Card>

        {/* Common Issues */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Түгээмэл асуудлууд</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Зээлийн хүсэлтийн төлөв</span>
              <span className="text-muted-foreground">шалгах</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Төлбөр баталгаажуулах</span>
              <span className="text-muted-foreground">24-48 цаг</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Хувийн мэдээлэл шинэчлэх</span>
              <span className="text-muted-foreground">72100627</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Техникийн асуудал</span>
              <span className="text-muted-foreground">adfactloan@gmail.com</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};