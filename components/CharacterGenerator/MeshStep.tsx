'use client';

import { useState } from 'react';
import { RefinedCharacter } from '@/types/app';

interface MeshStepProps {
  selectedImage: string;
  refinedCharacter: RefinedCharacter;
  onMeshGenerated: (meshUrl: string) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
  setError: (error: string | null) => void;
}

type TripoModel = 'fast' | 'quality' | 'ultra';

const MODEL_OPTIONS: { value: TripoModel; label: string; description: string }[] = [
  {
    value: 'fast',
    label: 'Fast (Default)',
    description: 'Quick generation, good quality - ~2-3 minutes',
  },
  {
    value: 'quality',
    label: 'Quality',
    description: 'Higher detail mesh - ~5-10 minutes',
  },
  {
    value: 'ultra',
    label: 'Ultra (High Quality)',
    description: 'Maximum detail and fidelity - ~15-30 minutes',
  },
];

export default function MeshStep({
  selectedImage,
  refinedCharacter,
  onMeshGenerated,
  onBack,
  isLoading,
  setIsLoading,
  setError,
}: MeshStepProps) {
  const [meshUrl, setMeshUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<TripoModel>('fast');

  const handleGenerateMesh = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tripoKey = process.env.NEXT_PUBLIC_TRIPO_AI_KEY || '';
      if (!tripoKey) {
        throw new Error('Tripo AI API key not configured. Add TRIPO_AI_KEY to .env.local');
      }

      const response = await fetch('/api/generate-mesh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          character: refinedCharacter,
          apiKey: tripoKey,
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate mesh');
      }

      const data = await response.json();
      // API now returns glbUrl directly
      setMeshUrl(data.glbUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate 3D mesh');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (meshUrl) {
      onMeshGenerated(meshUrl);
    }
  };

  if (!meshUrl) {
    return (
      <div>
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 5: Generate 3D Mesh</h2>
        <p className="mb-6 text-gray-600">
          Converting your selected image into a 3D model using Tripo AI.
        </p>

        <div className="mb-6 rounded-lg border border-gray-300 bg-gray-50 p-4">
          <p className="font-semibold text-gray-700">Selected Image</p>
          <div className="mt-4 h-64 w-full overflow-hidden rounded-lg border border-gray-300 bg-white">
            <img
              src={selectedImage}
              alt="Selected character image"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="mb-4 font-semibold text-blue-900">Select 3D Model Quality</p>
          <div className="space-y-3">
            {MODEL_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center rounded-lg border-2 border-transparent p-3 transition-colors hover:border-blue-200"
              >
                <input
                  type="radio"
                  name="model"
                  value={option.value}
                  checked={selectedModel === option.value}
                  onChange={(e) => setSelectedModel(e.target.value as TripoModel)}
                  className="h-4 w-4 text-blue-600"
                />
                <div className="ml-3 flex-1">
                  <p className="font-semibold text-blue-900">{option.label}</p>
                  <p className="text-sm text-blue-700">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">3D Generation Details</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <strong>Model Quality:</strong> {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label}
            </li>
            <li>
              <strong>Format:</strong> GLB (GLTF Binary) - Ready for 3D viewers
            </li>
            <li>
              <strong>Status:</strong> {isLoading ? 'Generating...' : 'Ready to generate'}
            </li>
          </ul>
        </div>

        <div className="mt-8 flex gap-4">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={handleGenerateMesh}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Generating 3D model... (this takes a few minutes)' : 'Generate 3D Model →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 5: Generated 3D Model</h2>
      <p className="mb-6 text-gray-600">Your 3D model has been generated successfully!</p>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
        <p className="font-semibold">✓ Model Generated</p>
        <p className="mt-1 text-sm">
          Your 3D mesh is ready. It will be included in the final export.
        </p>
        <p className="mt-2 text-xs text-green-600">
          <strong>Model URL:</strong> {meshUrl.substring(0, 60)}...
        </p>
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setMeshUrl(null);
            handleGenerateMesh();
          }}
          className="rounded-lg border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          Regenerate Model
        </button>
        <button
          onClick={handleProceed}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Next: Final Review →
        </button>
      </div>
    </div>
  );
}
