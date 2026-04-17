import { Outlet, useLocation } from "react-router-dom";
import BottomNav from "./BottomNav";
import TopBar from "./TopBar";

export default function AppShell() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen">
      <TopBar />
      <main className="mx-auto w-full max-w-md px-4 pb-28 pt-5">
        <div key={pathname} className="animate-fadeUp">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

