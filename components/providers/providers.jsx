'use client';

import { AuthProvider } from './auth-provider';

export function Providers({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}