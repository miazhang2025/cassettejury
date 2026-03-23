'use client';

import { useState } from 'react';
import { CharacterDraft, RefinedCharacter } from '@/types/app';

interface RefineStepProps {
  draftCharacter: CharacterDraft;
  onRefined: (character: RefinedCharacter) => void;
  onBack: () => void;
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
  setError: (error: string | null) => void;
}

export default function RefineStep({
  draftCharacter,
  onRefined,
  onBack,
  isLoading,
  setIsLoading,
  setError,
}: RefineStepProps) {
  const [refinedData, setRefinedData] = useState<RefinedCharacter | null>(null);
  const [editedData, setEditedData] = useState<RefinedCharacter | null>(null);

  const handleRefine = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const claudeKey = process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '';
      if (!claudeKey) {
        throw new Error('Claude API key not configured. Add CLAUDE_API_KEY to .env.local');
      }

      const response = await fetch('/api/refine-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft: draftCharacter,
          apiKey: claudeKey,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to refine character');
      }

      const result = await response.json();
      setRefinedData(result);
      setEditedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine character');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditField = (field: keyof RefinedCharacter, value: string | number) => {
    if (editedData) {
      setEditedData({
        ...editedData,
        [field]: value,
      });
    }
  };

  const handleProceed = () => {
    if (editedData) {
      onRefined(editedData);
    }
  };

  if (!refinedData) {
    return (
      <div>
        <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 2: Refine with Claude</h2>
        <p className="mb-6 text-gray-600">
          Claude AI will enhance your draft with additional details like pronouns, location, and a visual description.
        </p>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-700">
          <p className="font-semibold">Draft Summary</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <strong>Name:</strong> {draftCharacter.name}
            </li>
            {draftCharacter.age && (
              <li>
                <strong>Age:</strong> {draftCharacter.age}
              </li>
            )}
            {draftCharacter.profession && (
              <li>
                <strong>Profession:</strong> {draftCharacter.profession}
              </li>
            )}
            {draftCharacter.gender && (
              <li>
                <strong>Gender:</strong> {draftCharacter.gender}
              </li>
            )}
            <li>
              <strong>Bio:</strong> {draftCharacter.bio}
            </li>
            <li>
              <strong>Color:</strong>{' '}
              <span
                className="ml-1 inline-block h-4 w-8 rounded border"
                style={{ backgroundColor: draftCharacter.color }}
              />
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
            onClick={handleRefine}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Refining with Claude...' : 'Refine Character →'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 2: Review & Edit</h2>
      <p className="mb-6 text-gray-600">
        Claude has refined your character. Review and edit any fields as needed.
      </p>

      <div className="space-y-6">
        {/* ID */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">ID (slug)</label>
          <input
            type="text"
            value={editedData?.id || ''}
            onChange={(e) => handleEditField('id', e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Used for internal reference (lowercase, no spaces)</p>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Name</label>
          <input
            type="text"
            value={editedData?.name || ''}
            onChange={(e) => handleEditField('name', e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Pronouns */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Pronouns</label>
          <input
            type="text"
            value={editedData?.pronouns || ''}
            onChange={(e) => handleEditField('pronouns', e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Age */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Age</label>
          <input
            type="number"
            value={editedData?.age || ''}
            onChange={(e) => handleEditField('age', parseInt(e.target.value, 10))}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Location</label>
          <input
            type="text"
            value={editedData?.location || ''}
            onChange={(e) => handleEditField('location', e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profession */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Profession</label>
          <input
            type="text"
            value={editedData?.profession || ''}
            onChange={(e) => handleEditField('profession', e.target.value)}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Bio</label>
          <textarea
            value={editedData?.bio || ''}
            onChange={(e) => handleEditField('bio', e.target.value)}
            rows={4}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Silhouette */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Silhouette (Visual Description)</label>
          <textarea
            value={editedData?.silhouette || ''}
            onChange={(e) => handleEditField('silhouette', e.target.value)}
            rows={3}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">Describes the blob character's shape, pose, and presence</p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-semibold text-gray-700">Color</label>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="color"
              value={editedData?.color || '#000000'}
              onChange={(e) => handleEditField('color', e.target.value)}
              className="h-16 w-24 cursor-pointer rounded-lg border border-gray-300"
            />
            <p className="text-sm text-gray-600">{editedData?.color}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-300 px-6 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          ← Back
        </button>
        <button
          onClick={() => {
            setRefinedData(null);
            handleRefine();
          }}
          className="rounded-lg border border-blue-600 px-6 py-2 font-semibold text-blue-600 transition-colors hover:bg-blue-50"
        >
          Refine Again
        </button>
        <button
          onClick={handleProceed}
          className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
        >
          Next: Generate Images →
        </button>
      </div>
    </div>
  );
}
