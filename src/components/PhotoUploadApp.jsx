import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

const PhotoUploadApp = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  // Convert the uploaded image to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

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
      // First, let's convert our image to base64 format
      const base64Image = await getBase64(selectedFile);
      
      // Now we'll make the API request with the correct header structure
      // In your handleSubmit function, change the fetch call to:
      const response = await fetch('http://localhost:3001/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: [
              {
                type: "text",
                text: "You are a witty and observant AI assistant who loves making clever jokes share a creative, please reply with a short witty joke or roast related to the image."
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: selectedFile.type,
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('API Error:', {
          status: response.status,
          statusText: response.statusText,
          details: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setApiResponse(data.content[0].text);
    } catch (err) {
      console.error('Request failed:', err);
      setError('Failed to process image. ' + err.message);
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">PicturePunch</h1>
          <p className="text-lg text-gray-600">
            Upload an image to analyze it using AI's advanced roasting capabilities
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-md p-8 mb-8">
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 
            ${preview ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="photo-upload"
            />
            <label
              htmlFor="photo-upload"
              className="cursor-pointer flex flex-col items-center space-y-4"
            >
              <Upload className={`w-16 h-16 ${preview ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-lg text-gray-600">
                {preview ? 'Click to change image' : 'Click to upload image'}
              </span>
              <span className="text-sm text-gray-500">
                Maximum file size: 5MB
              </span>
            </label>
          </div>

          {/* Preview Section */}
          {preview && (
            <div className="mt-8 relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-96 object-contain bg-black"
              />
              <button
                onClick={handleClear}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md"
                aria-label="Clear image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isLoading}
            className={`px-8 py-3 rounded-lg text-lg font-medium transition-all duration-300
              ${!selectedFile || isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </span>
            ) : (
              'Write a joke!'
            )}
          </button>
        </div>

        {/* Analysis Results */}
        {apiResponse && (
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4"></h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              {apiResponse.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index} className="mb-4">{paragraph}</p> : null
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadApp;