import type { ReactNode } from "react";

export function FeedbackList({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <div className="text-sm font-medium">{title}</div>
      </div>
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={i} className="text-sm text-muted-foreground flex gap-2 leading-relaxed">
            <span className="text-primary mt-1.5 size-1 rounded-full bg-current shrink-0" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
