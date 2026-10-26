import Icon from "@/components/ui/Icon";

/** Trzy gwiazdki – wypełnione według wyniku. */
export default function Stars({ value, size = "h-4 w-4" }: { value: number; size?: string }) {
  return (
    <div className="flex shrink-0 gap-0.5" aria-label={`${value} z 3 gwiazdek`}>
      {[1, 2, 3].map((n) => (
        <Icon key={n} name="star" filled className={`${size} ${n <= value ? "text-amber-400" : "text-line"}`} />
      ))}
    </div>
  );
}
