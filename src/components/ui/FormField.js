import React from 'react';

export const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  error,
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Icon />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`input-field ${Icon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''}`}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const TextArea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  required = false,
  disabled = false,
  rows = 3,
  error,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`input-field resize-none ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const SelectField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false,
  disabled = false,
  error,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export const CheckboxField = ({ 
  label, 
  name, 
  checked, 
  onChange,
  disabled = false,
  className = ''
}) => {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
};

export const DateTimeField = ({ 
  label, 
  name, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  min,
  error,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="datetime-local"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        min={min}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
