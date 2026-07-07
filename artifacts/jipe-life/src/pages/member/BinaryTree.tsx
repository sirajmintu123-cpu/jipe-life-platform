import MemberLayout from "@/components/MemberLayout";
import { useGetBinaryTree, getGetBinaryTreeQueryKey } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const PACKAGE_COLORS = {
  starter: "bg-green-100 text-green-800 border-green-200",
  smart: "bg-blue-100 text-blue-800 border-blue-200",
  silver: "bg-gray-100 text-gray-700 border-gray-200",
  gold: "bg-amber-100 text-amber-800 border-amber-200",
};
function TreeNode({ node, depth = 0 }: { node: any; depth?: number }) {
  if (!node) {
    return (
      <div className="flex flex-col items-center">
        <div className="w-28 h-20 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center bg-gray-50">
          <span className="text-xs text-muted-foreground">Empty slot</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center" data-testid={`tree-node-${node.id}`}>
      <div className="bg-white border border-border rounded-xl p-3 shadow-sm w-36 text-center">
        <p className="text-[10px] text-muted-foreground font-mono">{node.memberId}</p>
        <p className="text-xs font-bold text-[#0F2D59] mt-0.5 truncate">{node.name}</p>
        <div className="flex justify-center mt-1">
          <Badge className={`text-[10px] px-1.5 py-0 border ${PACKAGE_COLORS[node.package] ?? ""}`}>
            {node.package?.toUpperCase()} · {node.bv}BV
          </Badge>
        </div>
        {node.position !== "root" && (
          <span className={`text-[9px] mt-1 block font-medium ${node.position === "left" ? "text-blue-500" : "text-emerald-500"}`}>
            {node.position?.toUpperCase()} LEG
          </span>
        )}
      </div>

      {(node.left !== undefined || node.right !== undefined) && (
        <div className="relative flex gap-8 mt-6">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-border" />
          <div className="absolute top-4 left-[18px] right-[18px] h-px bg-border" />

          <div className="flex flex-col items-center">
            <div className="w-px h-4 bg-border" />
            <TreeNode node={node.left} depth={depth + 1} />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-px h-4 bg-border" />
            <TreeNode node={node.right} depth={depth + 1} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function BinaryTree() {
  const [depth, setDepth] = useState(3);
  const { data, isLoading } = useGetBinaryTree(
    { depth },
    { query: { queryKey: getGetBinaryTreeQueryKey({ depth }) } }
  );

  return (
    <MemberLayout>
      <div className="max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-[#0F2D59]">Team Binary Tree</h1>
            <p className="text-sm text-muted-foreground">Your network structure</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Depth:</span>
            {[2,3,4,5,6].map(d => (
              <Button
                key={d}
                variant={depth === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDepth(d)}
                className={depth === d ? "bg-[#0F2D59]" : ""}
                data-testid={`depth-btn-${d}`}
              >
                {d}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-8 overflow-auto">
          {isLoading ? (
            <div className="flex justify-center"><Skeleton className="w-36 h-20 rounded-xl" /></div>
          ) : data ? (
            <div className="flex justify-center min-w-max">
              <TreeNode node={data} />
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No tree data available</p>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-green-100 border border-green-200" /><span>Starter Package</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-100 border border-blue-200" /><span>Smart Package</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /><span>Silver Package</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /><span>Gold Package</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded border-2 border-dashed border-gray-300" /><span>Empty Slot</span></div>
        </div>
      </div>
    </MemberLayout>
  );
}
