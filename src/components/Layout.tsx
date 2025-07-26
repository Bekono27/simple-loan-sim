import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, LogOut } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showProfile?: boolean;
}

export const Layout = ({ children, title, showBack = true, showProfile = false }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem("simple_loan_user");

  const handleLogout = () => {
    localStorage.removeItem("simple_loan_user");
    localStorage.removeItem("simple_loan_data");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {showBack && location.pathname !== "/" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 h-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            {title && <h1 className="font-semibold text-lg">{title}</h1>}
          </div>
          
          {showProfile && isLoggedIn && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="p-2 h-auto"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="p-2 h-auto text-destructive"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto">
        {children}
      </main>
    </div>
  );
};