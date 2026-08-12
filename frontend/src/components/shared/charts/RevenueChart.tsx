"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartPalette, tokens } from "@/lib/design-tokens";
import { formatBDT } from "@/lib/utils";

export default function RevenueChart({
  data,
  height = 260,
}: {
  data: { label: string; value: number }[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartPalette[0]} stopOpacity={0.28} />
            <stop offset="100%" stopColor={chartPalette[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={tokens.dark[200]} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: tokens.dark[400] }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 10, fill: tokens.dark[400] }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => formatBDT(v, { compact: true })}
          width={48}
        />
        <Tooltip
          formatter={(value) => [formatBDT(Number(value)), "Revenue"]}
          contentStyle={{ borderRadius: 12, border: `1px solid ${tokens.dark[200]}`, fontSize: 13 }}
        />
        <Area type="monotone" dataKey="value" stroke={chartPalette[0]} strokeWidth={2.5} fill="url(#revGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
