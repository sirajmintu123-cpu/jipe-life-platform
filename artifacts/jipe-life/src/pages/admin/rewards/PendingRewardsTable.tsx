import { useMemo, useState } from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import {
  Button,
} from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { toast } from "sonner";

import { approveReward } from "@/services/adminRewards";

interface Reward {
  rewardId: number;
  memberId: string;
  name: string;
  phone: string;

  tier: number;

  rewardName: string;

  cashValue: string;

  rewardType: string;

  achievedAt: string;

  status: string;
}

interface PendingRewardsTableProps {
  rewards: Reward[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

export default function PendingRewardsTable({
  rewards,
  loading,
  refreshData,
}: PendingRewardsTableProps) {
  const [search, setSearch] = useState("");

  const [selectedReward, setSelectedReward] =
    useState<Reward | null>(null);

  const [approving, setApproving] =
    useState(false);

  const filteredRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const term = search.toLowerCase();

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

  async function handleApprove() {
    if (!selectedReward) return;

    try {
      setApproving(true);

      await approveReward(
        selectedReward.rewardId
      );

      toast.success(
        "Reward approved successfully"
      );

      setSelectedReward(null);

      await refreshData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to approve reward"
      );
    } finally {
      setApproving(false);
    }
  }

  return (
    <>
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
                    Phone
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
                    Achieved
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
                      No rewards found
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
                          {reward.phone}
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
                          {new Date(
                            reward.achievedAt
                          ).toLocaleDateString()}
                        </TableCell>

                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() =>
                              setSelectedReward(
                                reward
                              )
                            }
                          >
                            Approve
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

      <Dialog
        open={!!selectedReward}
        onOpenChange={() =>
          setSelectedReward(null)
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Approve Reward
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <p>
              Reward:
              {" "}
              {
                selectedReward?.rewardName
              }
            </p>

            <p>
              Member:
              {" "}
              {selectedReward?.name}
            </p>

            <p>
              Value:
              {" "}
              ₹
              {Number(
                selectedReward?.cashValue ??
                  0
              ).toLocaleString()}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setSelectedReward(null)
              }
            >
              Cancel
            </Button>

            <Button
              disabled={approving}
              onClick={handleApprove}
            >
              {approving
                ? "Approving..."
                : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}