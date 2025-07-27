import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "Зээл хэр хурдан зөвшөөрөгдөх вэ?",
    answer: "Ихэнх зээлийн хүсэлт 2-3 минутад боловсруулагддаг. Зөвшөөрөгдсөний дараа мөнгө ихэвчлэн 24 цагийн дотор таны дансанд шилжих болно."
  },
  {
    question: "Хүүгийн хэмжээ хэд вэ?",
    answer: "Манай хүүгийн хэмжээ жилийн 15%-аас эхэлдэг бөгөөд таны зээлийн үнэлгээ болон зээлийн хэмжээнээс хамаарна. Бид ил тод үнэлгээтэй өрсөлдөхүйц хүү санал болгодог."
  },
  {
    question: "Зээлийн хамгийн бага, хамгийн их хэмжээ хэд вэ?",
    answer: "Та ₮100,000-аас ₮10,000,000 хүртэл зээл авч болно. Яг тодорхой дүн нь таны зээлийн үнэлгээ болон эргэн төлөх чадвараас хамаарна."
  },
  {
    question: "Эргэн төлөх хугацаа хэр урт вэ?",
    answer: "Бид 3-аас 40 сар хүртэлх уян хатан эргэн төлөх хугацаа санал болгодог. Та өөрийн төсөвт тохирсон хугацааг сонгож болно."
  },
  {
    question: "Энгийн худалдаа үнэхээр хүүгүй юу?",
    answer: "Тийм ээ! Энгийн худалдаа нь 6 сарын дотор төлсөн худалдан авалтад 0% хүү санал болгодог. Ямар ч нуугдмал төлбөр, хураамж байхгүй."
  },
  {
    question: "Эргэн төлбөрийг хэрхэн төлөх вэ?",
    answer: "Та QPay QR кодоор эргэн төлбөр хийх боломжтой, эсвэл бид таны банкны данснаас автоматаар суутгах тохиргоо хийж өгч болно."
  },
  {
    question: "Төлбөр хоцорвол юу болох вэ?",
    answer: "Бид төлбөрийн өдрөөс өмнө болон дараа нь танд сануулга илгээх болно. Хоцрогдсон төлбөрт нэмэлт хураамж ногдуулагдаж болзошгүй тул автомат төлбөр тохируулахыг зөвлөж байна."
  },
  {
    question: "Зээлээ эрт төлж болох уу?",
    answer: "Тийм ээ! Та зээлээ ямар ч торгууль байхгүйгээр эрт төлж болно. Энэ нь хүүгийн төлбөр хэмнэхэд тусална."
  },
  {
    question: "Миний зээлийн үнэлгээ хэрхэн тооцогддог вэ?",
    answer: "Бид таны төлбөрийн түүх, орлого, одоо байгаа өр, банкны үйл ажиллагаа зэрэг олон хүчин зүйлийг ашиглан таны зээлийн үнэлгээг тооцдог."
  },
  {
    question: "Миний хувийн мэдээлэл аюулгүй байна уу?",
    answer: "Мэдээжийн хэрэг. Бид таны хувийн болон санхүүгийн мэдээллийг хамгаалахын тулд банкны түвшний шифрлэлт болон аюулгүйн арга хэмжээ ашигладаг."
  }
];

export const FAQ = () => {
  return (
    <Layout title="FAQ">
      <div className="p-4 space-y-6">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Асуулт хариулт</h1>
          <p className="text-muted-foreground">Энгийн Зээлийн талаархи нийтлэг асуултын хариулт</p>
        </Card>

        <Card className="p-4">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>

        <Card className="p-4 text-center">
          <h3 className="font-semibold mb-2">Асуулт байсаар байна уу?</h3>
          <p className="text-muted-foreground mb-3">
            Манай тусламжийн баг танд 24/7 туслахад бэлэн байна
          </p>
          <div className="space-y-2 text-sm">
            <div>📞 Тусламжийн утас: 1800-SIMPLE</div>
            <div>📧 И-мэйл: support@simpleloan.mn</div>
            <div>💬 Шууд чат: Апп дотор боломжтой</div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};