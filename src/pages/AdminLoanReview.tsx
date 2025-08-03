import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, Eye, ArrowLeft, Download, User } from "lucide-react";

interface LoanApplication {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  eligibility_result: string;
  bank_statement_filename?: string;
  bank_statement_url?: string;
  created_at: string;
  max_loan_amount?: number;
  interest_rate?: number;
  profiles?: {
    full_name: string;
    phone_number?: string;
    register_number?: string;
    credit_score?: number;
    email?: string;
    user_id: string;
  } | null;
}

export const AdminLoanReview = () => {
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [approvedAmount, setApprovedAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [creditScore, setCreditScore] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin-login");
      return;
    }

    fetchLoans();
  }, [navigate]);

  const fetchLoans = async () => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .select(`
          *,
          profiles (
            full_name,
            phone_number,
            register_number,
            credit_score,
            email,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = (data || []).map((loan: any) => ({
        ...loan,
        profiles: loan.profiles || null
      }));
      
      setLoans(transformedData);
    } catch (error) {
      console.error('Error fetching loans:', error);
      toast({
        title: "Алдаа",
        description: "Факт зээлийн хүсэлт татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateLoanStatus = async (loanId: string, status: 'approved' | 'rejected', notes: string, maxAmount?: number, interestRate?: number) => {
    try {
      const updateData: any = {
        status,
        eligibility_result: notes,
        updated_at: new Date().toISOString()
      };

      // If approved, add loan details
      if (status === 'approved' && maxAmount && interestRate) {
        updateData.max_loan_amount = maxAmount;
        updateData.interest_rate = interestRate;
      }
      
      const { error } = await supabase
        .from('loan_applications')
        .update(updateData)
        .eq('id', loanId);

      if (error) throw error;

      toast({
        title: "Амжилттай",
        description: `Факт зээлийн хүсэлт ${status === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзлаа'}`
      });

      fetchLoans();
      setSelectedLoan(null);
      setAdminNotes("");
      setApprovedAmount("");
      setInterestRate("");
      setCreditScore("");
    } catch (error) {
      console.error('Error updating loan:', error);
      toast({
        title: "Алдаа",
        description: "Зээлийн статус шинэчлэхэд алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Хүлээгдэж байна</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Зөвшөөрөгдсөн</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Татгалзсан</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const downloadBankStatement = async (url: string, filename: string) => {
    try {
      const { data } = await supabase.storage.from('bank-statements').download(url);
      if (data) {
        const blob = new Blob([data]);
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'bank-statement.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      }
    } catch (error) {
      toast({
        title: "Алдаа",
        description: "Файл татахад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin-dashboard")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Факт зээлийн хүсэлт шалгах</h1>
        <Button onClick={fetchLoans} variant="outline">
          Шинэчлэх
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loans.map((loan) => (
          <Card key={loan.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <CardTitle className="text-lg">{loan.profiles?.full_name || 'Нэр тодорхойгүй'}</CardTitle>
                </div>
                {getStatusBadge(loan.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(loan.created_at).toLocaleDateString('mn-MN')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Зээлийн дүн:</p>
                  <p className="text-muted-foreground">{loan.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Утас:</p>
                  <p className="text-muted-foreground">{loan.profiles?.phone_number || 'Байхгүй'}</p>
                </div>
              </div>
              
              {loan.bank_statement_filename && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Банкны баримт</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadBankStatement(loan.bank_statement_url!, loan.bank_statement_filename!)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{loan.bank_statement_filename}</p>
                </div>
              )}

              {loan.eligibility_result && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Шинжилгээний үр дүн:</p>
                  <p className="text-xs text-muted-foreground">{loan.eligibility_result}</p>
                </div>
              )}

              {loan.status === 'pending' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedLoan(loan);
                      setAdminNotes(loan.eligibility_result || "");
                      setApprovedAmount(loan.amount.toString());
                      setInterestRate("15");
                      setCreditScore(loan.profiles?.credit_score?.toString() || "0");
                    }}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Шалгах
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {loans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Факт зээлийн хүсэлт олдсонгүй</p>
        </div>
      )}

      {/* Loan Review Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Факт зээлийн хүсэлт шалгах</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedLoan.profiles?.full_name} - {selectedLoan.amount.toLocaleString()}₮
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Хэрэглэгчийн нэр:</p>
                  <p>{selectedLoan.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="font-medium">И-мэйл:</p>
                  <p>{selectedLoan.profiles?.email || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Утасны дугаар:</p>
                  <p>{selectedLoan.profiles?.phone_number || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Регистрийн дугаар:</p>
                  <p>{selectedLoan.profiles?.register_number || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Зээлийн дүн:</p>
                  <p>{selectedLoan.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Хүсэлт гаргасан огноо:</p>
                  <p>{new Date(selectedLoan.created_at).toLocaleDateString('mn-MN')}</p>
                </div>
                <div>
                  <p className="font-medium">Одоогийн зээлийн оноо:</p>
                  <p className="font-semibold text-primary">{selectedLoan.profiles?.credit_score || 0} оноо</p>
                </div>
              </div>

              {/* Bank Statement Section */}
              {selectedLoan.bank_statement_filename && (
                <div className="p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Санхүүгийн баримт бичиг
                    </h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBankStatement(selectedLoan.bank_statement_url!, selectedLoan.bank_statement_filename!)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Татах
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{selectedLoan.bank_statement_filename}</p>
                  <div className="text-sm">
                    <p className="font-medium text-green-600">✓ Файл баталгаажсан</p>
                    <p className="text-muted-foreground">Банкны хуулга гэж тодорхойлогдсон</p>
                  </div>
                </div>
              )}


              <div>
                <label className="text-sm font-medium mb-2 block">Шинжилгээний тайлбар:</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Факт зээлийн хүсэлтийн талаарх тайлбар бичих..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="approvedAmount">Зөвшөөрөх дүн (₮)</Label>
                  <Input
                    id="approvedAmount"
                    type="number"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="Зөвшөөрөх зээлийн дүн"
                  />
                </div>
                <div>
                  <Label htmlFor="interestRate">Хүүгийн хэмжээ (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(e.target.value)}
                    placeholder="Жилийн хүү"
                  />
                </div>
              </div>

              {/* Credit Score Section */}
              <div className="border-t pt-4">
                <Label htmlFor="creditScore">Зээлийн оноо тохируулах</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="creditScore"
                    type="number"
                    min="0"
                    max="100"
                    value={creditScore}
                    onChange={(e) => setCreditScore(e.target.value)}
                    placeholder="0-100"
                    className="w-24"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const score = parseInt(creditScore);
                      if (isNaN(score) || score < 0 || score > 100) {
                        toast({
                          title: "Алдаа",
                          description: "Зээлийн оноо 0-100 хооронд байх ёстой",
                          variant: "destructive"
                        });
                        return;
                      }

                      try {
                        const { error } = await supabase
                          .from('profiles')
                          .update({
                            credit_score: score,
                            score_updated_at: new Date().toISOString(),
                            score_updated_by: (await supabase.auth.getUser()).data.user?.id
                          })
                          .eq('user_id', selectedLoan.profiles?.user_id);

                        if (error) throw error;

                        toast({
                          title: "Амжилттай",
                          description: `Зээлийн оноо ${score} болж шинэчлэгдлээ`
                        });

                        fetchLoans();
                      } catch (error) {
                        toast({
                          title: "Алдаа", 
                          description: "Зээлийн оноо шинэчлэхэд алдаа гарлаа",
                          variant: "destructive"
                        });
                      }
                    }}
                  >
                    Оноо шинэчлэх
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Өндөр оноо = зээл авах боломж өндөр (0-100 оноо)
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedLoan(null);
                    setAdminNotes("");
                    setApprovedAmount("");
                    setInterestRate("");
                    setCreditScore("");
                  }}
                >
                  Цуцлах
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => updateLoanStatus(selectedLoan.id, 'rejected', adminNotes)}
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Татгалзах
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    const amount = parseFloat(approvedAmount);
                    const rate = parseFloat(interestRate);
                    if (!amount || !rate) {
                      toast({
                        title: "Алдаа",
                        description: "Зөвшөөрөх дүн болон хүүгийн хэмжээг оруулна уу",
                        variant: "destructive"
                      });
                      return;
                    }
                    updateLoanStatus(selectedLoan.id, 'approved', adminNotes, amount, rate);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Зөвшөөрөх
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};