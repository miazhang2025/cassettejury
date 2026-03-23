'use client';

import { useState } from 'react';
import { RefinedCharacter } from '@/types/app';

interface ImagesStepProps {
  refinedCharacter: RefinedCharacter;
  onImagesGenerated: (images: string[]) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
  setError: (error: string | null) => void;
}

export default function ImagesStep({
  refinedCharacter,
  onImagesGenerated,
  onBack,
  isLoading,
  setIsLoading,
  setError,
}: ImagesStepProps) {
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  const handleGenerateImages = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const geminiKey = process.env.NEXT_PUBLIC_GOOGLE_NANO_BANANA_KEY || '';
      if (!geminiKey) {
        throw new Error('Google Gemini Nano API key not configured. Add GOOGLE_NANO_BANANA_KEY to .env.local');
      }

      const response = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          character: refinedCharacter,
          apiKey: geminiKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate images');
      }

      const data = await response.json();
      setGeneratedImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceed = () => {
    if (generatedImages.length > 0) {
      onImagesGenerated(generatedImages);
    }
  };

  if (generatedImages.length === 0) {
    return (
      <div>
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 3: Generate Images</h2>
        <p className="mb-6 text-gray-600">
          Generating 4 claymation-style images of your character using Google Gemini Nano. This may take 30-60 seconds.
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">Image Generation Details</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <strong>Character:</strong> {refinedCharacter.name}
            </li>
            <li>
              <strong>Style:</strong> 3D Claymation
            </li>
            <li>
              <strong>Appearance:</strong> {refinedCharacter.silhouette}
            </li>
            <li>
              <strong>Count:</strong> 4 images (1:1 square, 1024x1024px)
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
            onClick={handleGenerateImages}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Generating images... (this takes a moment)' : 'Generate 4 Images →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 3: Generated Images</h2>
      <p className="mb-6 text-gray-600">4 variations of your character have been generated. Choose the one you like best.</p>

      <div className="mb-8 grid grid-cols-2 gap-6">
        {generatedImages.map((image, idx) => (
          <div key={idx} className="space-y-2">
            <div className="relative aspect-square overflow-hidden rounded-lg border-2 border-gray-300 bg-gray-100">
              <img
                src={image}
                alt={`Character Image ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="text-center text-sm text-gray-600">Variation {idx + 1}</p>
          </div>
        ))}
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
            setGeneratedImages([]);
            handleGenerateImages();
          }}
          className="rounded-lg border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          Regenerate Images
        </button>
        <button
          onClick={handleProceed}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Next: Select Image →
        </button>
      </div>
    </div>
  );
}
