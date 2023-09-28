import {F2RN_NAVIGATE_NS} from 'config/env';
import {AppPages} from 'types/app';

export async function loadCurrentPage(): Promise<AppPages | null> {
  try {
    return await figma.clientStorage.getAsync(F2RN_NAVIGATE_NS);
  } catch (e) {
    return null;
  }
}

export async function saveCurrentPage(page: AppPages) {
  try {
    return figma.clientStorage.setAsync(F2RN_NAVIGATE_NS, page);
  } catch (e) {
    return false;
  }
}
