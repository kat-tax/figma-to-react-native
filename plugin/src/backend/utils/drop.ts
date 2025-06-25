import {getNode, isNodeIcon} from 'backend/parser/lib/node';
import {F2RN_ICONS_SET_DATA} from 'config/consts';

export function importNode(event: DropEvent) {
  const item = event.items[0];
  if (item?.type !== 'figma/node-id') return true;
  try {
    const target = event.node as BaseNode & ChildrenMixin;
    const node = getNode(item.data);
    let isIcon: boolean;
    let iconSize: number;
    if (isNodeIcon(node)) {
      try {
        iconSize = JSON.parse(node.parent.getPluginData(F2RN_ICONS_SET_DATA)).size;
        isIcon = true;
      } catch (e) {}
    }
    const master = node.type === 'COMPONENT_SET' ? node.defaultVariant : node;
    if (master.type === 'COMPONENT') {
      const instance = master.createInstance();
      target.appendChild(instance);
      if (isIcon) {
        // Resize icon to match set size
        if (iconSize) {
          instance.resize(iconSize, iconSize);
        // Match iconify component logic, fill height
        } else {
          instance.maxHeight = instance.height;
          instance.layoutSizingVertical = 'FILL';
        }
      }
      instance.x = event.absoluteX;
      instance.y = event.absoluteY;
      figma.currentPage.selection = [instance];
    }
  } catch (e) {
    console.log('[importNode/error]', e);
  }
  return false;
}
