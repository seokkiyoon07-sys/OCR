'use client';

import { useEffect, useRef } from 'react';

interface HTMLCommentProps {
  text: string;
}

/**
 * React component that renders an actual HTML comment in the DOM.
 * Uses useRef and useEffect to replace a hidden div with a comment node.
 * 
 * Usage: <HTMLComment text="DEBUG: SIDEBAR START" />
 * Renders: <!-- DEBUG: SIDEBAR START -->
 */
export default function HTMLComment({ text }: HTMLCommentProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const comment = document.createComment(` ${text} `);
      ref.current.replaceWith(comment);
    }
  }, [text]);

  return <div ref={ref} style={{ display: 'none' }} />;
}
