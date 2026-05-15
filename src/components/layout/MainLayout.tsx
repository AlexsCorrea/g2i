import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import TopNav from "./TopNav";
import { useAuth } from "@/contexts/AuthContext";

const FULL_SCREEN_ROUTES = ["/kiosk", "/painel", "/painel-tv", "/painel-tv/select", "/portal", "/fila", "/auth", "/welcome"];

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  const isFullScreen = FULL_SCREEN_ROUTES.some(
    (r) => location.pathname === r || location.pathname.startsWith(r + "/")
  );

  if (!user || isFullScreen) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main>{children}</main>
    </div>
  );
}
