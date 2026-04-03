import React, { useState, useRef } from 'react';
import { FaImage, FaFilePdf, FaFile, FaTimes, FaSpinner } from 'react-icons/fa';
import { uploadImage, uploadDocument, getFileType } from '../services/uploadService';
import { toast } from 'react-toastify';

const FileUpload = ({
  onUploadComplete,
  accept = 'image/*,application/pdf',
  maxSize = 5, // MB
  type = 'image', // 'image' | 'document' | 'any'
  label = 'Upload File',
  currentFile = null,
  showPreview = true,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(currentFile);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file size
    const maxBytes = maxSize * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Validate file type
    const fileType = getFileType(file);
    if (type === 'image' && fileType !== 'image') {
      toast.error('Please upload an image file (JPEG, PNG, GIF)');
      return;
    }
    if (type === 'document' && fileType !== 'document') {
      toast.error('Please upload a document file (PDF, DOC)');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let result;
      if (fileType === 'image') {
        result = await uploadImage(file, setProgress);
      } else {
        result = await uploadDocument(file, setProgress);
      }

      if (result.success) {
        setPreview(result.data.url);
        onUploadComplete(result.data);
        toast.success('File uploaded successfully');
      } else {
        toast.error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const clearFile = () => {
    setPreview(null);
    onUploadComplete(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAcceptTypes = () => {
    if (type === 'image') return 'image/jpeg,image/png,image/gif,image/webp';
    if (type === 'document') return 'application/pdf,.doc,.docx';
    return accept;
  };

  const getIcon = () => {
    if (type === 'image') return <FaImage className="text-4xl text-primary-400" />;
    if (type === 'document') return <FaFilePdf className="text-4xl text-red-400" />;
    return <FaFile className="text-4xl text-gray-400" />;
  };

  const isImage = preview && (preview.match(/\.(jpeg|jpg|gif|png|webp)$/i) || preview.startsWith('data:image'));

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      
      {/* Preview Area */}
      {showPreview && preview && (
        <div className="relative mb-3">
          {isImage ? (
            <div className="relative inline-block">
              <img
                src={preview}
                alt="Preview"
                className="max-h-40 rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
          ) : (
            <div className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <FaFilePdf className="text-red-500 text-2xl mr-3" />
              <div className="flex-1 truncate">
                <p className="text-sm font-medium text-gray-700 truncate">{preview.split('/').pop()}</p>
                <a 
                  href={preview} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-primary-600 hover:underline"
                >
                  View file
                </a>
              </div>
              <button
                type="button"
                onClick={clearFile}
                className="ml-2 text-red-500 hover:text-red-600"
              >
                <FaTimes />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Area */}
      {!preview && (
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
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptTypes()}
            onChange={handleInputChange}
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
              <div className="mb-3">
                {getIcon()}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">
                  <span className="text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {type === 'image' && 'PNG, JPG, GIF up to '}
                  {type === 'document' && 'PDF, DOC up to '}
                  {type === 'any' && 'Images or documents up to '}
                  {maxSize}MB
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* URL Input Alternative */}
      {!preview && !uploading && (
        <div className="mt-3">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or enter URL</span>
            </div>
          </div>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="mt-3 input-field text-sm"
            onChange={(e) => {
              if (e.target.value) {
                setPreview(e.target.value);
                onUploadComplete({ url: e.target.value });
              }
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
