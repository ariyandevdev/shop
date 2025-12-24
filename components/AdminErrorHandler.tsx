"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AdminMessageModal } from "@/components/AdminMessageModal";

function AdminErrorHandlerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    if (errorParam) {
      setError(decodeURIComponent(errorParam));
      // Remove error from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("error");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }

    if (successParam) {
      setSuccess(decodeURIComponent(successParam));
      // Remove success from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("success");
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : "");
      router.replace(newUrl, { scroll: false });
    }
  }, [searchParams, router]);

  return (
    <>
      {error && (
        <AdminMessageModal
          open={!!error}
          onOpenChange={(open) => {
            if (!open) setError(null);
          }}
          title="Error"
          message={error}
          type="error"
        />
      )}
      {success && (
        <AdminMessageModal
          open={!!success}
          onOpenChange={(open) => {
            if (!open) setSuccess(null);
          }}
          title="Success"
          message={success}
          type="success"
        />
      )}
    </>
  );
}

export function AdminErrorHandler() {
  return (
    <Suspense fallback={null}>
      <AdminErrorHandlerContent />
    </Suspense>
  );
}

