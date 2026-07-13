import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Field = ({
  label,
  value,
  onChange,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) => (
  <div>
    <Label className="text-[10px] font-medium tracking-wide text-muted-foreground">{label}</Label>
    <Input
      type="number"
      min={min}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="ark-input mt-1 h-9 font-mono text-xs tabular-nums"
    />
  </div>
);

export const Stat = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex flex-col">
    <span className="text-[10px] text-muted-foreground font-display uppercase tracking-wider">{label}</span>
    <span
      className={`text-sm font-display ${highlight ? "text-destructive animate-pulse-glow" : "text-foreground"}`}
    >
      {value}
    </span>
  </div>
);

export const ToggleOption = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);
