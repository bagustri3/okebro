"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface PopconfirmProps {
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
}

export default function Popconfirm({
  title = "Are you sure?",
  description,
  onConfirm,
  onCancel,
  children,
}: PopconfirmProps) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    setPos({
      top: rect.top - 12,
      left: rect.left + rect.width / 2,
    });
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        onCancel?.();
      }
    };

    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onCancel]);

  return (
    <>
      <div
        ref={triggerRef}
        className="w-full inline-flex"
        onClick={() => setOpen(true)}
      >
        {children}
      </div>

      {open &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
            className="z-[9999] w-64 rounded-lg border bg-white p-4 shadow-xl"
          >
            <p className="font-semibold text-gray-900">{title}</p>

            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => {
                  setOpen(false);
                  onCancel?.();
                }}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onConfirm();
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
