import { Badge } from "@workspace/ui/components/badge";

// Helper function to render badges
export function renderBadge(
  value: boolean | string,
  {
    trueLabel = "Verified",
    falseLabel = "Not Verified",
    trueVariant = "outline",
    falseVariant = "secondary",
  } = {}
): React.ReactNode {
  const isTrue = Boolean(value);
  const variant = isTrue ? trueVariant : falseVariant;

  // Ensure variant is one of the valid Badge variants
  const validVariants = ["default", "secondary", "destructive", "outline"];
  const safeVariant = validVariants.includes(variant)
    ? (variant as "default" | "secondary" | "destructive" | "outline")
    : "outline";

  return <Badge variant={safeVariant}>{isTrue ? trueLabel : falseLabel}</Badge>;
}
