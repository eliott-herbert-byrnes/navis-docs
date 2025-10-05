"use client";
import { Button } from "@/components/ui/button";
import { LucideLoaderCircle } from "lucide-react";
import { cloneElement } from "react";
import { useFormStatus } from "react-dom";

type submitButtonProps = {
  label?: string;
  icon?: React.ReactElement<{ className: string }>;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  className?: string;
};

const SubmitButton = ({
  label,
  icon,
  variant,
  size,
  disabled,
  className,
}: submitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      disabled={pending || disabled}
      type="submit"
      variant={variant}
      size={size}
      className={className}
    >
      {pending ? (
        <LucideLoaderCircle className="h-4 w-4 animate-spin" />
      ) : icon ? (
        <>
          {cloneElement(icon, {
            className: "w-4 h-4",
          })}
        </>
      ) : null}
      {label}
    </Button>
  );
};

export { SubmitButton };
