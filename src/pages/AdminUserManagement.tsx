import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Eye, 
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  FileText,
  Activity
} from "lucide-react";

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  register_number?: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

interface UserActivity {
  loans: any[];
  payments: any[];
  documents: any[];
}

export const AdminUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin session
    const adminSession = localStorage.getItem("adminSession");
    if (!adminSession) {
      navigate("/admin-login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчдийн мэдээлэл татахад алдаа гарлаа",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivity = async (userId: string) => {
    try {
      // Fetch user's loan applications
      const { data: loans } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch user's payment verifications
      const { data: payments } = await supabase
        .from('payment_verifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Fetch user's P2P loans
      const { data: p2pLoans } = await supabase
        .from('p2p_loans')
        .select('*')
        .or(`lender_id.eq.${userId},borrower_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      setUserActivity({
        loans: loans || [],
        payments: payments || [],
        documents: p2pLoans || []
      });
    } catch (error) {
      console.error('Error fetching user activity:', error);
      toast({
        title: "Алдаа",
        description: "Хэрэглэгчийн үйл ажиллагаа татахад алдаа гарлаа",
        variant: "destructive"
      });
    }
  };

  const handleUserSelect = async (user: UserProfile) => {
    setSelectedUser(user);
    await fetchUserActivity(user.user_id);
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Хүлээгдэж байна</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Зөвшөөрөгдсөн</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Татгалзсан</Badge>;
      case 'verified':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Баталгаажсан</Badge>;
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
          onClick={() => navigate("/admin-dashboard")}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-3xl font-bold">Хэрэглэгчийн удирдлага</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Хэрэглэгчид ({filteredUsers.length})
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Хэрэглэгч хайх..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.full_name || user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.phone_number && `+976 ${user.phone_number}`}
                        </p>
                      </div>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="space-y-6">
              {/* User Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Хэрэглэгчийн мэдээлэл
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Нэр:</span>
                      </div>
                      <p>{selectedUser.full_name || 'Тодорхойгүй'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Хэрэглэгчийн нэр:</span>
                      </div>
                      <p>{selectedUser.username}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        <span className="font-medium">И-мэйл:</span>
                      </div>
                      <p>{selectedUser.email || 'Тодорхойгүй'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="w-4 h-4" />
                        <span className="font-medium">Утас:</span>
                      </div>
                      <p>{selectedUser.phone_number ? `+976 ${selectedUser.phone_number}` : 'Тодорхойгүй'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Регистр:</span>
                      </div>
                      <p>{selectedUser.register_number || 'Тодорхойгүй'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Бүртгүүлсэн:</span>
                      </div>
                      <p>{new Date(selectedUser.created_at).toLocaleDateString('mn-MN')}</p>
                    </div>
                  </div>
                  {/* Additional Profile Info */}
                  {selectedUser.birth_date && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">Төрсөн өдөр:</span>
                      </div>
                      <p>{new Date(selectedUser.birth_date).toLocaleDateString('mn-MN')}</p>
                    </div>
                  )}
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4" />
                      <span className="font-medium">Сүүлд шинэчлэгдсэн:</span>
                    </div>
                    <p>{new Date(selectedUser.updated_at).toLocaleDateString('mn-MN')}</p>
                  </div>
                </CardContent>
              </Card>

              {/* User Activity */}
              {userActivity && (
                <>
                  {/* Loan Applications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Факт зээлийн хүсэлт ({userActivity.loans.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userActivity.loans.length > 0 ? (
                        <div className="space-y-3">
                          {userActivity.loans.map((loan) => (
                            <div key={loan.id} className="p-4 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="font-medium text-lg">{loan.amount.toLocaleString()}₮</span>
                                  <p className="text-sm text-muted-foreground">
                                    Хүсэлт: {new Date(loan.created_at).toLocaleDateString('mn-MN')}
                                  </p>
                                </div>
                                {getStatusBadge(loan.status)}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                {loan.max_loan_amount && (
                                  <div>
                                    <span className="font-medium">Хамгийн их дүн:</span>
                                    <p>{loan.max_loan_amount.toLocaleString()}₮</p>
                                  </div>
                                )}
                                {loan.interest_rate && (
                                  <div>
                                    <span className="font-medium">Хүү:</span>
                                    <p>{loan.interest_rate}%</p>
                                  </div>
                                )}
                                {loan.eligibility_result && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Үр дүн:</span>
                                    <p className="text-muted-foreground">{loan.eligibility_result}</p>
                                  </div>
                                )}
                                {loan.bank_statement_filename && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Банкны баримт:</span>
                                    <p className="text-muted-foreground">{loan.bank_statement_filename}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Төлбөрийн төлөв:</span>
                                  <p className={loan.payment_status === 'paid' ? 'text-green-600' : 'text-orange-600'}>
                                    {loan.payment_status === 'paid' ? 'Төлөгдсөн' : 'Төлөгдөөгүй'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Факт зээлийн хүсэлт байхгүй</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Payment Verifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Төлбөрийн баталгаажуулалт ({userActivity.payments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userActivity.payments.length > 0 ? (
                        <div className="space-y-3">
                          {userActivity.payments.map((payment) => (
                            <div key={payment.id} className="p-4 border rounded-lg bg-muted/20">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <span className="font-medium text-lg">{payment.amount.toLocaleString()}₮</span>
                                  <p className="text-sm text-muted-foreground">
                                    Төлбөр: {new Date(payment.created_at).toLocaleDateString('mn-MN')}
                                  </p>
                                </div>
                                {getStatusBadge(payment.status)}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Төлбөрийн арга:</span>
                                  <p>{payment.payment_method}</p>
                                </div>
                                <div>
                                  <span className="font-medium">Лавлагаа №:</span>
                                  <p>{payment.reference_number}</p>
                                </div>
                                {payment.payment_date && (
                                  <div>
                                    <span className="font-medium">Төлбөрийн огноо:</span>
                                    <p>{new Date(payment.payment_date).toLocaleDateString('mn-MN')}</p>
                                  </div>
                                )}
                                {payment.verified_at && (
                                  <div>
                                    <span className="font-medium">Баталгаажсан:</span>
                                    <p>{new Date(payment.verified_at).toLocaleDateString('mn-MN')}</p>
                                  </div>
                                )}
                                {payment.admin_notes && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Админы тэмдэглэл:</span>
                                    <p className="text-muted-foreground">{payment.admin_notes}</p>
                                  </div>
                                )}
                                {payment.loan_application_id && (
                                  <div className="col-span-2">
                                    <span className="font-medium">Зээлийн хүсэлт ID:</span>
                                    <p className="text-muted-foreground font-mono text-xs">{payment.loan_application_id}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">Төлбөрийн баталгаажуулалт байхгүй</p>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Хэрэглэгч сонгоно уу</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};