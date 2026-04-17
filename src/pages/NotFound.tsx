import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <div className="glass w-full max-w-sm rounded-2xl p-6 text-center shadow-soft">
        <div className="h1 text-2xl">404</div>
        <div className="mt-2 text-sm text-black/60">That page doesn’t exist.</div>
        <div className="mt-5">
          <Link to="/home">
            <Button className="w-full">Go home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

