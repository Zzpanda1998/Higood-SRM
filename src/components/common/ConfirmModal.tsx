import DetailModal from "./DetailModal";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmText = "确认",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmText?: string;
}) {
  return (
    <DetailModal open={open} onClose={onClose} title={title}>
      <p className="mb-4 text-sm text-gray-600">{content}</p>
      <div className="flex justify-end gap-2">
        <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={onClose}>
          取消
        </button>
        <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </DetailModal>
  );
}
