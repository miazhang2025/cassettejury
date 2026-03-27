'use client';

import { useState } from 'react';
import { RefinedCharacter } from '@/types/app';
import { formatCharacterAsTypeScript } from '@/utils/characterGenerator';

interface ReviewStepProps {
  character: RefinedCharacter;
  selectedImage: string;
  meshUrl: string;
  onReset: () => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
  setError: (error: string | null) => void;
}

export default function ReviewStep({
  character,
  selectedImage,
  meshUrl,
  onReset,
  onBack,
  isLoading,
  setIsLoading,
  setError,
}: ReviewStepProps) {
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [exportMessage, setExportMessage] = useState<string>('');

  const characterCode = formatCharacterAsTypeScript(character);

  const handleExportToJuries = async () => {
    setIsLoading(true);
    setExportStatus('exporting');
    setError(null);

    try {
      const response = await fetch('/api/export-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character,
          imageUrl: selectedImage,
          meshUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to export character');
      }

      const data = await response.json();
      setExportStatus('success');
      setExportMessage(data.message);
    } catch (err) {
      setExportStatus('error');
      setExportMessage(err instanceof Error ? err.message : 'Failed to export character');
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(characterCode);
    setExportMessage('Character code copied to clipboard!');
    setTimeout(() => setExportMessage(''), 3000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(character, null, 2);
    const element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonStr));
    element.setAttribute('download', `${character.id}-character.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 6: Final Review & Export</h2>
      <p className="mb-6 text-gray-600">Review all generated content and export to juries.ts</p>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Character Summary */}
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
          <h3 className="mb-4 text-lg font-bold text-gray-900">Character Summary</h3>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-gray-700">ID</p>
              <p className="text-gray-600">{character.id}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Name</p>
              <p className="text-gray-600">{character.name}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Pronouns</p>
              <p className="text-gray-600">{character.pronouns}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Age</p>
              <p className="text-gray-600">{character.age}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Location</p>
              <p className="text-gray-600">{character.location}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Profession</p>
              <p className="text-gray-600">{character.profession}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Bio</p>
              <p className="text-gray-600">{character.bio}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Silhouette</p>
              <p className="text-gray-600">{character.silhouette}</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Color</p>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className="h-6 w-6 rounded border border-gray-300"
                  style={{ backgroundColor: character.color }}
                />
                <p className="text-gray-600">{character.color}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Assets */}
        <div className="space-y-4">
          {/* Character Image */}
          <div className="rounded-lg border border-gray-300 bg-white p-4">
            <h4 className="mb-3 font-semibold text-gray-700">Generated Image</h4>
            <div className="aspect-square overflow-hidden rounded-lg border border-gray-300 bg-gray-100">
              <img
                src={selectedImage}
                alt={character.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TypeScript Code Preview */}
      <div className="mt-8 rounded-lg border border-gray-300 bg-gray-50 p-6">
        <h3 className="mb-4 text-lg font-bold text-gray-900">TypeScript Code</h3>
        <pre className="overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-green-400">
          <code>{characterCode}</code>
        </pre>
      </div>

      {/* Export Status */}
      {exportStatus === 'success' && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          <p className="font-semibold">✓ Export Successful!</p>
          <p className="mt-1 text-sm">{exportMessage}</p>
          <p className="mt-2 text-xs text-green-600">
            Your character has been added to juries.ts and will appear in the jury selector.
          </p>
        </div>
      )}

      {exportStatus === 'error' && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          <p className="font-semibold">✗ Export Failed</p>
          <p className="mt-1 text-sm">{exportMessage}</p>
        </div>
      )}

      {exportMessage && exportStatus === 'idle' && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          <p className="text-sm">{exportMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          onClick={handleCopyToClipboard}
          className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          title="Copy the TypeScript code to clipboard"
        >
          Copy Code
        </button>

        <button
          onClick={handleDownloadJSON}
          className="rounded-lg border border-blue-600 px-4 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
          title="Download character data as JSON"
        >
          Download JSON
        </button>

        <button
          onClick={handleExportToJuries}
          disabled={isLoading || exportStatus === 'success'}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Exporting...' : 'Add to juries.ts'}
        </button>
      </div>

      {/* Reset Option */}
      {exportStatus === 'success' && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={onReset}
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            Create Another Character →
          </button>
        </div>
      )}
    </div>
  );
}
