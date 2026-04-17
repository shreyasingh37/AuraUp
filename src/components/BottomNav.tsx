import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

function NavIcon({
  active,
  path,
}: {
  active: boolean;
  path: ReactNode;
}) {
  return (
    <span
      className={[
        "grid h-10 w-10 place-items-center rounded-full transition",
        active ? "bg-black text-white shadow-soft" : "bg-white/60 text-black",
      ].join(" ")}
    >
      {path}
    </span>
  );
}

function Item({
  to,
  label,
  icon,
}: {
  to: string;
  label: string;
  icon: (active: boolean) => ReactNode;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "flex flex-col items-center gap-1 px-2 py-2 text-xs",
          isActive ? "text-black" : "text-black/60",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          {icon(isActive)}
          <span className="font-medium">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="mx-auto w-full max-w-md px-4 pb-4 pt-3 safe-bottom">
        <div className="glass flex items-center justify-between rounded-2xl px-2 shadow-soft">
          <Item
            to="/home"
            label="Home"
            icon={(active) => (
              <NavIcon
                active={active}
                path={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 11.5L12 4l8 7.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 21.5V14.2c0-.66.54-1.2 1.2-1.2h2.6c.66 0 1.2.54 1.2 1.2v7.3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
            )}
          />
          <Item
            to="/progress"
            label="Progress"
            icon={(active) => (
              <NavIcon
                active={active}
                path={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 19V9m7 10V5m7 14v-7"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
            )}
          />
          <Item
            to="/upload"
            label="Upload"
            icon={(active) => (
              <NavIcon
                active={active}
                path={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 4v10"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 9l5-5 5 5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 20h14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
            )}
          />
        </div>
      </div>
    </nav>
  );
}
