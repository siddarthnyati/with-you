import * as SecureStore from 'expo-secure-store';

const MY_NAME_KEY = 'with_you_my_name';
const PARTNER_NAME_KEY = 'with_you_partner_name';

export async function getMyName(): Promise<string | null> {
  return SecureStore.getItemAsync(MY_NAME_KEY);
}

export async function setMyName(name: string): Promise<void> {
  await SecureStore.setItemAsync(MY_NAME_KEY, name);
}

export async function getPartnerName(): Promise<string | null> {
  return SecureStore.getItemAsync(PARTNER_NAME_KEY);
}

export async function setPartnerName(name: string): Promise<void> {
  await SecureStore.setItemAsync(PARTNER_NAME_KEY, name);
}
