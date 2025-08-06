
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, User, Phone, Banknote } from "lucide-react";

interface LoanApplication {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_status: string;
  eligibility_result?: string;
  bank_statement_filename?: string;
  bank_statement_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone_number?: string;
    email?: string;
  } | null;
}

export const AdminLoanReview = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admrstb");
      return;
    }

    const session = JSON.parse(adminSession);
    // Check if session is expired (24 hours)
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem("adminSession");
      navigate("/admrstb");
      return;
    }

    fetchLoanApplications();
  }, [navigate]);

  const fetchLoanApplications = async () => {
    try {
      // Get all loan applications
      const { data: loansData, error } = await supabase.rpc('admin_get_all_loan_applications');

      if (error) throw error;

      // Enrich with profile data
      const enrichedApplications = await Promise.all(
        (loansData || []).map(async (loan) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_number, email')
            .eq('user_id', loan.user_id)
            .maybeSingle();

          return {
            ...loan,
            profiles: profile
          };
        })
      );

      setApplications(enrichedApplications);
    } catch (error) {
      console.error('Error fetching loan applications:', error);
      toast({
        title: "Алдаа",
        description: "Зээлийн хүсэлтийг татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadBankStatement = async (url: string, filename: string) => {
    try {
      // Check if it's a sample statement (starts with sample_statements/)
      if (url.startsWith('sample_statements/')) {
        // For sample statements, we'll map them to our public sample files
        let sampleFile = '';
        if (url.includes('golomt_statement')) {
          sampleFile = '/sample_bank_statements/golomt_statement_sample.txt';
        } else if (url.includes('khan_statement')) {
          sampleFile = '/sample_bank_statements/khan_statement_sample.txt';
        } else {
          // Use golomt as default for other sample statements
          sampleFile = '/sample_bank_statements/golomt_statement_sample.txt';
        }
        
        // Download from public folder
        const response = await fetch(sampleFile);
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = filename || 'bank-statement.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      } else {
        // For real uploaded files, download from Supabase storage
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
      }
      
      toast({
        title: "Амжилттай",
        description: "Файл татагдлаа"
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Алдаа",
        description: "Файл татахад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const updateLoanStatus = async (loanId: string, newStatus: 'approved' | 'rejected') => {
    setUpdatingId(loanId);
    try {
      const notes = adminNotes[loanId] || '';

      // First create a payment verification record with admin notes
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_verifications')
        .insert({
          user_id: applications.find(app => app.id === loanId)?.user_id,
          loan_application_id: loanId,
          amount: 0, // Placeholder amount since this is for admin decision tracking
          payment_method: 'admin_decision',
          reference_number: `admin_${Date.now()}`,
          status: newStatus === 'approved' ? 'verified' : 'rejected',
          admin_notes: notes,
          verified_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // Then update the loan application
      const { error: loanError } = await supabase
        .from('loan_applications')
        .update({ 
          status: newStatus,
          payment_status: newStatus === 'approved' ? 'paid' : 'unpaid',
          updated_at: new Date().toISOString()
        })
        .eq('id', loanId);

      if (loanError) throw loanError;

      // Create notification for user
      const application = applications.find(app => app.id === loanId);
      if (application) {
        await supabase
          .from('notifications')
          .insert({
            user_id: application.user_id,
            title: newStatus === 'approved' ? 'Зээл зөвшөөрөгдсөн! 🎉' : 'Зээлийн хүсэлт татгалзагдлаа',
            message: newStatus === 'approved' 
              ? `Таны ${application.amount.toLocaleString()}₮ зээлийн хүсэлт зөвшөөрөгдлөө!${notes ? ` Шалтгаан: ${notes}` : ''}`
              : `Таны зээлийн хүсэлт татгалзагдлаа.${notes ? ` Шалтгаан: ${notes}` : ''}`,
            type: newStatus === 'approved' ? 'success' : 'error',
            related_id: loanId,
            related_type: 'loan_application'
          });
      }

      toast({
        title: "Амжилттай",
        description: `Зээлийн хүсэлт ${newStatus === 'approved' ? 'зөвшөөрөгдлөө' : 'татгалзагдлаа'}`
      });

      // Clear the admin note for this application
      setAdminNotes(prev => ({ ...prev, [loanId]: '' }));

      // Refresh the applications list
      fetchLoanApplications();
    } catch (error) {
      console.error('Error updating loan status:', error);
      toast({
        title: "Алдаа",
        description: "Зээлийн статус шинэчлэхэд алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Хүлээгдэж байна</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Зөвшөөрөгдсөн</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Татгалзсан</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          onClick={() => navigate("/admrstb1")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Зээлийн хүсэлт шалгах</h1>
        <Button onClick={fetchLoanApplications} variant="outline">
          Шинэчлэх
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {applications.map((app) => (
          <Card key={app.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {app.profiles?.full_name || 'Нэр тодорхойгүй'}
                </CardTitle>
                {getStatusBadge(app.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(app.created_at).toLocaleDateString('mn-MN')}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Information */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm font-medium">Утас:</span>
                  <span className="text-sm text-muted-foreground">
                    {app.profiles?.phone_number || 'Байхгүй'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4" />
                  <span className="text-sm font-medium">Зээлийн дүн:</span>
                  <span className="text-sm font-semibold text-primary">
                    {app.amount.toLocaleString()}₮
                  </span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">И-мэйл:</span>
                  <span className="text-muted-foreground ml-1">
                    {app.profiles?.email || 'Байхгүй'}
                  </span>
                </div>
              </div>

              {/* Bank Statement */}
              {app.bank_statement_filename && app.bank_statement_url && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Банкны баримт</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadBankStatement(app.bank_statement_url!, app.bank_statement_filename!)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.bank_statement_filename}</p>
                </div>
              )}

              {/* Admin Actions for Pending Applications */}
              {app.status === 'pending' && (
                <div className="space-y-3">
                  <Textarea
                    placeholder="Админы тэмдэглэл (шалтгаан)..."
                    value={adminNotes[app.id] || ''}
                    onChange={(e) => setAdminNotes(prev => ({ ...prev, [app.id]: e.target.value }))}
                    className="text-sm"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => updateLoanStatus(app.id, 'approved')}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={updatingId === app.id}
                    >
                      {updatingId === app.id ? 'Боловсруулж байна...' : 'Зөвшөөрөх'}
                    </Button>
                    <Button
                      onClick={() => updateLoanStatus(app.id, 'rejected')}
                      variant="destructive"
                      className="flex-1"
                      disabled={updatingId === app.id}
                    >
                      {updatingId === app.id ? 'Боловсруулж байна...' : 'Татгалзах'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Show existing admin notes for processed applications */}
              {(app.status === 'approved' || app.status === 'rejected') && app.eligibility_result && (
                <div className={`p-3 rounded-lg ${
                  app.status === 'approved' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className="text-sm font-medium mb-1">
                    {app.status === 'approved' ? 'Зөвшөөрлийн шалтгаан:' : 'Татгалзсан шалтгаан:'}
                  </p>
                  <p className="text-xs text-muted-foreground">{app.eligibility_result}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {applications.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Зээлийн хүсэлт олдсонгүй</p>
        </div>
      )}
    </div>
  );
};
