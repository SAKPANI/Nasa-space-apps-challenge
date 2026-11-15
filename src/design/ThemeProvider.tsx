import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import tokens from './tokens.json';

// Types for theme tokens
type Colors = typeof tokens.colors;
type Typography = typeof tokens.typography;
type Spacing = typeof tokens.spacing;

type Theme = {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  radius: typeof tokens.radius;
  shadow: typeof tokens.shadow;
  animation: typeof tokens.animation;
};

const ThemeContext = createContext<Theme | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeContext.Provider value={tokens as Theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): Theme => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Export tokens pour usage direct
export default tokens as Theme;
