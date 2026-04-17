import React from "react";

export default function Card({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["glass rounded-2xl p-4 shadow-soft", className].join(" ")} {...props} />;
}

