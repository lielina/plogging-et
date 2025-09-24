import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SurveyContextType {
  isSurveyOpen: boolean;
  openSurvey: () => void;
  closeSurvey: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (context === undefined) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};

interface SurveyProviderProps {
  children: ReactNode;
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);

  const openSurvey = () => setIsSurveyOpen(true);
  const closeSurvey = () => setIsSurveyOpen(false);

  const value: SurveyContextType = {
    isSurveyOpen,
    openSurvey,
    closeSurvey,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};