import {
  Clapperboard,
  Flame,
  GraduationCap,
  HeartPulse,
  ReceiptText,
  ShoppingBag,
  Soup,
  Plane,
  UtensilsCrossed,
  Zap,
  type LucideIcon
} from "lucide-react";

export const spendCategories = [
  "Dining",
  "Groceries",
  "Travel",
  "Fuel",
  "Shopping",
  "Entertainment",
  "Utilities",
  "Healthcare",
  "Education",
  "Other"
];

type CategoryMeta = {
  label: string;
  short: string;
  className: string;
  iconClassName: string;
  icon: LucideIcon;
};

const categoryStyles: Record<string, CategoryMeta> = {
  Dining: {
    label: "Dining",
    short: "D",
    className: "bg-amber-100 text-amber-700",
    iconClassName: "bg-amber-100 text-amber-700",
    icon: UtensilsCrossed
  },
  Groceries: {
    label: "Groceries",
    short: "G",
    className: "bg-emerald-100 text-emerald-700",
    iconClassName: "bg-emerald-100 text-emerald-700",
    icon: Soup
  },
  Travel: {
    label: "Travel",
    short: "T",
    className: "bg-sky-100 text-sky-700",
    iconClassName: "bg-sky-100 text-sky-700",
    icon: Plane
  },
  Fuel: {
    label: "Fuel",
    short: "F",
    className: "bg-orange-100 text-orange-700",
    iconClassName: "bg-orange-100 text-orange-700",
    icon: Flame
  },
  Shopping: {
    label: "Shopping",
    short: "S",
    className: "bg-cyan-100 text-cyan-700",
    iconClassName: "bg-cyan-100 text-cyan-700",
    icon: ShoppingBag
  },
  Entertainment: {
    label: "Entertainment",
    short: "E",
    className: "bg-pink-100 text-pink-700",
    iconClassName: "bg-pink-100 text-pink-700",
    icon: Clapperboard
  },
  Utilities: {
    label: "Utilities",
    short: "U",
    className: "bg-blue-100 text-blue-700",
    iconClassName: "bg-blue-100 text-blue-700",
    icon: Zap
  },
  Healthcare: {
    label: "Healthcare",
    short: "H",
    className: "bg-rose-100 text-rose-700",
    iconClassName: "bg-rose-100 text-rose-700",
    icon: HeartPulse
  },
  Education: {
    label: "Education",
    short: "Ed",
    className: "bg-teal-100 text-teal-700",
    iconClassName: "bg-teal-100 text-teal-700",
    icon: GraduationCap
  },
  Other: {
    label: "Other",
    short: "O",
    className: "bg-neutral-100 text-neutral-700",
    iconClassName: "bg-neutral-100 text-neutral-700",
    icon: ReceiptText
  }
};

export function getCategoryMeta(category: string) {
  return categoryStyles[category] ?? {
    label: category,
    short: category.slice(0, 2).toUpperCase(),
    className: "bg-neutral-100 text-neutral-700",
    iconClassName: "bg-neutral-100 text-neutral-700",
    icon: ReceiptText
  };
}
