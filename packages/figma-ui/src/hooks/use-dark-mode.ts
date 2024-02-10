import {useState, useEffect} from 'react';

function isFigmaDark() {
  return document.body.parentElement?.classList.contains('figma-dark') ?? false;
}

export function useDarkMode(): boolean {
  const [isDark, setDark] = useState<boolean>(isFigmaDark());
  useEffect(() => {
    const $ = new MutationObserver(() => {
      setDark(isFigmaDark());
    });
    if (document.body.parentElement) {
      $.observe(document.body.parentElement, {
        attributeFilter: ['class'],
        attributes: true,
        childList: false,
        subtree: false,
      });
    }
    return () => $.disconnect();
  }, []);
  return isDark;
}
