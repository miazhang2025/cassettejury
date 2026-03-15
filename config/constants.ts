export const APP_CONSTANTS = {
  // Jury selection
  MAX_JURIES: 11,
  SELECTED_JURIES_COUNT: 9,

  // API
  API_KEY_SESSION_KEY: 'anthropic_api_key',
  API_KEY_PREFIX: 'sk-ant-',

  // Animation timings
  FIGHT_DURATION_MS: 3500, // 3.5 seconds fight animation
  RESULT_SHOW_DELAY_MS: 500, // Delay before showing results
  TRANSITION_DURATION_MS: 300, // UI transition duration

  // Physics
  PHYSICS_GRAVITY: 9.8,
  PHYSICS_STEP_SIZE: 1 / 60,
  PHYSICS_DAMPING: 0.98,
  PHYSICS_FIGHT_FORCE: 25, // Force applied during fight animation

  // UI
  MAX_QUESTION_LENGTH: 500,
  TOOLTIP_DELAY_MS: 200,

  // Three.js
  CANVAS_FOV: 75,
  CANVAS_NEAR: 0.1,
  CANVAS_FAR: 1000,

  // Blob
  BLOB_RADIUS: 1, // Default sphere radius for now
  BLOB_SEGMENTS: 32,

  // Modal
  MODAL_ANIMATION_DURATION: 0.3,
};

export const endpoints = {
  API_JURY: '/api/jury',
};
