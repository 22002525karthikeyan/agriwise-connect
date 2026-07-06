import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Leaf, LogOut } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ThemeToggle } from '@/components/ThemeToggle';

interface DashboardHeaderProps {
  fullName: string | null;
  role: string | null;
  onSignOut: () => void;
}

export function DashboardHeader({ fullName, role, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="relative w-9 h-9">
              <div className="absolute inset-0 bg-primary rounded-xl blur-md opacity-40" />
              <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <span className="text-lg font-display font-extrabold tracking-tight">AgriSmart</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <div className="text-right hidden sm:block px-2">
              <p className="text-sm font-semibold text-foreground leading-tight">{fullName || 'User'}</p>
              <p className="text-[10px] uppercase tracking-widest text-primary font-bold">{role || 'user'}</p>
            </div>
            <Button variant="outline" size="icon" onClick={onSignOut} className="rounded-full">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
