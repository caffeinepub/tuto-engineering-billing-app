import { Link, useRouterState } from "@tanstack/react-router";
import { FileText, History, LayoutDashboard, PlusCircle } from "lucide-react";
import OfflineBanner from "./OfflineBanner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/";
    }
    if (path === "/create") {
      return currentPath === "/create";
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-secondary shadow-md no-print">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/app-logo.dim_128x128.png"
              alt="Tsuto Engineering Billing Logo"
              className="w-8 h-8 rounded-md object-contain"
            />
            <div>
              <h1 className="font-heading text-secondary-foreground font-bold text-base leading-tight">
                Tsuto Engineering
              </h1>
              <p className="text-secondary-foreground/60 text-[10px] leading-none">
                Engineering Invoice App
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/80 hover:bg-secondary-foreground/10"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              to="/create"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/create")
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/80 hover:bg-secondary-foreground/10"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              New Invoice
            </Link>
            <Link
              to="/invoices"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                isActive("/invoices")
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/80 hover:bg-secondary-foreground/10"
              }`}
            >
              <History className="w-4 h-4" />
              History
            </Link>
          </nav>
        </div>
      </header>

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-3 py-4 pb-20 sm:pb-6">
        {children}
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-secondary border-t border-secondary-foreground/10 z-50 no-print">
        <div className="flex">
          <Link
            to="/"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive("/") ? "text-primary" : "text-secondary-foreground/60"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            to="/create"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive("/create")
                ? "text-primary"
                : "text-secondary-foreground/60"
            }`}
          >
            <PlusCircle className="w-5 h-5" />
            New Invoice
          </Link>
          <Link
            to="/invoices"
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              isActive("/invoices")
                ? "text-primary"
                : "text-secondary-foreground/60"
            }`}
          >
            <FileText className="w-5 h-5" />
            History
          </Link>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground/60 text-center text-xs py-3 no-print">
        <p>
          © {new Date().getFullYear()} Tsuto Engineering Billing App
          &nbsp;·&nbsp; Built with <span className="text-red-400">♥</span> using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "tsuto-billing")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
