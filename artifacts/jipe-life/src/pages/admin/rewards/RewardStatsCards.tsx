import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Gift,
  CheckCircle,
  Truck,
  IndianRupee,
} from "lucide-react";

interface RewardStatsCardsProps {
  pendingCount: number;
  approvedCount: number;
  deliveredCount: number;
  totalCashPaid: number;
}

export default function RewardStatsCards({
  pendingCount,
  approvedCount,
  deliveredCount,
  totalCashPaid,
}: RewardStatsCardsProps) {
  const cards = [
    {
      title: "Total Claimed",
      value: pendingCount,
      icon: Gift,
    },
    {
      title: "Total Approved",
      value: approvedCount,
      icon: CheckCircle,
    },
    {
      title: "Total Delivered",
      value: deliveredCount,
      icon: Truck,
    },
    {
      title: "Total Cash Paid",
      value: `₹${Number(totalCashPaid).toLocaleString()}`,
      icon: IndianRupee,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>

              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {card.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}