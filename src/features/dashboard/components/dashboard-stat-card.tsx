import { DashboardStats } from "@/features/dashboard/queries/dashboard-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldAlert, BookOpen, Building2 } from "lucide-react";

type DashboardStatCardsProps = { stats: DashboardStats };

export function DashboardStatCards({ stats }: DashboardStatCardsProps) {
  const cards = [
    {
      title: "Total Members",
      value: stats.totalUsers,
      icon: Users,
    },
    {
      title: "Non-compliant Members",
      value: stats.nonCompliantUsers,
      icon: ShieldAlert,
    },
    {
      title: "Total Procedures",
      value: stats.totalProcedures,
      icon: BookOpen,
    },
    {
      title: "Departments",
      value: stats.totalDepartments,
      icon: Building2,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}