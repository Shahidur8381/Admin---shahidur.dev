"use client";

import { useState, useRef, useCallback } from "react";

export interface UseDragReorderOptions<T> {
  items: T[];
  onReorder: (newItems: T[]) => void | Promise<void | boolean>;
  disabled?: boolean;
}

export function useDragReorder<T>({
  items,
  onReorder,
  disabled = false,
}: UseDragReorderOptions<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (disabled) return;

      // Prevent drag if initiating from inside buttons, inputs, switches, etc.
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, input, a, [role="switch"], [role="button"], textarea, select'
        )
      ) {
        // If it's not the drag-handle itself
        if (!target.closest("[data-drag-handle]")) {
          e.preventDefault();
          return;
        }
      }

      draggedIndexRef.current = index;
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(index));
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (disabled || draggedIndexRef.current === null) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragOverIndex !== index) {
        setDragOverIndex(index);
      }
    },
    [disabled, dragOverIndex]
  );

  const handleDragEnter = useCallback(
    (index: number) => (e: React.DragEvent) => {
      if (disabled || draggedIndexRef.current === null) return;
      e.preventDefault();
      setDragOverIndex(index);
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (index: number) => (e: React.DragEvent) => {
      const current = e.currentTarget as HTMLElement | null;
      const related = e.relatedTarget as HTMLElement | null;
      if (!current?.contains(related)) {
        if (dragOverIndex === index) {
          setDragOverIndex(null);
        }
      }
    },
    [dragOverIndex]
  );

  const handleDrop = useCallback(
    (dropIndex: number) => async (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      const startIndex = draggedIndexRef.current;
      setDraggedIndex(null);
      setDragOverIndex(null);
      draggedIndexRef.current = null;

      if (startIndex === null || startIndex === dropIndex) return;

      const newItems = [...items];
      const [movedItem] = newItems.splice(startIndex, 1);
      newItems.splice(dropIndex, 0, movedItem);

      await onReorder(newItems);
    },
    [disabled, items, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
  }, []);

  const getItemProps = useCallback(
    (index: number, isTableRow = false) => {
      const isDragging = draggedIndex === index;
      const isOver = dragOverIndex === index && draggedIndex !== index;

      const visualClasses = isTableRow
        ? isDragging
          ? "opacity-30 bg-zinc-800/80 transition-opacity"
          : isOver
          ? "border-t-2 border-indigo-500 bg-indigo-500/15 transition-colors"
          : "transition-colors"
        : isDragging
        ? "opacity-35 scale-[0.98] ring-2 ring-indigo-500/40 border-dashed border-indigo-500/60 transition-all duration-150"
        : isOver
        ? "ring-2 ring-indigo-500 bg-indigo-500/10 shadow-xl shadow-indigo-500/20 scale-[1.01] transition-all duration-150"
        : "transition-all duration-150";

      return {
        draggable: !disabled,
        onDragStart: handleDragStart(index),
        onDragOver: handleDragOver(index),
        onDragEnter: handleDragEnter(index),
        onDragLeave: handleDragLeave(index),
        onDrop: handleDrop(index),
        onDragEnd: handleDragEnd,
        className: visualClasses,
        "data-dragging": isDragging ? "true" : undefined,
        "data-over": isOver ? "true" : undefined,
      };
    },
    [
      disabled,
      draggedIndex,
      dragOverIndex,
      handleDragStart,
      handleDragOver,
      handleDragEnter,
      handleDragLeave,
      handleDrop,
      handleDragEnd,
    ]
  );

  const getHandleProps = useCallback(
    (index: number) => ({
      draggable: !disabled,
      "data-drag-handle": true,
      onDragStart: handleDragStart(index),
      className:
        "cursor-grab active:cursor-grabbing text-zinc-500 hover:text-indigo-400 p-1 rounded-md hover:bg-zinc-800 transition-colors shrink-0 select-none",
      title: "Drag to reorder",
    }),
    [disabled, handleDragStart]
  );

  return {
    draggedIndex,
    dragOverIndex,
    isDragging: draggedIndex !== null,
    getItemProps,
    getHandleProps,
  };
}
