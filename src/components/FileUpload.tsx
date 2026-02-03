import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
  isLoading: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isLoading }) => {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setUploadStatus('idle');
    setErrorMessage('');
    
    try {
      await onUpload(file);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch (error: any) {
      setUploadStatus('error');
      setErrorMessage(error.response?.data?.error || error.message || 'Upload failed');
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    multiple: false,
    disabled: isLoading
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-50' : ''}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <>
              <Loader className="w-12 h-12 text-primary-500 animate-spin" />
              <p className="text-gray-600">Processing file...</p>
            </>
          ) : uploadStatus === 'success' ? (
            <>
              <CheckCircle className="w-12 h-12 text-green-500" />
              <p className="text-green-600 font-medium">File uploaded successfully!</p>
            </>
          ) : uploadStatus === 'error' ? (
            <>
              <AlertCircle className="w-12 h-12 text-red-500" />
              <p className="text-red-600 font-medium">Upload failed</p>
              <p className="text-red-500 text-sm">{errorMessage}</p>
            </>
          ) : (
            <>
              {isDragActive ? (
                <FileSpreadsheet className="w-12 h-12 text-primary-500" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
              
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {isDragActive ? 'Drop your Excel file here' : 'Upload Shares Ledger'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to select an Excel file (.xlsx, .xls, .csv)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
        <div className="flex items-center">
          <FileSpreadsheet className="w-4 h-4 mr-1" />
          <span>Supports .xlsx, .xls, .csv</span>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
