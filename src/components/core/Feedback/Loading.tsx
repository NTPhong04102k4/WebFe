import LoadingSpinner from "src/components/common/LoadingSpinner";

export type LoadingProps = {
  label?: string;
  className?: string;
};

export function Loading({ label = "Dang tai...", className = "" }: LoadingProps) {
  return (
    <div className={`flex items-center justify-center gap-3 py-8 text-sm text-slate-500 ${className}`}>
      <LoadingSpinner size="sm" />
      <span>{label}</span>
    </div>
  );
}
