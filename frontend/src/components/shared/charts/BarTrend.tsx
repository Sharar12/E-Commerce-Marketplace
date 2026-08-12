"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { chartPalette, tokens } from "@/lib/design-tokens";

export default function BarTrend({
  data,
  dataKey = "value",
  height = 240,
}: {
  data: { label: string; value: number }[];
  dataKey?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={tokens.dark[200]} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: tokens.dark[400] }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 10, fill: tokens.dark[400] }} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${tokens.dark[200]}`, fontSize: 13 }} />
        <Bar dataKey={dataKey} fill={chartPalette[2]} radius={[6, 6, 0, 0]} maxBarSize={34} />
      </BarChart>
    </ResponsiveContainer>
  );
}
