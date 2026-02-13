import React from 'react';
import Modal from './Modal';

type Props = {
  isOpen: boolean;
  title?: string;
  message?: string;
  tempPassword?: string;
  onClose: () => void;
};

export default function SuccessPopup({ isOpen, title = 'Success', message, tempPassword, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-3">
        {message && <p className="text-gray-700">{message}</p>}
        {tempPassword && (
          <div className="p-3 bg-[#F1F8FF] border border-[#E6F4FB] rounded">
            <div className="text-xs text-gray-500 mb-1">Temporary password</div>
            <div className="font-mono font-medium text-sm text-[#2B2D42] break-all">{tempPassword}</div>
          </div>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-[#0077B6] text-white rounded">Close</button>
        </div>
      </div>
    </Modal>
  );
}
