

import { createContext } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';


export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});


export const userContext = createContext({
  submitted: false,
  toggleSubmitted: () => { },
});

