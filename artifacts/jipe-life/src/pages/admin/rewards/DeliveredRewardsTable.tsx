import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

interface Reward {
  rewardId: number;
  memberId: string;
  name: string;
  phone: string;

  tier: number;

  rewardName: string;

  cashValue: string;

  rewardType: string;

  deliveredAt: string;

  remarks?: string;

  status: string;
}

interface DeliveredRewardsTableProps {
  rewards: Reward[];
  loading: boolean;
}

export default function DeliveredRewardsTable({
  rewards,
  loading,
}: DeliveredRewardsTableProps) {
  const [search, setSearch] = useState("");

  const filteredRewards = useMemo(() => {
    const term = search.toLowerCase();

    return rewards.filter((reward) => {
      return (
        reward.memberId
          ?.toLowerCase()
          .includes(term) ||
        reward.name
          ?.toLowerCase()
          .includes(term) ||
        reward.rewardName
          ?.toLowerCase()
          .includes(term)
      );
    });
  }, [rewards, search]);

  function handleViewDetails(
    reward: Reward
  ) {
    console.log(
      "Reward Details:",
      reward
    );

    // Future:
    // Open RewardDetailsModal
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <Input
          placeholder="Search rewards..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>

                <TableHead>
                  Member ID
                </TableHead>

                <TableHead>
                  Name
                </TableHead>

                <TableHead>
                  Tier
                </TableHead>

                <TableHead>
                  Reward
                </TableHead>

                <TableHead>
                  Value
                </TableHead>

                <TableHead>
                  Type
                </TableHead>

                <TableHead>
                  Delivered Date
                </TableHead>

                <TableHead>
                  Remarks
                </TableHead>

                <TableHead>
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center"
                  >
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRewards.length ===
                0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="text-center"
                  >
                    No delivered rewards
                  </TableCell>
                </TableRow>
              ) : (
                filteredRewards.map(
                  (reward) => (
                    <TableRow
                      key={
                        reward.rewardId
                      }
                    >
                      <TableCell>
                        {
                          reward.rewardId
                        }
                      </TableCell>

                      <TableCell>
                        {
                          reward.memberId
                        }
                      </TableCell>

                      <TableCell>
                        {reward.name}
                      </TableCell>

                      <TableCell>
                        Tier {
                          reward.tier
                        }
                      </TableCell>

                      <TableCell>
                        {
                          reward.rewardName
                        }
                      </TableCell>

                      <TableCell>
                        ₹
                        {Number(
                          reward.cashValue
                        ).toLocaleString()}
                      </TableCell>

                      <TableCell>
                        {
                          reward.rewardType
                        }
                      </TableCell>

                      <TableCell>
                        {reward.deliveredAt
                          ? new Date(
                              reward.deliveredAt
                            ).toLocaleDateString()
                          : "-"}
                      </TableCell>

                      <TableCell>
                        {reward.remarks ||
                          "-"}
                      </TableCell>

                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleViewDetails(
                              reward
                            )
                          }
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                )
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}