import api from './api';

// Upload single image
export const uploadImage = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Upload single document (PDF, DOC, etc.)
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('/upload/document', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Upload multiple images
export const uploadMultipleImages = async (files, onProgress) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/upload/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Delete uploaded file
export const deleteUploadedFile = async (publicId) => {
  const response = await api.delete(`/upload/${encodeURIComponent(publicId)}`);
  return response.data;
};

// Helper to get file type
export const getFileType = (file) => {
  const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const documentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (imageTypes.includes(file.type)) return 'image';
  if (documentTypes.includes(file.type)) return 'document';
  return 'unknown';
};

// Helper to format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
