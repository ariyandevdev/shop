"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Edit, Package } from "lucide-react";
import { useState } from "react";

type BulkActionsToolbarProps = {
  selectedIds: string[];
  onBulkDelete?: (ids: string[]) => void;
  onBulkUpdate?: (ids: string[]) => void;
  entityType?: "products" | "orders";
  className?: string;
};

export function BulkActionsToolbar({
  selectedIds,
  onBulkDelete,
  onBulkUpdate,
  entityType = "products",
  className,
}: BulkActionsToolbarProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedIds.length === 0) {
    return null;
  }

  const handleBulkDelete = async () => {
    if (!onBulkDelete) return;
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} ${entityType}? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    try {
      await onBulkDelete(selectedIds);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 p-3 bg-muted rounded-lg border ${className}`}
    >
      <span className="text-sm font-medium">
        {selectedIds.length} {entityType} selected
      </span>
      <div className="flex gap-2 ml-auto">
        {onBulkUpdate && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onBulkUpdate(selectedIds)}
            disabled={isProcessing}
          >
            <Edit className="w-4 h-4 mr-2" />
            Bulk Update
          </Button>
        )}
        {onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={isProcessing}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isProcessing ? "Deleting..." : "Delete Selected"}
          </Button>
        )}
      </div>
    </div>
  );
}

