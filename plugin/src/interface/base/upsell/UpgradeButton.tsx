import {IconButton} from 'figma-kit';
import {useUpsellEvent} from './useUpsellEvent';
import type {Navigation} from 'interface/hooks/useNavigation';

interface UpgradeButtonProps {
  nav?: Navigation;
}

export function UpgradeButton(props: UpgradeButtonProps) {
  const {showUpsell} = useUpsellEvent();

  const handleClick = () => {
    // Navigate to components page first if handler is provided
    props.nav?.gotoTab('components');
    // Then show the upsell
    showUpsell();
  };

  return (
    <IconButton
      size="small"
      aria-label="Upgrade"
      onClick={handleClick}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20px"
        height="20px"
        viewBox="0 0 256 256"
        className="rotate on-hover">
        <path
          fill="var(--figma-color-icon-success)"
          d="M196.12 128c24.65-34.61 37.22-70.38 19.74-87.86S162.61 35.23 128 59.88C93.39 35.23 57.62 22.66 40.14 40.14S35.23 93.39 59.88 128c-24.65 34.61-37.22 70.38-19.74 87.86c5.63 5.63 13.15 8.14 21.91 8.14c18.48 0 42.48-11.17 66-27.88C151.47 212.83 175.47 224 194 224c8.76 0 16.29-2.52 21.91-8.14c17.43-17.48 4.86-53.25-19.79-87.86m8.43-76.55c7.64 7.64 2.48 32.4-18.52 63.28a300 300 0 0 0-21.19-23.57A300 300 0 0 0 141.27 70c30.88-21 55.64-26.2 63.28-18.55M176.29 128a289 289 0 0 1-22.76 25.53A289 289 0 0 1 128 176.29a289 289 0 0 1-25.53-22.76A289 289 0 0 1 79.71 128A298.6 298.6 0 0 1 128 79.71a289 289 0 0 1 25.53 22.76A289 289 0 0 1 176.29 128M51.45 51.45c2.2-2.21 5.83-3.35 10.62-3.35c11.82 0 30.69 6.9 52.65 21.9a304 304 0 0 0-23.56 21.16A300 300 0 0 0 70 114.73C49 83.85 43.81 59.09 51.45 51.45m0 153.1c-7.64-7.64-2.45-32.4 18.55-63.28a300 300 0 0 0 21.19 23.57A304 304 0 0 0 114.73 186c-30.88 21-55.64 26.2-63.28 18.55m153.1 0c-7.64 7.65-32.4 2.48-63.28-18.52a304 304 0 0 0 23.57-21.19A300 300 0 0 0 186 141.27c21 30.88 26.19 55.64 18.55 63.28M140 128a12 12 0 1 1-12-12a12 12 0 0 1 12 12"
        />
      </svg>
    </IconButton>
  )
}
