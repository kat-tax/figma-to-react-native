import {emit} from '@create-figma-plugin/utilities';
import {useRef} from 'react';
import {Button, Input} from 'figma-kit';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {EventOpenLink} from 'types/events';
import type {SettingsData} from 'interface/hooks/useUserSettings';

interface ProjectUpsellProps {
  settings: SettingsData;
  onTokenValid: (token: string) => void;
  onTokenInvalid: () => void;
  buttonText?: string;
}

export function ProjectUpsell(props: ProjectUpsellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleBuyClick = () => {
    emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/pricing`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = inputRef.current?.value;
    // Check if project token is valid (40 characters)
    if (!token?.length || token.length !== 40) {
      props.onTokenInvalid();
    } else {
      // Save the token to settings
      props.settings.update(JSON.stringify({
        ...props.settings.config,
        projectToken: token,
      }, undefined, 2), true);
      // Call when token is valid
      props.onTokenValid(token);
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
          defaultValue={props.settings.config?.projectToken}
          placeholder="Project Token"
          style={{width: '100%', paddingRight: !props.settings.config?.projectToken ? 43 : '0.5rem'}}
        />
        {!props.settings.config?.projectToken && (
          <Button
            size="small"
            variant="success"
            type="button"
            onClick={handleBuyClick}
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
        {props.buttonText || 'Save'}
      </Button>
    </form>
  );
}
