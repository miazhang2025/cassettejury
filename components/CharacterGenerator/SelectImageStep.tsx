'use client';

import { useState } from 'react';

interface SelectImageStepProps {
  images: string[];
  onSelected: (index: number) => void;
  onBack: () => void;
}

export default function SelectImageStep({ images, onSelected, onBack }: SelectImageStepProps) {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
  };

  const handleProceed = () => {
    onSelected(selectedIndex);
  };

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 4: Select Image</h2>
      <p className="mb-6 text-gray-600">Click on the image you'd like to use for 3D model generation.</p>

      <div className="mb-8 grid grid-cols-2 gap-6">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => handleSelect(idx)}
            className={`group relative cursor-pointer rounded-lg border-4 transition-all ${
              selectedIndex === idx ? 'border-blue-600 shadow-lg' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={image}
                alt={`Character Image ${idx + 1}`}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white transition-opacity ${
                selectedIndex === idx ? 'opacity-100' : 'opacity-0 group-hover:opacity-70'
              }`}
            >
              <p className="font-semibold">
                {selectedIndex === idx ? '✓ Selected' : 'Click to select'}
              </p>
              <p className="text-sm">Variation {idx + 1}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
        <p className="font-semibold">Next step:</p>
        <p className="mt-1">
          Your selected image will be sent to Tripo AI to generate a 3D model with 5000 polycount and texture.
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
          onClick={handleProceed}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Next: Generate 3D Mesh →
        </button>
      </div>
    </div>
  );
}
