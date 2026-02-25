

// /// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly GEMINI_API_KEY?: string; // Added for type safety
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Extend the Window interface to include VITE_API_URL for global access
// and a basic structure for process.env including API_KEY
declare global {
  interface Window {
    VITE_API_URL?: string;
    process?: {
      env: {
        API_KEY?: string; // For general use if needed
        GEMINI_API_KEY?: string; // Specifically for Gemini API Key
        [key: string]: any; // Allow other env variables
      };
    };
  }
}

export {}; // Add this line to ensure the file is treated as a module
