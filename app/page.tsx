'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LandingContainer } from '@/components/LandingPage/LandingContainer';
import { HeroSection } from '@/components/LandingPage/HeroSection';
import { JurySelector } from '@/components/LandingPage/JurySelector';
import { ApiKeyInput } from '@/components/LandingPage/ApiKeyInput';
import { JuryMember } from '@/config/juries';
import { APP_CONSTANTS } from '@/config/constants';

export default function Home() {
  const router = useRouter();
  const { setSelectedJuries, setApiKey, setStage, allJuries } = useApp();
  const [selectedJuries, setLocalSelectedJuries] = useState<JuryMember[]>(
    allJuries.slice(0, APP_CONSTANTS.SELECTED_JURIES_COUNT)
  );

  const handleSelectionChange = (juries: JuryMember[]) => {
    setLocalSelectedJuries(juries);
  };

  const handleApiKeySubmit = (apiKey: string) => {
    setApiKey(apiKey);
    setSelectedJuries(selectedJuries);
    setStage('experience');
    router.push('/jury');
  };

  return (
    <LandingContainer>
      <HeroSection />
      <JurySelector
        allJuries={allJuries}
        onSelectionChange={handleSelectionChange}
        onProceed={() => {}}
      />
      <ApiKeyInput
        onApiKeySubmit={handleApiKeySubmit}
        isValid={selectedJuries.length === APP_CONSTANTS.SELECTED_JURIES_COUNT}
        selectedCount={selectedJuries.length}
      />
    </LandingContainer>
  );
}
