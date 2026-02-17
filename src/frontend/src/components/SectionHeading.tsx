import { ReactNode } from 'react';

interface SectionHeadingProps {
  emoji: string;
  title: string;
  children?: ReactNode;
}

export default function SectionHeading({ emoji, title, children }: SectionHeadingProps) {
  return (
    <div className="mb-6 space-y-2">
      <h2 className="text-2xl md:text-3xl font-semibold text-foreground flex items-center gap-3">
        <span className="text-3xl md:text-4xl leading-none">{emoji}</span>
        <span>{title}</span>
      </h2>
      {children && (
        <div className="text-base text-muted-foreground pl-12 md:pl-14">
          {children}
        </div>
      )}
    </div>
  );
}
