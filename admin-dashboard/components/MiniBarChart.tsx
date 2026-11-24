interface ChartPoint {
  label: string;
  enquiries: number;
  downloads: number;
}

interface MiniBarChartProps {
  data: ChartPoint[];
  metric: 'downloads' | 'enquiries';
}

export function MiniBarChart({ data, metric }: MiniBarChartProps) {
  const maxVal = Math.max(...data.map((d) => d[metric]), 1);
  const roundedMax = Math.ceil(maxVal / 10) * 10 || 10;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between gap-2 pt-3 sm:gap-3" role="img" aria-label={`Weekly ${metric} bar chart`}>
        {data.map((point) => {
          const value = point[metric];
          const pct = Math.max(8, Math.round((value / roundedMax) * 100));
          return (
            <div key={point.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className="text-[11px] font-semibold text-[#475569] tabular-nums">
                {value}
              </span>
              <div className="flex h-36 w-full max-w-[38px] items-end rounded-lg bg-[#F5F7FC] p-1">
                <div
                  className={`w-full rounded-md transition-all duration-300 ${
                    metric === 'downloads' ? 'bg-[#145BFF]' : 'bg-[#0B1736]'
                  }`}
                  style={{ height: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-medium text-[#64748B]">{point.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
