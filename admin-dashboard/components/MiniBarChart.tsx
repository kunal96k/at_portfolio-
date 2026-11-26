export interface ChartPoint {
  label: string;
  enquiriesCount: number;
  contentCount: number;
}

interface MiniBarChartProps {
  data: ChartPoint[];
  metric: 'contentCount' | 'enquiriesCount';
}

export function MiniBarChart({ data, metric }: MiniBarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[#E2E8F0] bg-[#F8FAFC] text-xs text-[#64748B]">
        No activity recorded in the last 7 days.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => d[metric]), 1);
  const roundedMax = Math.max(5, Math.ceil(maxVal / 5) * 5);

  return (
    <div className="w-full">
      <div
        className="flex items-end justify-between gap-2 pt-3 sm:gap-3"
        role="img"
        aria-label={`7-day ${metric === 'contentCount' ? 'content activity' : 'enquiries'} bar chart`}
      >
        {data.map((point) => {
          const value = point[metric];
          const pct =
            value === 0
              ? 6
              : Math.max(12, Math.round((value / roundedMax) * 100));
          return (
            <div
              key={point.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <span className="text-[11px] font-semibold text-[#475569] tabular-nums">
                {value}
              </span>
              <div className="flex h-36 w-full max-w-[38px] items-end rounded-lg bg-[#F5F7FC] p-1">
                <div
                  className={`w-full rounded-md transition-all duration-300 ${value === 0
                      ? 'bg-[#E2E8F0]'
                      : metric === 'contentCount'
                        ? 'bg-[#145BFF]'
                        : 'bg-[#0B1736]'
                    }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="truncate text-[11px] font-medium text-[#64748B] sm:text-xs">
                {point.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
