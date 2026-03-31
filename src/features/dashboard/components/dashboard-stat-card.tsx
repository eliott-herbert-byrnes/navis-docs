import { DashboardStats } from "@/features/dashboard/queries/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, BookOpen, Building2 } from "lucide-react";

type DashboardStatCardsProps = { stats: DashboardStats };

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const cards = [
    { title: "Members", value: stats.totalUsers, icon: Users },
    { title: "Non-compliant Members", value: stats.nonCompliantUsers, icon: ShieldAlert },
    { title: "Procedures", value: stats.totalProcedures, icon: BookOpen },
    { title: "Departments", value: stats.totalDepartments, icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title} className={`shadow-none border-1 gap-2`}>
          <CardHeader className="flex flex-row items-center justify-start gap-3">
            <card.icon className={`h-9 w-9 p-1.5 rounded-sm border-1 bg-secondary`} strokeWidth={1.5} />
            <p className="text-2xl font-semibold">{card.value}</p>
          </CardHeader>
          <CardContent>
            <CardTitle className="text-md font-semibold">{card.title}</CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}