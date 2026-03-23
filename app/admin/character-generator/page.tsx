'use client';

import { useState } from 'react';
import { CharacterDraft, RefinedCharacter } from '@/types/app';
import DraftStep from '@/components/CharacterGenerator/DraftStep';
import RefineStep from '@/components/CharacterGenerator/RefineStep';
import ImagesStep from '@/components/CharacterGenerator/ImagesStep';
import SelectImageStep from '@/components/CharacterGenerator/SelectImageStep';
import MeshStep from '@/components/CharacterGenerator/MeshStep';
import ReviewStep from '@/components/CharacterGenerator/ReviewStep';

type GeneratorStep = 'draft' | 'refine' | 'images' | 'select' | 'mesh' | 'review';

export default function CharacterGeneratorPage() {
  const [currentStep, setCurrentStep] = useState<GeneratorStep>('draft');
  const [draftCharacter, setDraftCharacter] = useState<CharacterDraft | null>(null);
  const [refinedCharacter, setRefinedCharacter] = useState<RefinedCharacter | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [generatedMeshUrl, setGeneratedMeshUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoToStep = (step: GeneratorStep) => {
    setError(null);
    setCurrentStep(step);
  };

  const handleResetGenerator = () => {
    setCurrentStep('draft');
    setDraftCharacter(null);
    setRefinedCharacter(null);
    setGeneratedImages([]);
    setSelectedImageIndex(0);
    setGeneratedMeshUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen">
      {/* Stepper Navigation */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {[
            { step: 'draft', label: '1. Draft' },
            { step: 'refine', label: '2. Refine' },
            { step: 'images', label: '3. Images' },
            { step: 'select', label: '4. Select' },
            { step: 'mesh', label: '5. Mesh' },
            { step: 'review', label: '6. Review' },
          ].map((item, idx) => (
            <div key={item.step} className="flex items-center">
              <button
                onClick={() => handleGoToStep(item.step as GeneratorStep)}
                disabled={
                  (item.step === 'refine' && !draftCharacter) ||
                  (item.step === 'images' && !refinedCharacter) ||
                  (item.step === 'select' && generatedImages.length === 0) ||
                  (item.step === 'mesh' && selectedImageIndex === undefined) ||
                  (item.step === 'review' && !generatedMeshUrl)
                }
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all ${
                  currentStep === item.step
                    ? 'bg-blue-600 text-white'
                    : currentStep === item.step ||
                        (item.step === 'refine' && draftCharacter) ||
                        (item.step === 'images' && refinedCharacter) ||
                        (item.step === 'select' && generatedImages.length > 0) ||
                        (item.step === 'mesh' && selectedImageIndex !== undefined) ||
                        (item.step === 'review' && generatedMeshUrl)
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {idx + 1}
              </button>
              {idx < 5 && <div className="mx-2 h-0.5 w-8 bg-gray-300" />}
            </div>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800">
          <p className="font-semibold">Error</p>
          <p className="mt-1 text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-sm text-red-600 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Step Content */}
      <div className="rounded-lg bg-white p-8 shadow">
        {currentStep === 'draft' && (
          <DraftStep
            onNext={(draft) => {
              setDraftCharacter(draft);
              setCurrentStep('refine');
            }}
          />
        )}

        {currentStep === 'refine' && (
          <RefineStep
            draftCharacter={draftCharacter!}
            onRefined={(character: RefinedCharacter) => {
              setRefinedCharacter(character);
              setCurrentStep('images');
            }}
            onBack={() => setCurrentStep('draft')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}

        {currentStep === 'images' && (
          <ImagesStep
            refinedCharacter={refinedCharacter!}
            onImagesGenerated={(images: string[]) => {
              setGeneratedImages(images);
              setCurrentStep('select');
            }}
            onBack={() => setCurrentStep('refine')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}

        {currentStep === 'select' && (
          <SelectImageStep
            images={generatedImages}
            onSelected={(index: number) => {
              setSelectedImageIndex(index);
              setCurrentStep('mesh');
            }}
            onBack={() => setCurrentStep('images')}
          />
        )}

        {currentStep === 'mesh' && (
          <MeshStep
            selectedImage={generatedImages[selectedImageIndex]}
            refinedCharacter={refinedCharacter!}
            onMeshGenerated={(meshUrl: string) => {
              setGeneratedMeshUrl(meshUrl);
              setCurrentStep('review');
            }}
            onBack={() => setCurrentStep('select')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}

        {currentStep === 'review' && (
          <ReviewStep
            character={refinedCharacter!}
            selectedImage={generatedImages[selectedImageIndex]}
            meshUrl={generatedMeshUrl!}
            onReset={handleResetGenerator}
            onBack={() => setCurrentStep('mesh')}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
}
