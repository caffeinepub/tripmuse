import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Heart } from 'lucide-react';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col app-backdrop">
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80">
        <div className="container flex h-16 items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-9 h-9 flex items-center justify-center">
              <img 
                src="/assets/generated/tripmuse-logo.dim_512x512.png" 
                alt="TripMuse" 
                className="w-full h-full object-contain transition-transform group-hover:scale-105" 
              />
            </div>
            <span className="text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors">
              TripMuse
            </span>
          </button>

          {isAuthenticated && (
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                onClick={() => navigate({ to: '/new-trip' })}
                size="default"
                className="gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Trip</span>
              </Button>
              <Button
                onClick={handleLogout}
                disabled={disabled}
                variant="ghost"
                size="default"
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container py-8 md:py-12 max-w-7xl">
        {children}
      </main>

      <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm mt-auto">
        <div className="container py-8">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TripMuse. Built with{' '}
              <Heart className="inline w-3.5 h-3.5 text-accent fill-accent" />{' '}
              using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors underline decoration-primary/30 hover:decoration-primary underline-offset-4"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
