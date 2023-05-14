import {useRef, useState, useEffect} from 'preact/hooks';

export function useDarkMode(): boolean {
  const htmlRef = useRef(document.body.parentElement);
  const [isDark, setDark] = useState(htmlRef.current.classList.contains('figma-dark'));
  useEffect(() => {
    const $ = new MutationObserver(() =>
      setDark(htmlRef.current.classList.contains('figma-dark')));
    $.observe(htmlRef.current, {attributes: true});
    return () => $.disconnect();
  }, []);
  return isDark;
}
