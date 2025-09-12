import {IconComponent} from './icons/16/Component';

interface LayerProps {
  active?: boolean;
  warning?: boolean;
  component?: boolean;
  description?: string;
  endComponent?: React.ReactNode[];
  children: React.ReactNode;
  onChange?: () => void;
}

export function Layer({
  component = false,
  warning = false,
  active = false,
  description,
  endComponent,
  children,
  onChange,
}: LayerProps) {
  return (
    <div className={`layer ${component ? 'layer--component' : ''}`}>
      <div className={`layer__content ${active ? 'layer__content--active' : ''}`} onClick={onChange}>
        <div className="layer__icon">
          <IconComponent color={warning ? 'warning' : 'component'}/>
        </div>
        <span className="layer__label">
          {children}
        </span>
        {description &&
          <span className="layer__desc">
            {description}
          </span>
        }
        {endComponent?.map((icon, index) => (
          <div key={index} className="layer__end-components">
            {endComponent}
          </div>
        ))}
      </div>
    </div>
  );
}
