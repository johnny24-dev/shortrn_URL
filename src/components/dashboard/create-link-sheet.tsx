"use client";

import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { DashboardLink } from "@/types/dashboard";

type CreateLinkSheetProps = {
  mode: "create" | "edit";
  triggerLabel: string;
  link?: DashboardLink | null;
  initialOpen?: boolean;
  initialUrl?: string;
};

export function CreateLinkSheet({
  mode,
  triggerLabel,
  link,
  initialOpen = false,
  initialUrl = "",
}: CreateLinkSheetProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaults = useMemo(
    () => ({
      originalUrl: link?.originalUrl ?? "",
      customSlug: link?.slug ?? "",
      title: link?.title ?? "",
      description: link?.description ?? "",
      expiresAt: link?.expiresAt ? link.expiresAt.slice(0, 16) : "",
    }),
    [link],
  );

  useEffect(() => {
    if (initialOpen) {
      setOpen(true);
    }
  }, [initialOpen]);

  useEffect(() => {
    if (!open) {
      setError(null);
    }
  }, [open]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const originalUrl = String(formData.get("originalUrl") ?? "");
    const customSlug = String(formData.get("customSlug") ?? "");
    const title = String(formData.get("title") ?? "");
    const description = String(formData.get("description") ?? "");
    const expiresAt = String(formData.get("expiresAt") ?? "");

    const method = mode === "edit" && link ? "PATCH" : "POST";
    const endpoint = mode === "edit" && link ? `/api/links/${link.id}` : "/api/links";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          customSlug: customSlug || null,
          title: title || null,
          description: description || null,
          expiresAt: expiresAt || null,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(payload?.error ?? "Unable to save link.");
        return;
      }

      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Dialog
        open={open}
        title={mode === "edit" ? "Edit link" : "Create link"}
        description={
          mode === "edit"
            ? "Update the destination, slug, or expiration."
            : "Create a new short link for the current workspace."
        }
        onClose={() => setOpen(false)}
      >
        <form ref={formRef} className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Destination URL
              <Input
                name="originalUrl"
                type="url"
                placeholder="https://example.com/long-url"
                defaultValue={defaults.originalUrl || initialUrl}
                required
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Custom slug
              <Input
                name="customSlug"
                placeholder="summer-sale"
                defaultValue={defaults.customSlug}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Expiration
              <Input
                name="expiresAt"
                type="datetime-local"
                defaultValue={defaults.expiresAt}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Title
              <Input
                name="title"
                placeholder="Campaign name"
                defaultValue={defaults.title}
              />
            </label>
            <label className="grid gap-2 text-sm font-medium text-slate-700 sm:col-span-2">
              Description
              <Input
                name="description"
                placeholder="Optional internal note"
                defaultValue={defaults.description}
              />
            </label>
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              className="bg-slate-100 text-slate-900 hover:bg-slate-200"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "edit" ? "Save" : "Create"}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
