'use client';

import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <div className="px-4 sm:px-6 md:px-12 pt-6 sm:pt-8 md:pt-10 pb-2 sm:pb-3 md:pb-4 flex flex-col items-center justify-center" style={{ borderColor: '#CCCCCC', minHeight: '8%' }}>
      <h1 className="text-2xl sm:text-4xl md:text-8xl mb-5 text-center" style={{ color: '#9B0808' }}>
        Cassette Jury
      </h1>

      <p
        className="text-left max-w-200 mb-2"
        style={{ color: '#4a4a4a', fontSize: '11px' }}
      >
Meet your pocket jury. Cassette Jury is a panel of several AI characters — each with their own job, taste, and agenda — ready to weigh in when your team hits a creative deadlock. Submit your question, watch them deliberate, get a verdict. No prototype, no focus group, no budget required.      </p>

      {/* <div className="flex gap-4 md:gap-6 text-xs md:text-sm text-center justify-center flex-wrap" style={{ color: '#4a4a4a' }}>
        <div>✓ Choose 9 jurors</div>
        <div>✓ Ask your question</div>
        <div>✓ Get instant feedback</div>
      </div> */}
    </div>
  );
};
