import {getNode} from 'backend/parser/lib/node';

export function importNode(event: DropEvent) {
  const item = event.items[0];
  if (item?.type !== 'figma/node-id') return true;
  try {
    const target = event.node as BaseNode & ChildrenMixin;
    const node = getNode(item.data);
    const master = node.type === 'COMPONENT_SET' ? node.defaultVariant : node;
    if (master.type === 'COMPONENT') {
      const instance = master.createInstance();
      target.appendChild(instance);
      instance.x = event.absoluteX;
      instance.y = event.absoluteY;
      figma.currentPage.selection = [instance];
    }
  } catch (e) {
    console.log('[importNode/error]', e);
  }
  return false;
}
