'use client';

import React, { useState } from 'react';
import { ExperienceContainer } from '@/components/JuryExperience/ExperienceContainer';
import { LoadingScreen } from '@/components/LandingPage/LoadingScreen';

export default function JuryPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      <ExperienceContainer />
    </>
  );
}
