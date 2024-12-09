import React, { useState } from 'react';
import { Upload, Image, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PhotoUploadApp = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setError('');
    setApiResponse(null);
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setPreview(previewUrl);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('https://api.example.com/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      setApiResponse(data);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('API Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setPreview('');
    setApiResponse(null);
    setError('');
    if (preview) {
      URL.revokeObjectURL(preview);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Photo Analysis App</h1>
        <p className="text-gray-600">Upload a photo to analyze it using our AI service</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <Upload className="w-12 h-12 text-gray-400" />
          <span className="text-gray-600">
            {preview ? 'Click to change photo' : 'Click to upload photo'}
          </span>
        </label>
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 mx-auto rounded-lg shadow-lg"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={!selectedFile || isLoading}
          className={`px-6 py-2 rounded-lg ${
            !selectedFile || isLoading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Processing...' : 'Analyze Photo'}
        </button>
      </div>

      {apiResponse && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Analysis Results</h2>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadApp;