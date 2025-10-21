import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Progress from "@/pages/Progress";
import Profile from "@/pages/Profile";
import Customize from "@/pages/Customize";
import Quests from "@/pages/Quests";
import Routines from "@/pages/Routines";
import NotFound from "@/pages/not-found";
import OnboardingDialog from "@/components/OnboardingDialog";
import { ProfileProvider, useProfile } from "@/hooks/useProfile";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/routines" component={Routines} />
      <Route path="/progress" component={Progress} />
      <Route path="/profile" component={Profile} />
      <Route path="/customize" component={Customize} />
      <Route path="/quests" component={Quests} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { profile, completeOnboarding } = useProfile();

  return (
    <>
      <Toaster />
      <Sonner position="top-right" richColors />
      <OnboardingDialog
        open={!profile.hasCompletedOnboarding}
        onComplete={completeOnboarding}
      />
      <Router />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProfileProvider>
          <AppContent />
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
