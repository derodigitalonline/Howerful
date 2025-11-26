import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left side - Splash Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src="/assets/onboarding_landscape_splash.png"
          alt="Howerful"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Right side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
