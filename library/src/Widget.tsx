const {useEffect, Text} = figma.widget;

function Widget() {
  useEffect(() => {
    figma.ui.onmessage = (msg) => {
      if (msg.type === 'showToast') {
        figma.notify('Hello widget');
      }
      if (msg.type === 'close') {
        figma.closePlugin();
      }
    }
  });

  return (
    <Text
      fontSize={24}
      onClick={() => new Promise((resolve) => {
        figma.showUI(__html__);
      })}>
      Open IFrame
    </Text>
  );
}

figma.widget.register(Widget);
