import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthProvider";
import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { LoanApplication } from "./pages/LoanApplication";
import { LoanEligibility } from "./pages/LoanEligibility";
import { LoanPayment } from "./pages/LoanPayment";
import { LoanResult } from "./pages/LoanResult";
import { Repayment } from "./pages/Repayment";
import { SimpleBuy } from "./pages/SimpleBuy";
import { FAQ } from "./pages/FAQ";
import { Support } from "./pages/Support";
import { Profile } from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<LoanApplication />} />
            <Route path="/loan-eligibility" element={<LoanEligibility />} />
            <Route path="/loan-payment" element={<LoanPayment />} />
            <Route path="/loan-result" element={<LoanResult />} />
            <Route path="/repay" element={<Repayment />} />
            <Route path="/simple-buy" element={<SimpleBuy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/support" element={<Support />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;