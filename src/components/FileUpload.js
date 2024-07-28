import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

const FileUpload = ({ onFileUpload, pluginType }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': pluginType === 'ShopGUI+' ? ['.log'] : ['.txt'],
    },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors duration-200">
      <div className="space-y-1 text-center">
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <div className="flex text-sm text-gray-600">
          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
            <span>Upload a file</span>
            <input {...getInputProps()} id="file-upload" name="file-upload" className="sr-only" />
          </label>
          <p className="pl-1">or drag and drop</p>
        </div>
        <p className="text-xs text-gray-500">
          {pluginType === 'ShopGUI+' ? 'ShopGUI+ (.log) files only' : 'EconomyShopGUI (.txt) files only'}
        </p>
      </div>
    </div>
  );
};

export default FileUpload;