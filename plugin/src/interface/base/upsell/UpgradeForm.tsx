import {emit} from '@create-figma-plugin/utilities';
import {useRef} from 'react';
import {Button, Input} from 'figma-kit';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {EventOpenLink} from 'types/events';
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
  const projectToken = props.settings.config?.projectToken;
  const showBuyButton = !projectToken && props.showBuyButton;

  const handleLink = () => {
    emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/pricing`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const projectToken = inputRef.current?.value;
    if (!projectToken?.length || projectToken.length !== 40) {
      props.onTokenInvalid();
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${projectToken}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(response.statusText || 'Validation failed');
      }
      const result = await response.json();
      if (!result.valid) {
        throw new Error(result.error);
      }
      props.settings.update(JSON.stringify({...props.settings.config, projectToken}, undefined, 2), true);
      props.onTokenValid(projectToken);
    } catch (error) {
      console.error('Token validation error:', error);
      props.onTokenInvalid();
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
          ref={inputRef}
          type="password"
          defaultValue={projectToken}
          placeholder="Project Token"
          style={{width: '100%', paddingRight: showBuyButton ? 43 : '0.5rem'}}
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
        type="submit">
        {props.buttonText || 'Upgrade'}
      </Button>
    </form>
  );
}
