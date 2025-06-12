import {Flex} from 'figma-kit';

export function StatusBar(props: React.PropsWithChildren<{}>) {
  return (
    <Flex
      gap="2"
      direction="row"
      justify="between"
      style={{
        borderTop: '1px solid var(--figma-color-border)',
        padding: '6px 12px',
      }}>
      {props.children}
    </Flex>
  );
}
