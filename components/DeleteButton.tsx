"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { useState, useRef } from "react";
import { AdminConfirmModal } from "@/components/AdminConfirmModal";

interface DeleteButtonProps {
  confirmMessage: string;
  disabled?: boolean;
}

export function DeleteButton({
  confirmMessage,
  disabled,
}: DeleteButtonProps) {
  const { pending } = useFormStatus();
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (form) {
      formRef.current = form;
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={handleClick}
        disabled={pending || disabled}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
      <AdminConfirmModal
        open={showModal}
        onOpenChange={setShowModal}
        title="Confirm Deletion"
        description={confirmMessage}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        variant="destructive"
      />
    </>
  );
}

