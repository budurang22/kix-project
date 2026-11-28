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
      className="w-[calc(100%-2rem)] max-w-lg p-6 backdrop:bg-primary/50"
    >
      <h2 id={titleId} className="mb-4 text-xl font-bold">
        {title}
      </h2>
      {children}
      <Button className="mt-6" onClick={onClose}>
        닫기
      </Button>
    </dialog>
  );
}
