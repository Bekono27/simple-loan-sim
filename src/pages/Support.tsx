import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Phone, Mail, Clock, CheckCircle } from "lucide-react";
import { useState } from "react";

export const Support = () => {
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
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitted(true);
    toast({
      title: "Message sent!",
      description: "We'll get back to you within 24 hours",
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
      <Layout title="Support">
        <div className="p-4">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-success">Message Sent!</h2>
            <p className="text-muted-foreground mb-4">
              Thank you for contacting us. Our support team will respond within 24 hours.
            </p>
            <p className="text-sm text-muted-foreground">
              You'll receive a confirmation email shortly.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Support">
      <div className="p-4 space-y-6">
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Get Support</h1>
          <p className="text-muted-foreground">We're here to help you with any questions or issues</p>
        </Card>

        {/* Contact Methods */}
        <div className="space-y-3">
          <h3 className="font-semibold">Contact Us</h3>
          
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Phone Support</div>
                <div className="text-sm text-muted-foreground">1800-SIMPLE (24/7)</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Email Support</div>
                <div className="text-sm text-muted-foreground">support@simpleloan.mn</div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Response Time</div>
                <div className="text-sm text-muted-foreground">Within 24 hours</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Send us a message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>

            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                placeholder="Please describe your issue or question in detail..."
                rows={4}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>
          </form>
        </Card>

        {/* Common Issues */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Common Issues</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Loan application status</span>
              <span className="text-muted-foreground">Check dashboard</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Payment not processed</span>
              <span className="text-muted-foreground">24-48 hours</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span>Update personal information</span>
              <span className="text-muted-foreground">Contact support</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>Technical issues</span>
              <span className="text-muted-foreground">Report via form</span>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};