'use client';

import { useState, useEffect } from 'react';
import { StyleAnchor } from '@/config/styleAnchor';

export default function StyleAnchorManagement() {
  const [styleAnchor, setStyleAnchor] = useState<StyleAnchor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [editingField, setEditingField] = useState<string | null>(null);

  useEffect(() => {
    fetchStyleAnchor();
  }, []);

  const fetchStyleAnchor = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/style-anchor');
      if (!response.ok) throw new Error('Failed to fetch style anchor');
      const data = await response.json();
      setStyleAnchor(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load style anchor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!styleAnchor) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/style-anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(styleAnchor),
      });

      if (!response.ok) throw new Error('Failed to save style anchor');
      
      const { styleAnchor: updatedAnchor } = await response.json();
      setStyleAnchor(updatedAnchor);
      setSuccessMessage('Style Anchor saved successfully!');
      setEditingField(null);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof StyleAnchor, value: any) => {
    setStyleAnchor(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading style anchor...</div>;
  }

  if (!styleAnchor) {
    return <div className="text-center py-8 text-red-600">Failed to load style anchor</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Style Anchor Management</h2>
        <p className="text-gray-600">
          Define the visual style that will be injected into all character generation prompts
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Version */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Version</label>
        <input
          type="text"
          value={styleAnchor.version}
          onChange={(e) => handleFieldChange('version', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="e.g., 1.0.0"
        />
      </div>

      {/* Rendering Style */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Rendering Style</label>
        <textarea
          value={styleAnchor.rendering_style}
          onChange={(e) => handleFieldChange('rendering_style', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Describe overall art direction and rendering quality..."
        />
      </div>

      {/* Lighting */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Lighting</label>
        <textarea
          value={styleAnchor.lighting}
          onChange={(e) => handleFieldChange('lighting', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Describe lighting setup and mood..."
        />
      </div>

      {/* Color Palette */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Color Palette</label>
        <textarea
          value={styleAnchor.color_palette}
          onChange={(e) => handleFieldChange('color_palette', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Describe color language and restrictions..."
        />
      </div>

      {/* Character Framing */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Character Framing</label>
        <textarea
          value={styleAnchor.character_framing}
          onChange={(e) => handleFieldChange('character_framing', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Describe composition rules, angle, crop, background treatment..."
        />
      </div>

      {/* Prohibited Elements */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Prohibited Elements (one per line)</label>
        <textarea
          value={styleAnchor.prohibited_elements.join('\n')}
          onChange={(e) => handleFieldChange('prohibited_elements', e.target.value.split('\n').filter(l => l.trim()))}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="photorealism&#10;harsh shadows&#10;complex backgrounds..."
        />
      </div>

      {/* Reference Prompts */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Reference Prompts (one per line)</label>
        <textarea
          value={styleAnchor.reference_prompts.join('\n\n')}
          onChange={(e) => handleFieldChange('reference_prompts', e.target.value.split('\n\n').filter(l => l.trim()))}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="Example approved prompt 1&#10;&#10;Example approved prompt 2..."
        />
      </div>

      {/* Last Updated */}
      <div className="rounded-lg border border-gray-300 bg-gray-50 p-6">
        <p className="text-sm text-gray-600">
          Last updated: {new Date(styleAnchor.last_updated).toLocaleString()}
        </p>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors hover:bg-green-700 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Style Anchor'}
      </button>
    </div>
  );
}
