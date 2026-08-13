import type { ReactNode } from "react";

export const MAP_HEIGHT_PAGE = "h-[70vh] min-h-[280px]";
export const MAP_HEIGHT_HOME = "h-[50vh] min-h-[240px] sm:h-[55vh]";
export const MAP_HEIGHT_DIRECTORY = "h-[45vh] min-h-[220px] sm:h-[50vh]";
export const MAP_HEIGHT_PICKER = "h-[240px] sm:h-[260px]";

export function MapPlaceholder({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full min-h-[220px] w-full items-center justify-center rounded-xl border border-line/80 bg-white px-6 text-center text-sm text-muted">
      {children}
    </div>
  );
}

export function MapFrame({
  children,
  className,
  picker = false,
}: {
  children: ReactNode;
  className?: string;
  picker?: boolean;
}) {
  return (
    <div
      className={`alumni-map relative z-0 w-full overflow-hidden rounded-xl border border-line/80 bg-white shadow-sm ${
        picker ? "alumni-map-picker" : ""
      } ${className ?? "h-full min-h-[220px]"}`}
    >
      {children}
    </div>
  );
}
