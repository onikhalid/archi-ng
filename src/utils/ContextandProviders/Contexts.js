"use client"

import { createContext } from 'react';


export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});

export const MobileNavContext = createContext({
  hidden: true,
  toggleTheme: () => { },
});


export const UserContext = createContext({
  user: {},
  toggleTheme: () => { },
});

