import AdminLayout from "@/components/AdminLayout";
import { useAdminListUsers, useAdminUpdateUserStatus, getAdminListUsersQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, ShieldOff, ShieldCheck, User, Wallet, Gift, ChevronDown, Eye, Users, TrendingUp, Layers, Award } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PKG_COLORS: Record<string, string> = {
  starter: "bg-sky-100 text-sky-800",
  smart: "bg-blue-100 text-blue-800",
  silver: "bg-gray-100 text-gray-700",
  gold: "bg-amber-100 text-amber-800",
};

export default function AdminUsers() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const updateStatus = useAdminUpdateUserStatus();

  const { data, isLoading } = useAdminListUsers(
    { page, search: search || undefined, status: statusFilter },
    { query: { queryKey: getAdminListUsersQueryKey({ page, search: search || undefined, status: statusFilter }) } }
  );

  function toggleStatus(userId: number, current: string) {
    const newStatus = current === "active" ? "blocked" : "active";
    updateStatus.mutate({ userId, data: { status: newStatus as any } }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getAdminListUsersQueryKey({}) });
        toast({ title: `User ${newStatus === "active" ? "unblocked" : "blocked"} successfully` });
      },
      onError: () => toast({ title: "Action failed", variant: "destructive" }),
    });
  }

  function openProfile(user: any) {
    setSelectedUser(user);
    setIsProfileOpen(true);
  }

  function closeProfile() {
    setIsProfileOpen(false);
    setSelectedUser(null);
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F2D59]">User Management</h1>
            <p className="text-sm text-muted-foreground">View, search, and manage all members</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {data?.total ?? 0} users
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or member ID..."
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              data-testid="input-user-search"
            />
          </div>
          {["all", "active", "blocked"].map(s => (
            <Button
              key={s}
              variant={statusFilter === (s === "all" ? undefined : s) || (s === "all" && !statusFilter) ? "default" : "outline"}
              size="sm"
              className={statusFilter === (s === "all" ? undefined : s) || (s === "all" && !statusFilter) ? "bg-[#0F2D59]" : ""}
              onClick={() => { setStatusFilter(s === "all" ? undefined : s); setPage(1); }}
              data-testid={`filter-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Member ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Sponsor</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Package</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">BV</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Pairs</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Reward</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Wallet</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">CTO</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={11} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td></tr>
                ))}
                {!isLoading && (data?.data?.length ?? 0) === 0 && (
                  <tr><td colSpan={11} className="text-center py-8 text-muted-foreground">No users found</td></tr>
                )}
                {data?.data?.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-gray-50" data-testid={`user-row-${u.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-[#0F2D59] font-bold">{u.memberId}</td>
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{u.sponsorId || "N/A"}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${PKG_COLORS[u.package ?? "starter"]}`}>{u.package?.toUpperCase()}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-[#0F2D59]">{u.bv}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600">
                      {u.lifetimePairs ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className="bg-purple-100 text-purple-800">
                        Tier {u.rewardLevel ?? 0}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-600">
                      ₹{u.walletBalance ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${u.ctoActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700"}`}>
                        {u.ctoActive ? "Active" : "Off"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`text-xs ${u.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {u.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ChevronDown size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openProfile(u)}>
                            <Eye size={14} className="mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {/* Navigate to wallet */}}>
                            <Wallet size={14} className="mr-2" />
                            View Wallet
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {/* Navigate to rewards */}}>
                            <Gift size={14} className="mr-2" />
                            View Rewards
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={u.status === "active" ? "text-red-600" : "text-emerald-600"}
                            onClick={() => toggleStatus(u.id, u.status)}
                            disabled={updateStatus.isPending}
                          >
                            {u.status === "active" ? (
                              <><ShieldOff size={14} className="mr-2" />Block User</>
                            ) : (
                              <><ShieldCheck size={14} className="mr-2" />Unblock User</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data && data.total > 20 && (
            <div className="p-4 border-t border-border flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{data.total} total · Page {page}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= data.total}>Next</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={closeProfile}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl text-[#0F2D59]">
              Member Profile
            </DialogTitle>
            <DialogDescription>
              {selectedUser?.memberId} - {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="member" className="mt-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto bg-slate-100 p-1 rounded-lg">

  <TabsTrigger value="member" className="flex items-center gap-2">
    <User size={14} />
    Member
  </TabsTrigger>

  <TabsTrigger value="sponsor" className="flex items-center gap-2">
    <Users size={14} />
    Sponsor
  </TabsTrigger>

  <TabsTrigger value="binary" className="flex items-center gap-2">
    <TrendingUp size={14} />
    Binary
  </TabsTrigger>

  <TabsTrigger value="wallet" className="flex items-center gap-2">
    <Wallet size={14} />
    Wallet
  </TabsTrigger>

  <TabsTrigger value="rewards" className="flex items-center gap-2">
    <Award size={14} />
    Rewards
  </TabsTrigger>

  <TabsTrigger value="cto" className="flex items-center gap-2">
    <Layers size={14} />
    CTO
  </TabsTrigger>

</TabsList>
              {/* Member Information */}
              <TabsContent value="member" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Member ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">{selectedUser.memberId}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold">{selectedUser.name}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Email</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedUser.email}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Phone</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedUser.phone}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={`${PKG_COLORS[selectedUser.package ?? "starter"]}`}>
                        {selectedUser.package?.toUpperCase()}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className={selectedUser.status === "active" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                        {selectedUser.status}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Joined</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">BV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">{selectedUser.bv}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Sponsor Information */}
              <TabsContent value="sponsor" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sponsor ID</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">{selectedUser.sponsorId || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sponsor Name</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold">{selectedUser.sponsorName || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sponsor Package</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedUser.sponsorPackage || "N/A"}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Sponsor Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedUser.sponsorStatus || "N/A"}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Binary Information */}
              <TabsContent value="binary" className="space-y-4">
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Left BV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-blue-600">{selectedUser.leftBv ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Right BV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-orange-600">{selectedUser.rightBv ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Pairs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-indigo-600">{selectedUser.lifetimePairs ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Today's Pairs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-emerald-600">{selectedUser.todayPairs ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Matching Income</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">₹{selectedUser.matchingIncome ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Family Bonus</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">₹{selectedUser.familyBonus ?? 0}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Wallet Information */}
              <TabsContent value="wallet" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card className="col-span-2 bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-emerald-600">₹{selectedUser.walletBalance ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">₹{selectedUser.totalEarned ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">₹{selectedUser.totalWithdrawn ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Withdrawal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-amber-600">₹{selectedUser.pendingWithdrawal ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Cash Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-purple-600">₹{selectedUser.totalRewards ?? 0}</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Reward Information */}
              <TabsContent value="rewards" className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Current Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                        Tier {selectedUser.rewardLevel ?? 0}
                      </Badge>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Next Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-[#0F2D59]">
                        {selectedUser.nextTier ? `Tier ${selectedUser.nextTier}` : "Max Level"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pairs to Next Tier</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-amber-600">
                        {selectedUser.pairsToNextTier ?? 0} pairs
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Rewards Earned</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-bold text-purple-600">{selectedUser.totalRewardsEarned ?? 0}</p>
                    </CardContent>
                  </Card>
                  <Card className="col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Recent Rewards</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedUser.recentRewards?.length ? (
                        <div className="space-y-2">
                          {selectedUser.recentRewards.map((reward: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                              <span className="text-sm">{reward.name}</span>
                              <Badge className="text-xs">{reward.status}</Badge>
                              <span className="text-sm font-bold">₹{reward.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No rewards earned yet</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

<TabsContent value="cto" className="space-y-4">
  <div className="grid grid-cols-2 gap-4 mt-4">

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          CTO Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Badge
          className={
            selectedUser.ctoActive
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700"
          }
        >
          {selectedUser.ctoActive ? "Active" : "Inactive"}
        </Badge>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          CTO Total Received
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-bold text-green-600">
          ₹{selectedUser.ctoTotalReceived ?? 0}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Current Package Cap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-bold text-[#0F2D59]">
          ₹{selectedUser.ctoCap ?? 0}
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Remaining CTO Limit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-bold text-orange-600">
          ₹{selectedUser.remainingCtoLimit ?? 0}
        </p>
      </CardContent>
    </Card>

  </div>
</TabsContent>

            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}