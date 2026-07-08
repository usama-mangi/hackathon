import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-1.5 text-xs text-on-surface-variant font-medium flex-wrap ${className}`}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast || !item.href ? (
              <span
                className={isLast ? "text-on-surface font-semibold truncate" : ""}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-primary transition-colors">
                {item.label}
              </Link>
            )}
            {!isLast && <ChevronRight className="h-3 w-3 text-outline shrink-0" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
