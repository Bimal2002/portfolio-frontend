import React from 'react';
import { FaPlus } from 'react-icons/fa';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="card text-center py-12">
      {Icon && <Icon className="text-6xl text-gray-300 mx-auto mb-4" />}
      <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-500 mb-4">{description}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary inline-flex items-center">
          <FaPlus className="mr-2" /> {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
