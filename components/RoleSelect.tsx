"use client";

import { useState, useRef } from "react";
import { AdminConfirmModal } from "@/components/AdminConfirmModal";

interface RoleSelectProps {
  userId: string;
  currentRole: string;
}

export function RoleSelect({ userId, currentRole }: RoleSelectProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<string | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    selectRef.current = e.target;
    const form = e.target.closest("form");
    if (form) {
      formRef.current = form;
    }
    setPendingRole(newRole);
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    if (selectRef.current) {
      selectRef.current.value = currentRole;
    }
    setPendingRole(null);
  };

  return (
    <>
      <select
        ref={selectRef}
        name="role"
        defaultValue={currentRole}
        onChange={handleChange}
        className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm"
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <AdminConfirmModal
        open={showModal}
        onOpenChange={(open) => {
          if (!open) {
            handleCancel();
          }
        }}
        title="Change User Role"
        description={`Are you sure you want to change this user's role to ${pendingRole}?`}
        confirmText="Confirm"
        cancelText="Cancel"
        onConfirm={handleConfirm}
      />
    </>
  );
}

