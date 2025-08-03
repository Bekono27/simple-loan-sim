import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CreditCard, TrendingUp, Users, FileText, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loanApplications, setLoanApplications] = useState<any[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      loadDashboardData();
    }
  }, [user, authLoading, navigate]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      const { data: loansData } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      setProfile(profileData);
      setLoanApplications(loansData || []);
    } catch (error) {
      toast({
        title: "Алдаа гарлаа",
        description: "Мэдээлэл ачаалахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Хүлээгдэж байна';
      case 'approved': return 'Зөвшөөрөгдсөн';
      case 'rejected': return 'Татгалзсан';
      case 'processing': return 'Боловсруулж байна';
      default: return status;
    }
  };

  if (authLoading || loading) {
    return (
      <Layout title="Хянах самбар">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const totalLoanAmount = loanApplications
    .filter(loan => loan.status === 'approved')
    .reduce((sum, loan) => sum + loan.amount, 0);

  return (
    <Layout title="Хянах самбар">
      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  Сайн байна уу, {profile?.full_name || profile?.username || 'Хэрэглэгч'}!
                </h2>
                <p className="text-muted-foreground">Таны зээлийн мэдээлэл</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
              >
                {balanceVisible ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Нийт зээл</p>
                <p className="text-xl font-bold">
                  {balanceVisible ? `${totalLoanAmount.toLocaleString()}₮` : '••••••'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Идэвхтэй зээл</p>
                <p className="text-xl font-bold">{loanApplications.filter(l => l.status === 'approved').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Хурдан үйлдэл</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={() => navigate("/loan-eligibility")}
                className="h-16 flex flex-col gap-1"
              >
                <CreditCard className="w-5 h-5" />
                <span className="text-xs">Зээлийн боломж</span>
              </Button>
              <Button 
                variant="outline"
                className="h-16 flex flex-col gap-1"
              >
                <Users className="w-5 h-5" />
                <span className="text-xs">P2P зээл</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loan Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Миний зээлийн хүсэлтүүд
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loanApplications.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Одоогоор зээлийн хүсэлт байхгүй</p>
                <Button 
                  onClick={() => navigate("/loan-eligibility")}
                  className="mt-3"
                  size="sm"
                >
                  Зээлийн боломж шалгах
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {loanApplications.slice(0, 3).map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{loan.amount.toLocaleString()}₮</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(loan.created_at).toLocaleDateString('mn-MN')}
                      </p>
                    </div>
                    <Badge>{getStatusText(loan.status)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Simple Buy */}
        <Card>
          <CardHeader>
            <CardTitle>Энгийн худалдаа</CardTitle>
            <CardDescription>Удахгүй...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Шинэ боломж</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Шинэ худалдааны платформ удахгүй гарна
              </p>
              <Button disabled variant="outline">
                Удахгүй
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};