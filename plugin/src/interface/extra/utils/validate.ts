import {F2RN_SERVICE_URL} from 'config/consts';

export async function validate(projectToken: string) {
  try {
    const response = await fetch(`${F2RN_SERVICE_URL}/api/validate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${projectToken}`,
        'Content-Type': 'application/json',
      },
    });
    const result = await response.json();
    if (!result.valid) {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
  return true;
}
