import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ShoppingCart, CheckCircle, Store } from "lucide-react";
import { usePageTitle } from "@/hooks/use-page-title";

const mockPhones = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    brand: "Apple",
    price: 2800000,
    image: "📱"
  },
  {
    id: "2", 
    name: "Samsung Galaxy S24",
    brand: "Samsung",
    price: 1800000,
    image: "📱"
  },
  {
    id: "3",
    name: "iPhone 14",
    brand: "Apple", 
    price: 2200000,
    image: "📱"
  }
];

export const SimpleBuy = () => {
  usePageTitle("Fact Zeel - Simple Buy");
  const [selectedPhone, setSelectedPhone] = useState<any>(null);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const { toast } = useToast();

  const handlePhoneSelect = (phone: any) => {
    setSelectedPhone(phone);
    setShowComingSoon(true);
    toast({
      title: "Удахгүй",
      description: `${phone.name} худалдан авах боломж удахгүй нээгдэнэ`,
    });

    setTimeout(() => {
      setShowComingSoon(false);
      setSelectedPhone(null);
    }, 3000);
  };

  if (showComingSoon) {
    return (
      <Layout title="Удахгүй">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Удахгүй!</h2>
            <p className="text-muted-foreground mb-4">
              {selectedPhone?.name} худалдан авах боломж удахгүй нээгдэнэ
            </p>
            <p className="text-sm text-muted-foreground">
              Мэдэгдэл авахын тулд бидэнтэй холбогдоорой
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Энгийн Худалдаа">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Fact shop</h1>
          <p className="text-muted-foreground">Утас худалдан аваад дараа нь хуваан төлөөрэй</p>
          <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary">
            Удахгүй нээгдэнэ
          </Badge>
        </Card>

        {/* Coming Soon Notice */}
        <Card className="p-4 text-center bg-primary/5">
          <h3 className="font-semibold mb-3 text-primary">Удахгүй нээгдэнэ!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Утасны худалдаа хуваан төлөх үйлчилгээ удахгүй эхлэнэ. 
            Дараах утаснуудыг худалдан авах боломжтой болно.
          </p>
        </Card>

        {/* Featured Phones */}
        <div>
          <h3 className="font-semibold mb-4">Удахгүй худалдаалагдах утаснууд</h3>
          <div className="space-y-3">
            {mockPhones.map((phone) => (
              <Card key={phone.id} className="p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                      {phone.image}
                    </div>
                    <div>
                      <div className="font-medium">{phone.name}</div>
                      <div className="text-sm text-muted-foreground">{phone.brand}</div>
                      <div className="text-sm">
                        <span className="font-semibold">₮{phone.price.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePhoneSelect(phone)}
                    size="sm"
                    variant="outline"
                  >
                    Удахгүй
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Notice */}
        <Card className="p-4 text-center">
          <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium mb-2">Мэдэгдэл авахыг хүсэж байна уу?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Утасны худалдаа эхлэх үед мэдэгдэл авахын тулд холбогдоорой
          </p>
          <Badge variant="outline">Удахгүй эхлэнэ</Badge>
        </Card>
      </div>
    </Layout>
  );
};