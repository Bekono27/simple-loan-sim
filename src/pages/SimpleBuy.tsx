import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QrCode, ShoppingCart, CheckCircle, Store } from "lucide-react";

const mockMerchants = [
  {
    id: "1",
    name: "Техник Ертөнц",
    item: "iPhone 15 Pro",
    price: 2500000,
    image: "📱"
  },
  {
    id: "2", 
    name: "Загварын Төв",
    item: "Өвлийн куртка",
    price: 180000,
    image: "🧥"
  },
  {
    id: "3",
    name: "Гэрийн хэрэгсэл",
    item: "Кофе машин",
    price: 320000,
    image: "☕"
  }
];

export const SimpleBuy = () => {
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);
  const [showQR, setShowQR] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const { toast } = useToast();

  const handlePurchase = (merchant: any) => {
    setSelectedMerchant(merchant);
    setShowQR(true);
  };

  const handlePaymentComplete = () => {
    setPurchaseComplete(true);
    toast({
      title: "Худалдан авалт амжилттай!",
      description: `Та ${selectedMerchant.item} Энгийн Худалдаа-аар худалдан авлаа`,
    });

    setTimeout(() => {
      setShowQR(false);
      setPurchaseComplete(false);
      setSelectedMerchant(null);
    }, 3000);
  };

  if (purchaseComplete) {
    return (
      <Layout title="Худалдан авалт дууслаа">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Худалдан авалт амжилттай!</h2>
            <p className="text-muted-foreground mb-4">
              Та {selectedMerchant?.name}-аас {selectedMerchant?.item} амжилттай худалдан авлаа
            </p>
            <p className="text-sm text-muted-foreground">
              Төлбөрийн хуваарийн дагуу сануулга илгээх болно
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showQR && selectedMerchant) {
    return (
      <Layout title="Энгийн Худалдааны төлбөр">
        <div className="p-4">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Худалдан авалт дуусгах</h2>
              <p className="text-muted-foreground">QR кодыг худалдагчид үзүүлнэ үү</p>
            </div>

            {/* Mock QR Code */}
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-muted mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-orange-600 via-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <div className="text-white text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-2" />
                  <p className="text-sm">Simple Buy QR</p>
                  <p className="text-xs">₮{selectedMerchant.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                <span className="text-muted-foreground">Худалдагч</span>
                <span className="font-semibold">{selectedMerchant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Бүтээгдэхүүн</span>
                <span className="font-semibold">{selectedMerchant.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Нийт дүн</span>
                <span className="font-semibold">₮{selectedMerchant.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сарын төлбөр</span>
                <span className="font-semibold">₮{Math.round(selectedMerchant.price / 6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Хугацаа</span>
                <span className="font-semibold">6 сар</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handlePaymentComplete}
                className="w-full"
              >
                Худалдагч төлбөр баталгаажуулсан
              </Button>
              <Button 
                onClick={() => setShowQR(false)}
                variant="outline"
                className="w-full"
              >
                Цуцлах
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              Энэ бол Энгийн Худалдааны функцийг турших туршилтын QR код
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
          <h1 className="text-2xl font-bold mb-2">Энгийн Худалдаа</h1>
          <p className="text-muted-foreground">Одоо худалдан аваад дараа нь хуваан төлөөрэй</p>
          <Badge variant="secondary" className="mt-2 bg-warning/10 text-warning">
            6 сарын хугацаанд 0% хүү
          </Badge>
        </Card>

        {/* How it works */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Энгийн Худалдаа хэрхэн ажилладаг</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-medium">Худалдан авах зүйлээ сонгоно</div>
                <div className="text-muted-foreground">Манай хамтрагч худалдагчдаас бүтээгдэхүүн сонгоно</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-medium">QR код үзүүлнэ</div>
                <div className="text-muted-foreground">Худалдан авалт дуусгахын тулд QR код үзүүлнэ</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-medium">Хуваан төлнө</div>
                <div className="text-muted-foreground">Автомат сарын суутгал</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Featured Merchants */}
        <div>
          <h3 className="font-semibold mb-4">Featured Partners</h3>
          <div className="space-y-3">
            {mockMerchants.map((merchant) => (
              <Card key={merchant.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center text-2xl">
                      {merchant.image}
                    </div>
                    <div>
                      <div className="font-medium">{merchant.item}</div>
                      <div className="text-sm text-muted-foreground">{merchant.name}</div>
                      <div className="text-sm">
                        <span className="font-semibold">₮{merchant.price.toLocaleString()}</span>
                        <span className="text-muted-foreground"> or </span>
                        <span className="text-primary font-medium">
                          ₮{Math.round(merchant.price / 6).toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(merchant)}
                    size="sm"
                    className="bg-warning hover:bg-warning/90 text-warning-foreground"
                  >
                    Buy Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Find More Merchants */}
        <Card className="p-4 text-center">
          <Store className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="font-medium mb-2">Looking for something else?</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Visit any of our partner stores and look for the Simple Buy logo
          </p>
          <Badge variant="outline">1,000+ Partner Merchants</Badge>
        </Card>
      </div>
    </Layout>
  );
};