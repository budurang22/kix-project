import { useEffect, useId, useRef } from 'react';
import Button from './Button.jsx';
export default function Modal({ isOpen, title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
      previous?.focus();
    };
  }, [isOpen]);
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-lg overflow-y-auto border border-primary/15 bg-background p-6 backdrop:bg-primary/50"
    >
      <h2 id={titleId} className="mb-4 text-xl font-bold">
        {title}
      </h2>
      {children}
      <Button variant="secondary" className="mt-6 ml-3" onClick={onClose}>
        닫기
      </Button>
    </dialog>
  );
}
