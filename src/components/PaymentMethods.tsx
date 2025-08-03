import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Building2, QrCode } from "lucide-react";

export const PaymentMethods = () => {
  const paymentMethods = [
    {
      name: "Банкны шилжүүлэг",
      icon: Building2,
      description: "Дансны дугаараар шууд шилжүүлэг",
      advantages: ["Найдвартай", "Бүх банктай холбогдоно", "Админы баталгаажуулалт"],
      recommended: true
    },
    {
      name: "QPay / QR код",
      icon: QrCode,
      description: "Цахим төлбөрийн систем",
      advantages: ["Хурдан", "Аюулгүй", "Тун удахгүй"],
      recommended: false
    },
    {
      name: "Visa карт",
      icon: CreditCard,
      description: "Кредит картаар төлбөр",
      advantages: ["Олон улсын карт", "Хурдан", "Тун удахгүй"],
      recommended: false
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Санал болгож буй төлбөрийн аргууд</h3>
      
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        return (
          <Card key={method.name} className={`${method.recommended ? 'border-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{method.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                  </div>
                </div>
                {method.recommended && (
                  <Badge className="bg-green-100 text-green-800">Санал болгож байна</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {method.advantages.map((advantage) => (
                  <Badge key={advantage} variant="outline" className="text-xs">
                    {advantage}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">Төлбөрийн аргын талаарх зөвлөгөө:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <strong>Банкны шилжүүлэг</strong> - Одоо боломжтой, админы баталгаажуулалт</li>
          <li>• <strong>QPay</strong> - Тун удахгүй нэмэгдэнэ</li>
          <li>• <strong>Visa карт</strong> - Тун удахгүй нэмэгдэнэ</li>
        </ul>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Админы баталгаажуулалт:</strong> Банкны шилжүүлгийн төлбөрийг админ 24 цагийн дотор шалгаж баталгаажуулна.
          </p>
        </div>
      </div>
    </div>
  );
};