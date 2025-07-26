import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, CreditCard, Settings, User } from "lucide-react";

interface NavItem {
  icon: any;
  label: string;
  path: string;
}

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    { icon: Wallet, label: "Хэтэвч", path: "/dashboard" },
    { icon: CreditCard, label: "Зээл", path: "/apply" },
    { icon: Settings, label: "Үйлчилгээ", path: "/simple-buy" },
    { icon: User, label: "Профайл", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};