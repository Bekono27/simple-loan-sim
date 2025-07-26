import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqData = [
  {
    question: "How fast can I get my loan approved?",
    answer: "Most loan applications are processed within 2-3 minutes. Once approved, funds are typically transferred to your account within 24 hours."
  },
  {
    question: "What are the interest rates?",
    answer: "Our interest rates start from 15% annually, depending on your credit score and loan amount. We offer competitive rates with transparent pricing."
  },
  {
    question: "What's the minimum and maximum loan amount?",
    answer: "You can borrow from ₮100,000 to ₮10,000,000. The exact amount depends on your credit assessment and repayment capacity."
  },
  {
    question: "How long are the repayment terms?",
    answer: "We offer flexible repayment terms from 3 to 40 months. You can choose the term that best fits your budget."
  },
  {
    question: "Is Simple Buy really interest-free?",
    answer: "Yes! Simple Buy offers 0% interest for purchases paid within 6 months. No hidden fees or charges."
  },
  {
    question: "How do I make repayments?",
    answer: "You can make repayments through QPay QR codes, or we can set up automatic deductions from your bank account."
  },
  {
    question: "What happens if I miss a payment?",
    answer: "We'll send you reminders before and after your due date. Late payments may incur additional fees, so we recommend setting up automatic payments."
  },
  {
    question: "Can I pay off my loan early?",
    answer: "Yes! You can pay off your loan early without any penalties. This can help you save on interest charges."
  },
  {
    question: "How is my credit score calculated?",
    answer: "We use multiple factors including your payment history, income, existing debts, and banking behavior to calculate your credit score."
  },
  {
    question: "Is my personal information secure?",
    answer: "Absolutely. We use bank-level encryption and security measures to protect your personal and financial information."
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
          <h1 className="text-2xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-muted-foreground">Find answers to common questions about Simple Loan</p>
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
          <h3 className="font-semibold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-3">
            Our support team is here to help you 24/7
          </p>
          <div className="space-y-2 text-sm">
            <div>📞 Support Hotline: 1800-SIMPLE</div>
            <div>📧 Email: support@simpleloan.mn</div>
            <div>💬 Live Chat: Available in app</div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};