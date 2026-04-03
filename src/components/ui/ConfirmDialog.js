import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action', 
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, info, success
  disabled = false
}) => {
  if (!isOpen) return null;

  const typeStyles = {
    danger: 'bg-red-600 hover:bg-red-700 disabled:bg-red-400',
    warning: 'bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400',
    info: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    success: 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
  };

  const iconStyles = {
    danger: 'text-red-600 bg-red-100',
    warning: 'text-yellow-600 bg-yellow-100',
    info: 'text-blue-600 bg-blue-100',
    success: 'text-green-600 bg-green-100'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${iconStyles[type]}`}>
            <FaExclamationTriangle className="text-xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button onClick={onClose} className="btn-secondary" disabled={disabled}>
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            disabled={disabled}
            className={`${typeStyles[type]} text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
