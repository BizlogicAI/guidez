import type { ReactNode } from 'react';
import { useAuth } from '../lib/context/AuthContext';
import { GuestPrompt } from './GuestPrompt';

interface ProtectedScreenProps {
  children: ReactNode;
  title?: string;
  message?: string;
}

export function ProtectedScreen({ children, title, message }: ProtectedScreenProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <GuestPrompt title={title} message={message} />;
  }

  return <>{children}</>;
}
