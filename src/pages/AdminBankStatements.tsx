import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Download, FileText, Search, User, Eye } from "lucide-react";

interface BankStatementData {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_statement_filename?: string;
  bank_statement_url?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone_number?: string;
    email?: string;
    register_number?: string;
  } | null;
}

export const AdminBankStatements = () => {
  const [statements, setStatements] = useState<BankStatementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatement, setSelectedStatement] = useState<BankStatementData | null>(null);
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

    fetchBankStatements();
  }, [navigate]);

  const fetchBankStatements = async () => {
    try {
      // Get all loan applications with bank statements
      const { data: loansData, error } = await supabase.rpc('admin_get_all_loan_applications');

      if (error) throw error;

      // Filter only applications with bank statements and enrich with profile data
      const enrichedStatements = await Promise.all(
        (loansData || [])
          .filter(loan => loan.bank_statement_filename && loan.bank_statement_url)
          .map(async (loan) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone_number, email, register_number')
              .eq('user_id', loan.user_id)
              .maybeSingle();

            return {
              ...loan,
              profiles: profile
            };
          })
      );

      setStatements(enrichedStatements);
    } catch (error) {
      console.error('Error fetching bank statements:', error);
      toast({
        title: "Алдаа",
        description: "Банкны баримт бичгийг татахад алдаа гарлаа",
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

  const filteredStatements = statements.filter(statement =>
    statement.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    statement.profiles?.phone_number?.includes(searchTerm) ||
    statement.bank_statement_filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-3xl font-bold">Хэрэглэгчдийн банкны баримт бичиг</h1>
        <Button onClick={fetchBankStatements} variant="outline">
          Шинэчлэх
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Хэрэглэгчийн нэр, и-мэйл, утас эсвэл файлын нэрээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStatements.map((statement) => (
          <Card key={statement.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <CardTitle className="text-lg">{statement.profiles?.full_name || 'Нэр тодорхойгүй'}</CardTitle>
                </div>
                {getStatusBadge(statement.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(statement.created_at).toLocaleDateString('mn-MN')}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div>
                  <p className="font-medium">Зээлийн дүн:</p>
                  <p className="text-muted-foreground">{statement.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">И-мэйл:</p>
                  <p className="text-muted-foreground">{statement.profiles?.email || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Утас:</p>
                  <p className="text-muted-foreground">{statement.profiles?.phone_number || 'Байхгүй'}</p>
                </div>
              </div>
              
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Банкны баримт</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedStatement(statement)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadBankStatement(statement.bank_statement_url!, statement.bank_statement_filename!)}
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{statement.bank_statement_filename}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStatements.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'Хайлтын үр дүн олдсонгүй' : 'Банкны баримт бичиг олдсонгүй'}
          </p>
        </div>
      )}

      {/* Statement Details Modal */}
      {selectedStatement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Банкны баримт бичгийн дэлгэрэнгүй</CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedStatement.profiles?.full_name} - {selectedStatement.amount.toLocaleString()}₮
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Хэрэглэгчийн нэр:</p>
                  <p>{selectedStatement.profiles?.full_name}</p>
                </div>
                <div>
                  <p className="font-medium">И-мэйл:</p>
                  <p>{selectedStatement.profiles?.email || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Утасны дугаар:</p>
                  <p>{selectedStatement.profiles?.phone_number || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Регистрийн дугаар:</p>
                  <p>{selectedStatement.profiles?.register_number || 'Байхгүй'}</p>
                </div>
                <div>
                  <p className="font-medium">Зээлийн дүн:</p>
                  <p>{selectedStatement.amount.toLocaleString()}₮</p>
                </div>
                <div>
                  <p className="font-medium">Статус:</p>
                  <div className="mt-1">{getStatusBadge(selectedStatement.status)}</div>
                </div>
                <div>
                  <p className="font-medium">Хүсэлт гаргасан огноо:</p>
                  <p>{new Date(selectedStatement.created_at).toLocaleDateString('mn-MN')}</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Банкны баримт бичиг
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadBankStatement(selectedStatement.bank_statement_url!, selectedStatement.bank_statement_filename!)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Татах
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{selectedStatement.bank_statement_filename}</p>
                <div className="text-sm">
                  <p className="font-medium text-green-600">✓ Файл баталгаажсан</p>
                  <p className="text-muted-foreground">Банкны хуулга гэж тодорхойлогдсон</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedStatement(null)}
                >
                  Хаах
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => downloadBankStatement(selectedStatement.bank_statement_url!, selectedStatement.bank_statement_filename!)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Татах
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};