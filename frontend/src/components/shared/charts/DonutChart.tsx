"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { chartPalette, tokens } from "@/lib/design-tokens";

export default function DonutChart({
  data,
  height = 220,
}: {
  data: { name: string; value: number }[];
  height?: number;
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={52}
          outerRadius={78}
          paddingAngle={3}
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${Math.round((Number(value) / total) * 100)}%`, ""]}
          contentStyle={{ borderRadius: 12, border: `1px solid ${tokens.dark[200]}`, fontSize: 13 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v) => <span style={{ fontSize: 11, color: tokens.dark[500] }}>{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
