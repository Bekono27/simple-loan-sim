import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { BottomNavigation } from "./BottomNavigation";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showBottomNav?: boolean;
}

export const Layout = ({ children, title, showBack = true, showBottomNav = true }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="bg-card border-b border-border/50 px-4 py-3 sticky top-0 z-40 backdrop-blur-lg bg-card/95">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            {showBack && location.pathname !== "/" && location.pathname !== "/dashboard" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="p-2 h-auto"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            {title ? (
              <h1 className="font-semibold text-lg text-foreground">{title}</h1>
            ) : (
              <h1 className="font-bold text-xl text-primary">Простой Зээл</h1>
            )}
          </div>
          
          {location.pathname === "/dashboard" && (
            <Button
              variant="ghost"
              size="sm"
              className="p-2 h-auto"
            >
              <Bell className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNavigation />}
    </div>
  );
};