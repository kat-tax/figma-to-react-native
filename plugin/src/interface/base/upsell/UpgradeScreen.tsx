import {emit} from '@create-figma-plugin/utilities';
import {Flex, Text, Button} from 'figma-kit';
import {F2RN_SERVICE_URL} from 'config/consts';
import {useUpsellEvent} from 'interface/base/upsell/useUpsellEvent';
import {IconExport} from 'interface/base/icons/Export';
import {IconGitHub} from 'interface/base/icons/GitHub';
import {IconMCP} from 'interface/base/icons/MCP';
import {IconSync} from 'interface/base/icons/Sync';
import {IconCollab} from 'interface/base/icons/Collab';
import {IconSupport} from 'interface/base/icons/Support';

import type {EventOpenLink} from 'types/events';

const features = [
  {
    title: 'GitHub integration',
    icon: IconGitHub,
  },
  {
    title: 'Download entire project',
    icon: IconExport,
  },
  {
    title: 'Real-time sync to filesystem',
    icon: IconSync,
  },
  {
    title: 'AI Agent integration (MCP)',
    icon: IconMCP,
  },
  {
    title: 'Team collaboration tools',
    icon: IconCollab,
  },
  {
    title: 'Priority support',
    icon: IconSupport,
  },
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
          Upgrade to Pro
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
            variant="success"
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
          padding: '8px 16px',
          borderRadius: '12px',
          border: '1px solid var(--figma-color-border)',
          backgroundColor: 'var(--figma-color-bg-secondary)',
        }}>
          {features.map((feature, index) => {
            const FeatureIcon = feature.icon;
            return (
              <Flex key={index} align="center" style={{
                gap: '12px',
                padding: '8px 0',
                borderBottom: index < features.length - 1 ? '1px solid var(--figma-color-border)' : 'none'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: 'var(--figma-color-bg-brand)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FeatureIcon color="#fff" size={20} />
                </div>
                <Text size="medium" style={{
                  color: 'var(--figma-color-text)',
                  lineHeight: '1.4'
                }}>
                  {feature.title}
                </Text>
              </Flex>
            );
          })}
        </div>
      </Flex>
    </Flex>
  )
}
