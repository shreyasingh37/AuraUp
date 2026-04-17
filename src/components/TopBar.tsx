import useAuth from "../services/auth/useAuth";
import { formatLongDate, todayLocalISO } from "../services/date";
import Button from "./ui/Button";

export default function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-[rgba(251,251,248,0.78)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <div className="h1 text-lg leading-none">AuraUp</div>
          <div className="text-xs text-black/60">{formatLongDate(todayLocalISO())}</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden max-w-[9rem] truncate text-xs text-black/60 sm:block">
            {user?.email ?? ""}
          </div>
          <Button variant="ghost" onClick={() => void signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
}

