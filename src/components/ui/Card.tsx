import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: 'moss' | 'brass' | 'clay' | 'none';
}

const accentClasses: Record<string, string> = {
  moss: 'border-t-2 border-t-moss',
  brass: 'border-t-2 border-t-brass',
  clay: 'border-t-2 border-t-clay',
  none: '',
};

export default function Card({ children, accent = 'none', className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 ${accentClasses[accent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
