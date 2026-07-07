import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";

interface Reward {
  rewardId: number;
  memberId: string;
  name: string;
  phone: string;

  tier: number;

  rewardName: string;

  cashValue: string;

  rewardType: string;

  status: string;

  achievedAt?: string;
  approvedAt?: string;
  deliveredAt?: string;

  remarks?: string;
}

interface RewardDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reward: Reward | null;
}

export default function RewardDetailsModal({
  open,
  onOpenChange,
  reward,
}: RewardDetailsModalProps) {
  if (!reward) return null;

  const getStatusVariant = () => {
    switch (reward.status) {
      case "claimed":
        return "secondary";

      case "approved":
        return "default";

      case "delivered":
        return "outline";

      default:
        return "secondary";
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Reward Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* Reward Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Reward ID
              </p>

              <p className="font-medium">
                #{reward.rewardId}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">
                Status
              </p>

              <Badge variant={getStatusVariant()}>
                {reward.status}
              </Badge>
            </div>
          </div>

          {/* Member Details */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">
              Member Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Member ID
                </p>

                <p>{reward.memberId}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Name
                </p>

                <p>{reward.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Phone
                </p>

                <p>{reward.phone}</p>
              </div>
            </div>
          </div>

          {/* Reward Details */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">
              Reward Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  Tier
                </p>

                <p>
                  Tier {reward.tier}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Reward Name
                </p>

                <p>{reward.rewardName}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Reward Type
                </p>

                <p>{reward.rewardType}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Cash Value
                </p>

                <p>
                  ₹
                  {Number(
                    reward.cashValue
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">
              Timeline
            </h3>

            <div className="space-y-3">

              <div>
                <p className="text-sm text-muted-foreground">
                  Achieved At
                </p>

                <p>
                  {reward.achievedAt
                    ? new Date(
                        reward.achievedAt
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Approved At
                </p>

                <p>
                  {reward.approvedAt
                    ? new Date(
                        reward.approvedAt
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Delivered At
                </p>

                <p>
                  {reward.deliveredAt
                    ? new Date(
                        reward.deliveredAt
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

            </div>
          </div>

          {/* Remarks */}
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-semibold">
              Remarks
            </h3>

            <p>
              {reward.remarks?.trim()
                ? reward.remarks
                : "No remarks available"}
            </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}