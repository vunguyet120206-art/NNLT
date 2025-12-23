'use client';

import { useState } from 'react';

interface SignalUploadProps {
  onUpload: (file: File) => void;
  loading: boolean;
}

export default function SignalUpload({ onUpload, loading }: SignalUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.txt')) {
        setError('Only .txt files are allowed');
        setFile(null);
      } else {
        setError('');
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      onUpload(file);
      setFile(null);
      // Reset input
      const input = document.getElementById('file-input') as HTMLInputElement;
      if (input) input.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="file-input">Select .txt file</label>
        <input
          id="file-input"
          type="file"
          accept=".txt"
          onChange={handleFileChange}
          disabled={loading}
          className="w-full p-3 border border-gray-300 rounded text-base focus:outline-none focus:border-primary"
        />
        {file && (
          <p className="mt-2 text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {error && <div className="error">{error}</div>}
      </div>
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!file || loading}
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
