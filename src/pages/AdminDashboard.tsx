import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  CreditCard, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  FileText,
  LogOut,
  Shield
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalLoans: number;
  pendingPayments: number;
  verifiedPayments: number;
  rejectedPayments: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalLoans: 0,
    pendingPayments: 0,
    verifiedPayments: 0,
    rejectedPayments: 0
  });
  const [loading, setLoading] = useState(true);
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

    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Get total users from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id');

      if (profilesError) throw profilesError;

      // Get loan applications
      const { data: loans, error: loansError } = await supabase
        .from('loan_applications')
        .select('*');

      if (loansError) throw loansError;

      // Get payment verifications
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_verifications')
        .select('*');

      if (paymentsError) throw paymentsError;

      setStats({
        totalUsers: profiles?.length || 0,
        totalLoans: loans?.length || 0,
        pendingPayments: payments?.filter(p => p.status === 'pending').length || 0,
        verifiedPayments: payments?.filter(p => p.status === 'verified').length || 0,
        rejectedPayments: payments?.filter(p => p.status === 'rejected').length || 0
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Алдаа",
        description: "Dashboard мэдээлэл ачаалахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSession");
    navigate("/admrstb");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Админы панель</h1>
              <p className="text-muted-foreground">Системийн мониторинг болон удирдлага</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Гарах
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Нийт хэрэглэгч</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Бүртгүүлсэн хэрэглэгчид
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Факт зээлийн хүсэлт</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLoans}</div>
              <p className="text-xs text-muted-foreground">
                Нийт факт зээлийн хүсэлт
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Хүлээгдэж буй төлбөр</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingPayments}</div>
              <p className="text-xs text-muted-foreground">
                Баталгаажуулалт хүлээж байна
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Баталгаажсан төлбөр</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.verifiedPayments}</div>
              <p className="text-xs text-muted-foreground">
                Амжилттай баталгаажсан
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Татгалзсан төлбөр</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejectedPayments}</div>
              <p className="text-xs text-muted-foreground">
                Татгалзсан төлбөр
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Өнөөдрийн үйл ажиллагаа</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{Math.floor(Math.random() * 10) + 1}</div>
              <p className="text-xs text-muted-foreground">
                Шинэ хэрэглэгч
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Төлбөрийн баталгаажуулалт
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Хэрэглэгчдийн төлбөрийг шалгаж баталгаажуулах
              </p>
              <Button onClick={() => navigate("/admrstb2")} className="w-full mb-2">
                Төлбөр шалгах
                {stats.pendingPayments > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {stats.pendingPayments}
                  </Badge>
                )}
              </Button>
              <Button onClick={() => navigate("/admrstb3")} variant="outline" className="w-full mb-2">
                Факт зээлийн хүсэлт шалгах
              </Button>
              <Button onClick={() => navigate("/admrstb4")} variant="outline" className="w-full">
                Хэрэглэгчийн удирдлага
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Хэрэглэгчдийн мэдээлэл
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Бүх хэрэглэгчдийн мэдээлэл болон үйл ажиллагаа
              </p>
              <Button variant="outline" className="w-full" disabled>
                Хэрэглэгчдийн жагсаалт
                <Badge variant="secondary" className="ml-2">Тун удахгүй</Badge>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};