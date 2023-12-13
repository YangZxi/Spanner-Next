"use client";

import React, { useEffect, useState } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function ClientOnly({ children }: Props): React.JSX.Element | null {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
};