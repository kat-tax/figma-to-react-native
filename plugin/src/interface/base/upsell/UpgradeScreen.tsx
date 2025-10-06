import {emit} from '@create-figma-plugin/utilities';
import {Flex, Text, Button} from 'figma-kit';
import {IconCheck} from 'interface/figma/icons/24/Check';
import {useUpsellEvent} from './useUpsellEvent';
import {F2RN_SERVICE_URL} from 'config/consts';

import type {EventOpenLink} from 'types/events';

const features = [
  'Bulk component downloads',
  'Git version control integration',
  'Real-time sync to filesystem',
  'AI Agent integration (MCP)',
  'Team collaboration tools',
  'Priority support',
];

export function UpgradeScreen() {
  const {hideUpsell} = useUpsellEvent();
  const openLink = () => {
    emit<EventOpenLink>('OPEN_LINK', `${F2RN_SERVICE_URL}/pricing`);
  };

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap="16px"
      style={{
        flex: 1,
        padding: '16px',
        maxWidth: '100%',
      }}>
      {/* Header */}
      <Flex direction="column" align="center" style={{ gap: '6px' }}>
        <Text weight="strong" style={{
          fontSize: '18px',
          lineHeight: '24px',
        }}>
          Upgrade to Premium
        </Text>
        <Text size="medium" style={{
          color: 'var(--figma-color-text-secondary)',
        }}>
          Enter project token to unlock features
        </Text>
        <Flex style={{
          gap: '8px',
          marginTop: '12px',
          marginBottom: '24px',
        }}>
          <Button
            variant="text"
            size="medium"
            onClick={hideUpsell}>
            Go Back
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={openLink}>
            Buy Token
          </Button>
        </Flex>
      </Flex>
      {/* Features List */}
      <Flex direction="column" align="center" style={{gap: '16px'}}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          padding: '16px',
          maxWidth: '800px',
          backgroundColor: 'var(--figma-color-bg-secondary)',
          borderRadius: '12px',
          border: '1px solid var(--figma-color-border)'
        }}>
          {features.map((feature, index) => (
            <Flex key={index} align="center" style={{
              gap: '12px',
              padding: '8px 0',
              borderBottom: index < features.length - 1 ? '1px solid var(--figma-color-border)' : 'none'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                backgroundColor: 'var(--figma-color-bg-success)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconCheck color="#fff" size={12} />
              </div>
              <Text size="medium" style={{
                color: 'var(--figma-color-text)',
                lineHeight: '1.4'
              }}>
                {feature}
              </Text>
            </Flex>
          ))}
        </div>
      </Flex>
    </Flex>
  )
}
