import {useEffect, useState} from 'react';

const ns = 'upsell';

interface UseUpsellEventOptions {
  onShow?: () => void;
  onHide?: () => void;
}

export function useUpsellEvent(options: UseUpsellEventOptions = {}) {
  const [upsellOpen, setUpsellOpen] = useState(false);
  const {onShow, onHide} = options;

  useEffect(() => {
    const handleUpsellShow = () => {onShow?.(); setUpsellOpen(true);};
    const handleUpsellHide = () => {onHide?.(); setUpsellOpen(false);};
    window.addEventListener(`${ns}-show`, handleUpsellShow);
    window.addEventListener(`${ns}-hide`, handleUpsellHide);
    return () => {
      window.removeEventListener(`${ns}-show`, handleUpsellShow);
      window.removeEventListener(`${ns}-hide`, handleUpsellHide);
    };
  }, [onShow, onHide]);

  return {
    showUpsell: () => window.dispatchEvent(new CustomEvent(`${ns}-show`)),
    hideUpsell: () => window.dispatchEvent(new CustomEvent(`${ns}-hide`)),
    upsellOpen,
  };
}
