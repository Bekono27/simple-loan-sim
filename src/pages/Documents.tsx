import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export const Documents = () => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadDocuments();
  }, [user, navigate]);

  const loadDocuments = async () => {
    if (!user) return;
    
    try {
      const { data: loans } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user.id);

      const docs = loans?.filter(loan => loan.bank_statement_url).map(loan => ({
        id: loan.id,
        name: loan.bank_statement_filename || 'Банкны баримт',
        type: 'Банкны баримт',
        status: loan.status,
        uploadDate: loan.created_at,
        url: loan.bank_statement_url
      })) || [];

      setDocuments(docs);
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Баримт бичиг ачаалахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      toast({
        title: "Амжилттай байршуулагдлаа",
        description: "Баримт бичиг амжилттай байршуулагдлаа",
      });
      
      loadDocuments();
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Файл байршуулахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Зөвшөөрөгдсөн</Badge>;
      case 'pending':
        return <Badge variant="secondary">Хүлээгдэж байна</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Татгалзсан</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout title="Баримт бичиг">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Баримт бичиг">
      <div className="p-4 space-y-6">
        {/* Upload Section */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Баримт бичиг оруулах
          </h3>
          <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Банкны баримт, гэрээ зэрэг файлаа энд оруулна уу
            </p>
            <label htmlFor="file-upload">
              <Button disabled={uploading}>
                {uploading ? "Байршуулж байна..." : "Файл сонгох"}
              </Button>
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileUpload}
            />
            <p className="text-xs text-muted-foreground mt-2">
              PDF, JPG, PNG, DOC файл зөвшөөрөгдөнө (Хамгийн ихдээ 10MB)
            </p>
          </div>
        </Card>

        {/* Documents List */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Миний баримт бичиг
          </h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Одоогоор баримт бичиг байхгүй</p>
              <p className="text-sm text-muted-foreground mt-2">
                Зээлийн хүсэлт гаргаж эхлэхийн тулд банкны баримт оруулна уу
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.type} • {new Date(doc.uploadDate).toLocaleDateString('mn-MN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(doc.status)}
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Document Types Info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Шаардлагатай баримт бичиг</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Банкны баримт</p>
                <p className="text-sm text-muted-foreground">Сүүлийн 3 сарын банкны баланс</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Иргэний үнэмлэх</p>
                <p className="text-sm text-muted-foreground">Хүчинтэй иргэний үнэмлэхийн хуулбар</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium">Орлогын справка</p>
                <p className="text-sm text-muted-foreground">Ажил олгогчоос авсан орлогын гэрчилгээ</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};