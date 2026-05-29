import * as React from "react";

import { cn } from "@/lib/utils";

function Badge({
  className,
  variant = "default",
  children,
  ...props
}) {

  const variants = {
    default:
      "bg-primary text-primary-foreground border-transparent",

    secondary:
      "bg-secondary text-secondary-foreground border-transparent",

    destructive:
      "bg-destructive text-destructive-foreground border-transparent",

    outline:
      "text-foreground",
  };

  return (

    <div
      className={cn(
        `
          inline-flex
          items-center
          rounded-full
          border
          px-2.5
          py-0.5
          text-xs
          font-semibold
          transition-colors
          focus:outline-none
          focus:ring-2
          focus:ring-ring
          focus:ring-offset-2
        `,
        variants[variant],
        className
      )}
      {...props}
    >

      {children}

    </div>
  );
}

export { Badge };