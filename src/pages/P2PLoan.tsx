import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { 
  Users, 
  Plus, 
  Search, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  User,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export const P2PLoan = () => {
  const [activeTab, setActiveTab] = useState("browse");
  const [p2pLoans, setP2pLoans] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [duration, setDuration] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadP2PLoans();
    loadMyLoans();
  }, [user, navigate]);

  const loadP2PLoans = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('p2p_loans')
        .select('*')
        .eq('status', 'available')
        .neq('lender_id', user.id)
        .order('created_at', { ascending: false });

      setP2pLoans(data || []);
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "P2P зээлийн мэдээлэл ачаалахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMyLoans = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('p2p_loans')
        .select('*')
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      setMyLoans(data || []);
    } catch (error) {
      console.error('Error loading my loans:', error);
    }
  };

  const handleCreateLoan = async () => {
    if (!user || !amount || !interestRate || !duration) {
      toast({
        title: "Алдаа гарлаа",
        description: "Бүх талбарыг бөглөнө үү",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('p2p_loans')
        .insert({
          lender_id: user.id,
          amount: parseFloat(amount),
          interest_rate: parseFloat(interestRate),
          duration_months: parseInt(duration),
          description: description || null,
          status: 'available'
        });

      if (error) throw error;

      toast({
        title: "Амжилттай үүслээ",
        description: "Таны P2P зээлийн санал үүслээ",
      });

      setAmount("");
      setInterestRate("");
      setDuration("");
      setDescription("");
      setActiveTab("my-loans");
      loadP2PLoans();
      loadMyLoans();
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "P2P зээл үүсгэхэд алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyForLoan = async (loanId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('p2p_loans')
        .update({
          borrower_id: user.id,
          status: 'pending'
        })
        .eq('id', loanId);

      if (error) throw error;

      toast({
        title: "Хүсэлт илгээгдлээ",
        description: "Таны зээлийн хүсэлт илгээгдлээ",
      });

      loadP2PLoans();
      loadMyLoans();
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Зээлийн хүсэлт илгээхэд алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string, lenderId: string, borrowerId: string | null) => {
    if (status === 'available') {
      return <Badge className="bg-green-100 text-green-800">Боломжтой</Badge>;
    } else if (status === 'pending') {
      return <Badge variant="secondary">Хүлээгдэж байна</Badge>;
    } else if (status === 'active') {
      return <Badge className="bg-blue-100 text-blue-800">Идэвхтэй</Badge>;
    } else if (status === 'completed') {
      return <Badge className="bg-gray-100 text-gray-800">Дууссан</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  if (loading) {
    return (
      <Layout title="P2P зээл">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="P2P зээл">
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">P2P зээл</h1>
          <p className="text-muted-foreground">Хүмүүсээс хүмүүст шууд зээл олгох, авах</p>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Хайх</TabsTrigger>
            <TabsTrigger value="create">Зээл санал</TabsTrigger>
            <TabsTrigger value="my-loans">Миний зээл</TabsTrigger>
          </TabsList>

          {/* Browse Loans */}
          <TabsContent value="browse" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Боломжтой зээлүүд</h3>
            </div>
            
            {p2pLoans.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Одоогоор боломжтой зээл байхгүй</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {p2pLoans.map((loan) => (
                  <Card key={loan.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">₮{loan.amount.toLocaleString()}</h4>
                          {getStatusBadge(loan.status, loan.lender_id, loan.borrower_id)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{loan.interest_rate}% хүү</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{loan.duration_months} сар</span>
                          </div>
                        </div>
                        {loan.description && (
                          <p className="text-sm text-muted-foreground mb-3">{loan.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(loan.created_at).toLocaleDateString('mn-MN')}
                        </p>
                      </div>
                      <div className="ml-4">
                        <Button 
                          onClick={() => handleApplyForLoan(loan.id)}
                          size="sm"
                          disabled={loan.status !== 'available'}
                        >
                          Хүсэлт гаргах
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Create Loan */}
          <TabsContent value="create" className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Plus className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Зээлийн санал үүсгэх</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Зээлийн дүн (₮)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="жишээ: 1000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="interest">Хүүгийн хувь (%)</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    placeholder="жишээ: 12.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="duration">Хугацаа (сар)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="жишээ: 12"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Тайлбар (заавал биш)</Label>
                  <Textarea
                    id="description"
                    placeholder="Зээлийн нөхцөл, шаардлагын талаар..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleCreateLoan}
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Үүсгэж байна..." : "Зээлийн санал үүсгэх"}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* My Loans */}
          <TabsContent value="my-loans" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Миний зээлүүд</h3>
            </div>
            
            {myLoans.length === 0 ? (
              <Card className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Одоогоор зээл байхгүй</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {myLoans.map((loan) => (
                  <Card key={loan.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">₮{loan.amount.toLocaleString()}</h4>
                          {getStatusBadge(loan.status, loan.lender_id, loan.borrower_id)}
                          {loan.lender_id === user?.id && (
                            <Badge variant="outline">Зээлдэгч</Badge>
                          )}
                          {loan.borrower_id === user?.id && (
                            <Badge variant="outline">Зээлээгч</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{loan.interest_rate}% хүү</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{loan.duration_months} сар</span>
                          </div>
                        </div>
                        {loan.description && (
                          <p className="text-sm text-muted-foreground mb-3">{loan.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(loan.created_at).toLocaleDateString('mn-MN')}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};