import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => {
    let base =
      "inline-flex items-center justify-center rounded-lg font-medium transition px-4 py-2";

    let variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-200 text-black hover:bg-gray-300",
      destructive: "bg-red-600 text-white hover:bg-red-700",
    };

    let sizes = {
      sm: "text-sm px-3 py-1",
      md: "text-base px-4 py-2",
      lg: "text-lg px-6 py-3",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
