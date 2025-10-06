import {emit} from '@create-figma-plugin/utilities';
import {useRef, useState} from 'react';
import {Button, Input} from 'figma-kit';
import {F2RN_SERVICE_URL} from 'config/consts';

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
  const savedToken = props.settings.config?.projectToken;
  const showBuyButton = !savedToken && props.showBuyButton;
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLink = () => {
    emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/pricing`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const projectToken = inputRef.current?.value;
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const response = await fetch(`${F2RN_SERVICE_URL}/api/validate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${projectToken}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (!result.valid) {
        throw new Error(result.error || 'Invalid token');
      }
      // Handle success
      props.settings.update(JSON.stringify({...props.settings.config, projectToken}, undefined, 2), true);
      props.onTokenValid(projectToken);
      setIsLoading(false);
    // Handle failure
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : error ?? 'Network error occurred';
      setErrorMessage(errorMsg);
      setIsLoading(false);
      props.onTokenInvalid();
      console.error('Token validation error:', error);
      emit<EventNotify>('NOTIFY', errorMsg, {
        error: true,
        timeout: 10000,
        button: ['Dashboard', `${F2RN_SERVICE_URL}/dashboard`],
      });
    }
  };

  return (
    <form
      style={{
        display: 'flex',
        flexDirection: 'row',
        margin: 0,
        gap: 12,
        flex: 1,
      }}
      onSubmit={handleSubmit}>
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
              setErrorMessage('');
            }
          }}
          style={{
            width: '100%',
            paddingRight: showBuyButton ? 43 : '0.5rem',
            outlineColor: errorMessage ? 'var(--figma-color-border-danger)' : undefined,
            backgroundColor: errorMessage ? 'var(--figma-color-bg-danger-tertiary)' : undefined,
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
