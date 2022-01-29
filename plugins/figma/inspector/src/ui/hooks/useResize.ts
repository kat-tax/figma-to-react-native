import {useState, useEffect} from 'react';

export function useResize() {
  const [render, setRender] = useState(0);
  useEffect(() => {
    const handleResize = () => setRender(Date.now());
    addEventListener('resize', handleResize);
    return () => removeEventListener('resize', handleResize);
  }, []);
  return render;
}
