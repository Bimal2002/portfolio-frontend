import React, { useState, useRef } from 'react';
import { FaImage, FaTimes, FaSpinner, FaPlus } from 'react-icons/fa';
import { uploadImage } from '../services/uploadService';
import { toast } from 'react-toastify';

const MultiFileUpload = ({
  onFilesChange,
  maxFiles = 10,
  maxSize = 5, // MB per file
  currentFiles = [],
  label = 'Upload Images',
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState(currentFiles);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const remainingSlots = maxFiles - files.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const filesToUpload = Array.from(selectedFiles).slice(0, remainingSlots);
    const maxBytes = maxSize * 1024 * 1024;

    // Validate all files
    for (const file of filesToUpload) {
      if (file.size > maxBytes) {
        toast.error(`${file.name} is too large. Max size is ${maxSize}MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
    }

    setUploading(true);
    const uploadedFiles = [...files];

    try {
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setProgress(Math.round(((i + 0.5) / filesToUpload.length) * 100));
        
        const result = await uploadImage(file);
        
        if (result.success) {
          uploadedFiles.push({
            url: result.data.url,
            caption: ''
          });
        }
        
        setProgress(Math.round(((i + 1) / filesToUpload.length) * 100));
      }

      setFiles(uploadedFiles);
      onFilesChange(uploadedFiles);
      toast.success(`${filesToUpload.length} file(s) uploaded`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const updateCaption = (index, caption) => {
    const newFiles = [...files];
    newFiles[index] = { ...newFiles[index], caption };
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} ({files.length}/{maxFiles})
      </label>

      {/* Current Files Grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
          {files.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={file.url}
                alt={file.caption || `Image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes className="text-xs" />
              </button>
              <input
                type="text"
                placeholder="Caption (optional)"
                value={file.caption || ''}
                onChange={(e) => updateCaption(index, e.target.value)}
                className="mt-2 w-full text-xs px-2 py-1 border border-gray-200 rounded focus:outline-none focus:border-primary-400"
              />
            </div>
          ))}

          {/* Add More Button */}
          {files.length < maxFiles && !uploading && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 transition-colors"
            >
              <div className="text-center">
                <FaPlus className="text-2xl text-gray-400 mx-auto mb-1" />
                <span className="text-xs text-gray-500">Add More</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Area (shown when no files or uploading) */}
      {(files.length === 0 || uploading) && (
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-all duration-200
            ${dragOver ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'}
            ${uploading ? 'pointer-events-none opacity-70' : ''}
            ${files.length > 0 ? 'hidden' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleInputChange}
            multiple
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-3">
              <FaSpinner className="text-4xl text-primary-500 mx-auto animate-spin" />
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Uploading... {progress}%</p>
            </div>
          ) : (
            <>
              <FaImage className="text-4xl text-primary-400 mx-auto mb-3" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to {maxSize}MB each (max {maxFiles} files)
                </p>
              </div>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleInputChange}
        multiple
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default MultiFileUpload;
