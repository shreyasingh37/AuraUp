import Card from "./ui/Card";

export default function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Card className="text-center">
      <div className="h1 text-2xl">{title}</div>
      <div className="mt-2 text-sm text-black/60">{body}</div>
    </Card>
  );
}

