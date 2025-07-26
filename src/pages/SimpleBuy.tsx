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
    name: "TechWorld Store",
    item: "iPhone 15 Pro",
    price: 2500000,
    image: "📱"
  },
  {
    id: "2", 
    name: "Fashion Hub",
    item: "Winter Jacket",
    price: 180000,
    image: "🧥"
  },
  {
    id: "3",
    name: "Home Essentials",
    item: "Coffee Machine",
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
      title: "Purchase successful!",
      description: `You've purchased ${selectedMerchant.item} with Simple Buy`,
    });

    setTimeout(() => {
      setShowQR(false);
      setPurchaseComplete(false);
      setSelectedMerchant(null);
    }, 3000);
  };

  if (purchaseComplete) {
    return (
      <Layout title="Purchase Complete">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Purchase Successful!</h2>
            <p className="text-muted-foreground mb-4">
              You've successfully purchased {selectedMerchant?.item} from {selectedMerchant?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive payment reminders when installments are due
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  if (showQR && selectedMerchant) {
    return (
      <Layout title="Simple Buy Payment">
        <div className="p-4">
          <Card className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-warning" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Scan to Complete Purchase</h2>
              <p className="text-muted-foreground">Present this QR code to the merchant</p>
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
                <span className="text-muted-foreground">Merchant</span>
                <span className="font-semibold">{selectedMerchant.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Item</span>
                <span className="font-semibold">{selectedMerchant.item}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-semibold">₮{selectedMerchant.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Payment</span>
                <span className="font-semibold">₮{Math.round(selectedMerchant.price / 6).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Term</span>
                <span className="font-semibold">6 months</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handlePaymentComplete}
                className="w-full"
              >
                Merchant Confirmed Payment
              </Button>
              <Button 
                onClick={() => setShowQR(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              This is a demo QR code for testing Simple Buy functionality
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Simple Buy">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Simple Buy</h1>
          <p className="text-muted-foreground">Buy now, pay later in easy installments</p>
          <Badge variant="secondary" className="mt-2 bg-warning/10 text-warning">
            0% Interest for 6 months
          </Badge>
        </Card>

        {/* How it works */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">How Simple Buy Works</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-medium">Choose your purchase</div>
                <div className="text-muted-foreground">Select an item from our partner merchants</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-medium">Show QR code</div>
                <div className="text-muted-foreground">Present the QR code to complete purchase</div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-medium">Pay in installments</div>
                <div className="text-muted-foreground">Automatic monthly deductions</div>
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