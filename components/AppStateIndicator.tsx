
import React from 'react';
import { AppState } from '../types';

interface AppStateIndicatorProps {
  state: AppState;
  error: string | null;
}

export const AppStateIndicator: React.FC<AppStateIndicatorProps> = ({ state, error }) => {
  const getMessage = () => {
    switch (state) {
      case AppState.GENERATING_TEXT:
        return 'Generating email copy and subject line...';
      case AppState.GENERATING_IMAGE:
        return 'Creating a stunning visual for your campaign...';
      case AppState.ERROR:
        return error || 'An unknown error occurred.';
      default:
        return null;
    }
  };

  const message = getMessage();
  if (!message) return null;

  const isError = state === AppState.ERROR;

  return (
    <div className={`p-4 mb-4 rounded-lg flex items-start space-x-3 ${isError ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-blue-900/50 text-blue-300 border border-blue-700'}`}>
      <div>
        {isError ? (
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        ) : (
          <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </div>
      <p className="font-medium text-sm">{message}</p>
    </div>
  );
};
