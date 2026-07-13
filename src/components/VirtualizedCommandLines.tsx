import { useCallback, useRef, useState, type UIEvent } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

const ROW_PX = 22;
const DEFAULT_VIEW_HEIGHT = 288;

type Props = {
  lines: string[];
  /** Scrollport max height in CSS px (default 288 ≈ max-h-72). */
  maxHeightPx?: number;
  className?: string;
  /** 1-based indices in the gutter (default off). */
  showLineNumbers?: boolean;
};

/**
 * Renders only visible rows so huge command lists (100k+) stay scrollable without mounting every line.
 */
export default function VirtualizedCommandLines({
  lines,
  maxHeightPx = DEFAULT_VIEW_HEIGHT,
  className,
  showLineNumbers = false,
}: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef(0);
  const pendingTopRef = useRef(0);

  const onScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    pendingTopRef.current = e.currentTarget.scrollTop;
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setScrollTop(pendingTopRef.current);
    });
  }, []);

  const copyLine = useCallback(async (line: string, lineNo: number) => {
    try {
      await navigator.clipboard.writeText(line);
      toast.success(`Copied line ${lineNo.toLocaleString()}`);
    } catch (err: unknown) {
      logger.warn("VirtualizedCommandLines: clipboard copy failed", err);
      toast.error("Clipboard denied");
    }
  }, []);

  const overscan = 8;
  const totalH = lines.length * ROW_PX;
  const start = Math.max(0, Math.floor(scrollTop / ROW_PX) - overscan);
  const end = Math.min(lines.length, Math.ceil((scrollTop + maxHeightPx) / ROW_PX) + overscan);
  const slice = lines.slice(start, end);
  const gutterCh = showLineNumbers ? Math.max(3, String(lines.length).length + 1) : 0;

  return (
    <div
      className={cn(
        "ark-code-block scrollbar-ark overflow-y-auto overflow-x-hidden rounded-md border border-border/30 bg-black/20",
        className,
      )}
      style={{ maxHeight: maxHeightPx }}
      onScroll={onScroll}
      role="list"
      aria-label={`Commands, ${lines.length.toLocaleString()} lines`}
    >
      <div className="relative" style={{ height: totalH, minHeight: lines.length ? undefined : maxHeightPx }}>
        <div className="absolute left-0 right-0 top-0" style={{ transform: `translateY(${start * ROW_PX}px)` }}>
          {slice.map((line, i) => {
            const globalIndex = start + i + 1;
            return (
              <div
                key={start + i}
                role="listitem"
                className="group box-border flex h-[22px] items-center gap-0.5 border-b border-border/15 px-0.5 font-mono text-[10px] leading-none text-foreground/95"
              >
                {showLineNumbers ? (
                  <span
                    className="shrink-0 select-none text-right tabular-nums text-muted-foreground/80"
                    style={{ width: `${gutterCh}ch` }}
                  >
                    {globalIndex}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 truncate pr-1" title={line.length > 200 ? line.slice(0, 500) : line}>
                  {line}
                </span>
                <button
                  type="button"
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-primary/15 hover:text-primary group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  aria-label={`Copy line ${globalIndex}`}
                  onClick={() => void copyLine(line, globalIndex)}
                >
                  <Copy className="h-3 w-3" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
