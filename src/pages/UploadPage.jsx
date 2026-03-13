import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { uploadDocument } from '../services/api';
import { UploadCloud, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const err = rejectedFiles[0].errors[0];
      if (err.code === 'file-too-large') toast.error('File too large. Maximum size is 20MB.');
      else if (err.code === 'file-invalid-type') toast.error('Only PDF files are allowed.');
      else toast.error('Invalid file.');
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('pdf', file);

    // Simulate progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + Math.random() * 15, 85));
    }, 400);

    try {
      const { data } = await uploadDocument(formData);
      clearInterval(interval);
      setUploadProgress(100);
      toast.success('Document uploaded and text extracted!');
      setTimeout(() => navigate(`/documents/${data._id}`), 600);
    } catch (err) {
      clearInterval(interval);
      toast.error(err.response?.data?.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-100">Upload PDF Document</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Upload a PDF to extract text and analyze it with AI
        </p>
      </div>

      {/* Dropzone */}
      <div
        {...getRootProps()}
        id="dropzone"
        className={`card p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 border-2 border-dashed ${
          isDragActive && !isDragReject
            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/20'
            : isDragReject
            ? 'border-red-500 bg-red-500/10'
            : file
            ? 'border-gray-700 hover:border-gray-600'
            : 'border-gray-700 hover:border-violet-600/60 hover:bg-violet-600/5'
        }`}
      >
        <input {...getInputProps()} />

        {!file ? (
          <>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${
              isDragActive ? 'bg-violet-600/30 scale-110' : 'bg-gray-800'
            }`}>
              <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-violet-400' : 'text-gray-500'}`} />
            </div>
            {isDragActive && !isDragReject ? (
              <p className="text-violet-400 font-semibold text-lg">Drop your PDF here!</p>
            ) : isDragReject ? (
              <p className="text-red-400 font-semibold">Only PDF files are accepted</p>
            ) : (
              <>
                <p className="text-gray-300 font-semibold mb-1">
                  Drag & drop your PDF here
                </p>
                <p className="text-gray-500 text-sm mb-4">or click to browse files</p>
                <span className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-full px-3 py-1">
                  PDF only · Max 20MB
                </span>
              </>
            )}
          </>
        ) : (
          /* File Preview */
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4">
              <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-gray-200 truncate text-sm">{file.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {uploading && uploadProgress === 100 && (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              )}
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>
                    {uploadProgress < 100 ? 'Uploading & extracting text...' : 'Complete!'}
                  </span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      uploadProgress === 100
                        ? 'bg-emerald-500'
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600'
                    }`}
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 card p-4">
        <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-violet-400" /> Tips for best results
        </h3>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• Use text-based PDFs rather than scanned images for accurate extraction</li>
          <li>• Smaller documents (under 50 pages) produce faster, more accurate AI summaries</li>
          <li>• Documents in English work best with the AI model</li>
        </ul>
      </div>

      {/* Upload Button */}
      <button
        id="upload-btn"
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
      >
        {uploading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <UploadCloud className="w-4 h-4" />
            Upload & Analyze
          </>
        )}
      </button>
    </div>
  );
};

export default UploadPage;
