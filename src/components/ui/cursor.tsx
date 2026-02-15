import { cn } from "@/lib/utils"

interface CursorProps {
  /** Display name shown on the label */
  name: string
  /** Optional message (e.g. "is typing...") */
  message?: string
  /** Cursor color — used for the pointer and label background */
  color?: string
  /** Absolute x position in pixels */
  x?: number
  /** Absolute y position in pixels */
  y?: number
  /** Additional class names */
  className?: string
}

export function Cursor({
  name,
  message,
  color = "#6366f1",
  x = 0,
  y = 0,
  className,
}: CursorProps) {
  return (
    <div
      className={cn("pointer-events-none absolute z-50", className)}
      style={{ left: x, top: y }}
    >
      {/* SVG arrow pointer */}
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-md"
      >
        <path
          d="M0.928548 0.25769L15.0708 8.72534C15.7587 9.12145 15.4477 10.1721 14.6534 10.1171L8.37029 9.6826C8.1308 9.66598 7.90019 9.77 7.74603 9.96245L5.82538 12.3594C5.33897 12.9665 4.36157 12.6453 4.34933 11.8688L4.15169 0.986982C4.13829 0.13847 5.08471 -0.339953 5.71959 0.14689L0.928548 0.25769Z"
          fill={color}
        />
        <path
          d="M1.15833 0.590088L14.5752 8.66205C14.9325 8.86791 14.7728 9.41007 14.3603 9.38151L8.07717 8.94699C7.59818 8.91384 7.13699 9.12185 6.82868 9.50673L4.90803 11.9037C4.66459 12.2073 4.17582 12.047 4.16971 11.6582L3.97206 0.776408C3.96536 0.351985 4.43857 0.113223 4.75601 0.356629L1.15833 0.590088Z"
          fill={color}
          stroke="white"
          strokeWidth="0.5"
        />
      </svg>

      {/* Name label */}
      <div
        className="ml-2.5 mt-0.5 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium text-white shadow-lg whitespace-nowrap"
        style={{ backgroundColor: color }}
      >
        <span>{name}</span>
        {message && (
          <span className="opacity-80 text-[10px]">— {message}</span>
        )}
      </div>
    </div>
  )
}
