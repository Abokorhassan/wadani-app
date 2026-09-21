import * as Linking from 'expo-linking';

/**
 * Where Sifalo sends the member after a hosted card checkout. It appends
 * `sid`, and the API appends `checkout_id`, to whatever we pass.
 */
export const cardReturnUrl = (): string => Linking.createURL('card-return');
