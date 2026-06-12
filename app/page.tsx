'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { LandingContainer } from '@/components/LandingPage/LandingContainer';
import { HeroSection } from '@/components/LandingPage/HeroSection';
import { JurySelector } from '@/components/LandingPage/JurySelector';
import { ProceedBar } from '@/components/LandingPage/ProceedBar';
import { JuryMember } from '@/config/juries';

export default function Home() {
  const router = useRouter();
  const { setSelectedJuries, setStage, allJuries } = useApp();
  const [selectedJuries, setLocalSelectedJuries] = useState<JuryMember[]>([]);

  const handleSelectionChange = (juries: JuryMember[]) => {
    setLocalSelectedJuries(juries);
  };

  const handleProceed = () => {
    setSelectedJuries(selectedJuries);
    setStage('experience');
    router.push('/jury');
  };

  return (
    <>
      <LandingContainer>
        <HeroSection />
        <JurySelector
          allJuries={allJuries}
          onSelectionChange={handleSelectionChange}
          onProceed={() => {}}
        />
        <ProceedBar onProceed={handleProceed} selectedCount={selectedJuries.length} />
      </LandingContainer>
    </>
  );
}
