'use client';

import React, { useRef, useState } from 'react';
import { APP_CONSTANTS } from '@/config/constants';
import { useIsMobile } from '@/hooks/useIsMobile';
import { QuestionImage } from '@/types/ai';

interface InputBoxProps {
  onSubmit: (question: string, image?: QuestionImage) => void;
  isLoading: boolean;
  style?: React.CSSProperties;
  showResults?: boolean;
  submittedQuestion?: string | null;
  onResetQuestion?: () => void;
}

// Claude downsamples anything larger than ~1568px on the long edge anyway,
// and keeping uploads small keeps the request well under hosting body limits.
const MAX_IMAGE_EDGE = 1568;
const JPEG_QUALITY = 0.85;

interface AttachedImage {
  previewUrl: string; // data URL, used for the thumbnail
  payload: QuestionImage;
}

// Re-encode the picked file as a downscaled JPEG. Also normalises formats the
// API doesn't accept (e.g. HEIC on some browsers) as long as the browser can decode them.
const compressImage = (file: File): Promise<AttachedImage> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Canvas not supported'));
        return;
      }
      // Flatten transparency onto white so PNGs don't turn black as JPEG.
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      resolve({
        previewUrl: dataUrl,
        payload: { data: dataUrl.split(',')[1], mediaType: 'image/jpeg' },
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read that image'));
    };
    img.src = objectUrl;
  });

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, isLoading, style, showResults, submittedQuestion: externalSubmittedQuestion, onResetQuestion }) => {
  const [question, setQuestion] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [submittedQuestion, setSubmittedQuestion] = useState<string | null>(null);
  const [image, setImage] = useState<AttachedImage | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Use external submitted question if provided, otherwise use local state
  const currentSubmittedQuestion = externalSubmittedQuestion !== undefined ? externalSubmittedQuestion : submittedQuestion;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.slice(0, APP_CONSTANTS.MAX_QUESTION_LENGTH);
    setQuestion(value);
    setCharCount(value.length);
  };

  const attachFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Only image files can be attached.');
      return;
    }
    setImageError(null);
    setIsProcessingImage(true);
    try {
      setImage(await compressImage(file));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not read that image');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    attachFile(e.target.files?.[0]);
    // Reset so picking the same file again still fires onChange
    e.target.value = '';
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'));
    if (file) {
      e.preventDefault();
      attachFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageError(null);
  };

  const canSubmit = !!question.trim() && !isLoading && !isProcessingImage;

  const handleSubmit = () => {
    if (canSubmit) {
      setSubmittedQuestion(question);
      onSubmit(question, image?.payload);
    }
  };

  const handleAskNewQuestion = () => {
    setSubmittedQuestion(null);
    setQuestion('');
    setCharCount(0);
    setImage(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && !submittedQuestion) {
      handleSubmit();
    }
  };

  // Show textarea if no question submitted yet, otherwise show submitted question text
  const showTextarea = !currentSubmittedQuestion;

  return (
    <div
      className="fixed left-1/2 transform -translate-x-1/2 w-11/12 sm:w-full max-w-2xl"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0)',
        borderColor: '#cccccc00',
        top: isMobile ? 'calc(80px + 1rem)' : 'calc(30px + 1rem)',
        zIndex: 30,
        pointerEvents: 'auto',
        ...style,
      }}
    >
      <div className="p-3 sm:p-4 md:p-6">
        {/* Show textarea before submission */}
        {showTextarea ? (
          <>
            <textarea
              value={question}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
              placeholder="Describe the creative decision you're stuck on..."
              className="w-full px-3 py-2 border backdrop-blur-xs rounded-md text-xs sm:text-sm focus:outline-none focus:ring-1 resize-none"
              style={{
                borderColor: '#cccccc',
                backgroundColor: '#d0d0d031',
                color: '#ffffff',
                '--tw-ring-color': '#ffffff',
                minHeight: '90px',
                fontFamily: "'IBM Plex Mono', monospace",
              } as React.CSSProperties}
              disabled={isLoading}
            />

            {image && (
              <div className="mt-2 relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.previewUrl}
                  alt="Attached image"
                  className="rounded-md border object-cover"
                  style={{ height: '64px', maxWidth: '160px', borderColor: '#cccccc' }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isLoading}
                  aria-label="Remove image"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full border text-white text-xs leading-none flex items-center justify-center"
                  style={{ backgroundColor: '#000000aa', borderColor: '#D9D9D9' }}
                >
                  ×
                </button>
              </div>
            )}

            {imageError && (
              <p className="mt-1 text-xs" style={{ color: '#ff8a8a', fontFamily: "'IBM Plex Mono', monospace" }}>
                {imageError}
              </p>
            )}

            <div className="mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs" style={{ color: '#ffffff74' }}>
                  {charCount}/{APP_CONSTANTS.MAX_QUESTION_LENGTH}
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading || isProcessingImage}
                  className="px-3 py-1 rounded-3xl border text-white text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: '#c9c9c927',
                    borderColor: '#D9D9D9',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {isProcessingImage ? 'Loading…' : image ? 'Replace image' : '+ Image'}
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-3xl font-medium border text-white text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg active:scale-95"
                style={{
                  backgroundColor: question.trim() && !isLoading ? '#c9c9c927' : '#CCCCCC',
                  fontFamily: "'IBM Plex Mono', monospace",
                  borderColor: '#D9D9D9',
                  transition: 'all 0.2s ease-out',
                } as React.CSSProperties}
              >
                {isLoading ? 'Jury Deciding...' : 'Put it to the Jury'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3" style={{ marginLeft: '20px' }}>
            {/* Show submitted question (and its image) as text after submission */}
            {image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.previewUrl}
                alt="Attached image"
                className="rounded-md border object-cover shrink-0"
                style={{ height: '48px', width: '48px', borderColor: '#cccccc' }}
              />
            )}
            <h3
              style={{
                color: '#ffffff',
                fontFamily: "'IBM Plex Mono', monospace",
                margin: 0,
                fontSize: '1rem',
                lineHeight: '1.5',
              }}
            >
              {currentSubmittedQuestion}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};
