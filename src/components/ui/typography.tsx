import * as React from "react";
import { cn } from "@/lib/utils";

export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  variant?: "default" | "muted" | "accent" | "destructive";
  weight?: "normal" | "medium" | "semibold" | "bold" | "extrabold";
}

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level = 1, variant = "default", weight = "bold", ...props }, ref) => {
    const Component = `h${level}` as keyof JSX.IntrinsicElements;
    
    const levelClasses = {
      1: "text-4xl lg:text-5xl leading-tight tracking-tight",
      2: "text-3xl lg:text-4xl leading-tight tracking-tight", 
      3: "text-2xl lg:text-3xl leading-tight tracking-tight",
      4: "text-xl lg:text-2xl leading-tight",
      5: "text-lg lg:text-xl leading-tight",
      6: "text-base lg:text-lg leading-tight"
    };

    const variantClasses = {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground", 
      destructive: "text-destructive"
    };

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold", 
      bold: "font-bold",
      extrabold: "font-extrabold"
    };

    return React.createElement(Component, {
      ref,
      className: cn(
        levelClasses[level],
        variantClasses[variant], 
        weightClasses[weight],
        className
      ),
      ...props
    });
  }
);
Heading.displayName = "Heading";

export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  size?: "xs" | "sm" | "base" | "lg" | "xl";
  variant?: "default" | "muted" | "accent" | "destructive";
  weight?: "normal" | "medium" | "semibold" | "bold";
  leading?: "tight" | "normal" | "relaxed" | "loose";
}

const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ 
    className, 
    size = "base", 
    variant = "default", 
    weight = "normal",
    leading = "normal",
    ...props 
  }, ref) => {
    const sizeClasses = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg", 
      xl: "text-xl"
    };

    const variantClasses = {
      default: "text-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive"
    };

    const weightClasses = {
      normal: "font-normal",
      medium: "font-medium", 
      semibold: "font-semibold",
      bold: "font-bold"
    };

    const leadingClasses = {
      tight: "leading-tight",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
      loose: "leading-loose"
    };

    return (
      <p
        ref={ref}
        className={cn(
          sizeClasses[size],
          variantClasses[variant],
          weightClasses[weight], 
          leadingClasses[leading],
          className
        )}
        {...props}
      />
    );
  }
);
Text.displayName = "Text";

export { Heading, Text };