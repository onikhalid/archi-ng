

import { createContext } from 'react';


export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});

export const SubmitContext = createContext({
  submitted: false,
  toggleSubmitted: () => { },
});

