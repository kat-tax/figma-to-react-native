import {IconComponent} from './icons/16/Component';

interface LayerProps {
  active?: boolean;
  warning?: boolean;
  component?: boolean;
  description?: string;
  rightIcons?: React.ReactNode[];
  children: React.ReactNode;
  onChange?: () => void;
}

export function Layer({
  component = false,
  warning = false,
  active = false,
  description,
  rightIcons,
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
        {rightIcons?.map((icon, index) => (
          <div key={index} className="layer__icon">
            {icon}
          </div>
        ))}
      </div>
    </div>
  );
}
