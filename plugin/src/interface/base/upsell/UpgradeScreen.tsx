import {Flex, Text, Link, Button} from 'figma-kit';
import {useUpsellEvent} from './useUpsellEvent';
import {IconCheck} from 'interface/figma/icons/24/Check';
import {IconPlus} from 'interface/figma/icons/24/Plus';
import {F2RN_SERVICE_URL} from 'config/consts';

export function UpgradeScreen() {
  const {hideUpsell} = useUpsellEvent();

  const features = [
    'Bulk component downloads',
    'Git version control integration',
    'Real-time syncing to filesystem',
    'AI Agent integration (MCP)',
    'Team collaboration tools',
    'Priority support',
  ];

  const placeholderImages = [
    { title: 'Git', description: 'Version control integration' },
    { title: 'Zip', description: 'Download all components' },
    { title: 'Sync', description: 'Real-time sync to filesystem' },
    { title: 'MCP', description: 'Model Context Protocol server' },
    { title: 'Collab', description: 'Team workflow tools' },
    { title: 'Priority Support', description: '24/7 expert assistance' },
  ];

  return (
    <Flex direction="column" style={{
      flex: 1,
      padding: '16px',
      gap: '16px',
      minWidth: '255px',
      maxWidth: '100%',
    }}>
      {/* Header */}
      <Flex direction="column" align="center" style={{ gap: '6px' }}>
        <Text weight="strong" size="large">
          Upgrade to Premium
        </Text>
        <Text size="medium" style={{color: 'var(--figma-color-text-secondary)'}}>
          Enter your project token to unlock features
        </Text>
        <Flex style={{gap: '8px', marginTop: '8px'}}>
          <Button
            variant="text"
            size="medium"
            onClick={hideUpsell}>
            Go Back
          </Button>
          <Button
            variant="success"
            size="medium"
            href={`${F2RN_SERVICE_URL}/pricing`}
            target="_blank">
            Buy Token
          </Button>
        </Flex>
      </Flex>
      {/* Features List */}
      <Flex direction="column" align="center" style={{gap: '8px'}}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {features.map((feature, index) => (
            <Flex key={index} align="center" style={{gap: '6px'}}>
              <IconCheck color="success" size={14} />
              <Text size="medium">
                {feature}
              </Text>
            </Flex>
          ))}
        </div>
      </Flex>
      {/* Image Grid - Single column on narrow screens */}
      <Flex direction="column" style={{ gap: '12px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
          gap: '6px'
        }}>
          {placeholderImages.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--figma-color-bg-secondary)',
                borderRadius: '6px',
                padding: '12px 8px',
                border: '1px solid var(--figma-color-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                minHeight: '90px',
                justifyContent: 'center'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--figma-color-bg-brand)',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '4px'
              }}>
                <IconPlus color="onbrand" size={16} />
              </div>
              <Text style={{
                fontSize: '11px',
                fontWeight: '500',
                color: 'var(--figma-color-text)',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {item.title}
              </Text>
              <Text style={{
                fontSize: '9px',
                color: 'var(--figma-color-text-secondary)',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {item.description}
              </Text>
            </div>
          ))}
        </div>
      </Flex>
    </Flex>
  )
}
