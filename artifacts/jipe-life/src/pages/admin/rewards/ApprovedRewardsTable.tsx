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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Textarea } from "@/components/ui/textarea";

import { toast } from "sonner";

import { deliverReward } from "@/services/adminRewards";

interface Reward {
  rewardId: number;
  memberId: string;
  name: string;
  phone: string;

  tier: number;

  rewardName: string;

  cashValue: string;

  rewardType: string;

  approvedAt: string;

  status: string;
}

interface ApprovedRewardsTableProps {
  rewards: Reward[];
  loading: boolean;
  refreshData: () => Promise<void>;
}

export default function ApprovedRewardsTable({
  rewards,
  loading,
  refreshData,
}: ApprovedRewardsTableProps) {
  const [search, setSearch] = useState("");

  const [selectedReward, setSelectedReward] =
    useState<Reward | null>(null);

  const [remarks, setRemarks] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

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

  async function handleDeliver() {
    if (!selectedReward) return;

    try {
      setSubmitting(true);

      await deliverReward(
        selectedReward.rewardId,
        remarks
      );

      toast.success(
        "Reward delivered successfully"
      );

      setSelectedReward(null);
      setRemarks("");

      await refreshData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
          "Failed to deliver reward"
      );
    } finally {
      setSubmitting(false);
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
                    Approved Date
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
                      colSpan={9}
                      className="text-center"
                    >
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredRewards.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center"
                    >
                      No approved rewards
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
                          {reward.approvedAt
                            ? new Date(
                                reward.approvedAt
                              ).toLocaleDateString()
                            : "-"}
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
                            Deliver
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
        onOpenChange={(open) => {
          if (!open) {
            setSelectedReward(null);
            setRemarks("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Deliver Reward
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <p className="font-medium">
                Reward
              </p>
              <p>
                {
                  selectedReward?.rewardName
                }
              </p>
            </div>

            <div>
              <p className="font-medium">
                Member
              </p>
              <p>
                {selectedReward?.name}
              </p>
            </div>

            <div>
              <p className="font-medium">
                Cash Value
              </p>
              <p>
                ₹
                {Number(
                  selectedReward?.cashValue ??
                    0
                ).toLocaleString()}
              </p>
            </div>

            <Textarea
              placeholder="Delivery remarks..."
              value={remarks}
              onChange={(e) =>
                setRemarks(e.target.value)
              }
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedReward(
                  null
                );
                setRemarks("");
              }}
            >
              Cancel
            </Button>

            <Button
              disabled={submitting}
              onClick={handleDeliver}
            >
              {submitting
                ? "Processing..."
                : "Mark Delivered"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}