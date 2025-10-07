import {emit} from '@create-figma-plugin/utilities';
import {useRef, useState} from 'react';
import {Button, Input} from 'figma-kit';
import {F2RN_SERVICE_URL} from 'config/consts';
import {validate} from 'interface/extra/utils/validate';

import type {EventNotify, EventOpenLink} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface UpgradeFormProps {
  settings: SettingsData;
  onTokenValid: (token: string) => void;
  onTokenInvalid: () => void;
  showBuyButton?: boolean;
  buttonText?: string;
}

export function UpgradeForm(props: UpgradeFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const config = props.settings.config;
  const savedToken = config?.projectToken;
  const showBuyButton = !savedToken && props.showBuyButton;
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLink = () => {
    emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/pricing`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const projectToken = inputRef.current?.value;
    e.preventDefault();
    setHasError(false);
    setIsLoading(true);
    if (await validate(projectToken)) {
      props.settings.update(JSON.stringify({...config, projectToken}, undefined, 2), true);
      props.onTokenValid(projectToken);
    } else {
      setHasError(true);
      props.onTokenInvalid();
      emit<EventNotify>('NOTIFY', 'Invalid token', {
        button: ['Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
        timeout: 10000,
        error: true,
      });
    }
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{display: 'flex', flexDirection: 'row', margin: 0, gap: 12, flex: 1}}>
      <div style={{position: 'relative', flex: 1}}>
        <Input
          autoFocus
          required
          selectOnClick
          ref={inputRef}
          type="password"
          defaultValue={savedToken}
          placeholder="Project Token"
          onChange={(e) => {
            if (!e.target.value) {
              setHasError(false);
            }
          }}
          style={{
            width: '100%',
            paddingRight: showBuyButton ? 43 : '0.5rem',
            outlineColor: hasError ? 'var(--figma-color-border-danger)' : undefined,
            backgroundColor: hasError ? 'var(--figma-color-bg-danger-tertiary)' : undefined,
          }}
        />
        {showBuyButton && (
          <Button
            size="small"
            variant="success"
            type="button"
            onClick={handleLink}
            style={{
              transform: 'scale(0.9)',
              position: 'absolute',
              height: '20px',
              right: 2,
              top: 2,
            }}>
            Buy
          </Button>
        )}
      </div>
      <Button
        size="small"
        type="submit"
        disabled={isLoading}>
        {isLoading ? 'Validating...' : (props.buttonText || 'Upgrade')}
      </Button>
    </form>
  );
}
