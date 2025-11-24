import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Matrix from "@/pages/Matrix";
import Dojo from "@/pages/Dojo";
import Focus from "@/pages/Focus";
import Profile from "@/pages/Profile";
import Customize from "@/pages/Customize";
import Quests from "@/pages/Quests";
import Routines from "@/pages/Routines";
import Bazaar from "@/pages/Bazaar";
import NotFound from "@/pages/not-found";
import OnboardingDialog from "@/components/OnboardingDialog";
import NavigationDrawer from "@/components/NavigationDrawer";
import TopBar from "@/components/TopBar";
import { ProfileProvider, useProfile } from "@/hooks/useProfile";
import { FocusProvider } from "@/hooks/useFocus";
import { useState, createContext, useContext } from "react";

// Sidebar context to share collapse state
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dojo} />
      <Route path="/matrix" component={Matrix} />
      <Route path="/focus" component={Focus} />
      <Route path="/routines" component={Routines} />
      <Route path="/profile" component={Profile} />
      <Route path="/customize" component={Customize} />
      <Route path="/quests" component={Quests} />
      <Route path="/bazaar" component={Bazaar} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { profile, completeOnboarding } = useProfile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <Toaster />
      <Sonner position="top-right" richColors />
      <OnboardingDialog
        open={!profile.hasCompletedOnboarding}
        onComplete={completeOnboarding}
      />

      {/* Persistent Layout: NavigationDrawer + TopBar */}
      <div className="flex h-screen">
        <NavigationDrawer />

        <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
          <TopBar />

          {/* Main content area with top padding for TopBar */}
          <div className="flex-1 pt-16 overflow-hidden">
            <Router />
          </div>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProfileProvider>
          <FocusProvider>
            <AppContent />
          </FocusProvider>
        </ProfileProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
