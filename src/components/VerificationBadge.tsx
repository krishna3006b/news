
import { cn, formatVerificationScore, getVerificationLevel } from "@/lib/utils";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface VerificationBadgeProps {
  score: number;
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function VerificationBadge({
  score,
  className,
  showLabel = true,
  size = "md",
}: VerificationBadgeProps) {
  const level = getVerificationLevel(score);
  
  const sizeClasses = {
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-2.5",
    lg: "text-base py-1.5 px-3",
  };
  
  const getIcon = () => {
    switch (level) {
      case "high":
        return <CheckCircle className="w-4 h-4" />;
      case "medium":
        return <AlertTriangle className="w-4 h-4" />;
      case "low":
        return <XCircle className="w-4 h-4" />;
    }
  };
  
  const getLabel = () => {
    switch (level) {
      case "high":
        return "Verified";
      case "medium":
        return "Questionable";
      case "low":
        return "Unverified";
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full border font-medium",
        sizeClasses[size],
        level === "high" && "bg-truth-high/10 text-truth-high border-truth-high/20",
        level === "medium" && "bg-truth-medium/10 text-truth-medium border-truth-medium/20",
        level === "low" && "bg-truth-low/10 text-truth-low border-truth-low/20",
        className
      )}
    >
      {getIcon()}
      {showLabel ? (
        <span>
          {getLabel()} • {formatVerificationScore(score)}
        </span>
      ) : (
        <span>{formatVerificationScore(score)}</span>
      )}
    </div>
  );
}
