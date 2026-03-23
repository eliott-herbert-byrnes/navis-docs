"use client";
import { Bar, BarChart, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ProcedureChartData } from "@/features/dashboard/queries/procedure-chart-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const chartConfig = {
  count: { label: "Procedures", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

type DashboardProcedureChartProps = { data: ProcedureChartData };

export function DashboardProcedureChart({ data }: DashboardProcedureChartProps) {
  return (
    <Card className="shadow-none border-1">
      <CardHeader>
        <CardTitle className="text-md font-medium">Procedures Created</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="count" fill="var(--color-count)" radius={2} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}