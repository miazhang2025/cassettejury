'use client';

import { useState } from 'react';
import { CharacterDraft } from '@/types/app';

interface DraftStepProps {
  onNext: (draft: CharacterDraft) => void;
}

export default function DraftStep({ onNext }: DraftStepProps) {
  const [formData, setFormData] = useState<CharacterDraft>({
    name: '',
    age: undefined,
    profession: undefined,
    gender: undefined,
    bio: '',
    color: '#4250C7',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' && value ? parseInt(value, 10) : value || undefined,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (!formData.color) newErrors.color = 'Color is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onNext(formData);
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold text-gray-900">Step 1: Draft Character</h2>
      <p className="mb-6 text-gray-600">
        Start by filling in basic information about your character. Only name, bio, and color are required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Alex Rivera"
            className={`mt-2 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-semibold text-gray-700">
            Age (optional)
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            placeholder="e.g., 35"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profession */}
        <div>
          <label htmlFor="profession" className="block text-sm font-semibold text-gray-700">
            Profession (optional)
          </label>
          <input
            type="text"
            id="profession"
            name="profession"
            value={formData.profession || ''}
            onChange={handleChange}
            placeholder="e.g., Product Designer, Creative Director"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-semibold text-gray-700">
            Gender/Pronouns (optional)
          </label>
          <input
            type="text"
            id="gender"
            name="gender"
            value={formData.gender || ''}
            onChange={handleChange}
            placeholder="e.g., She/Her, He/Him, They/Them"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-semibold text-gray-700">
            Bio *
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Describe the character's background, expertise, and personality. Be vivid and specific."
            rows={4}
            className={`mt-2 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
            }`}
          />
          {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio}</p>}
        </div>

        {/* Color Picker */}
        <div>
          <label htmlFor="color" className="block text-sm font-semibold text-gray-700">
            Character Color *
          </label>
          <div className="mt-2 flex items-center gap-4">
            <input
              type="color"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleColorChange}
              className="h-16 w-24 cursor-pointer rounded-lg border border-gray-300"
            />
            <div className="flex flex-col">
              <p className="text-sm text-gray-600">Selected: {formData.color}</p>
              <p className="text-xs text-gray-500">This color will be used for the blob character</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="submit"
            className="flex-1 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Next: Refine with Claude →
          </button>
        </div>
      </form>
    </div>
  );
}
