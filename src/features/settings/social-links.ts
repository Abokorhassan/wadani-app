/**
 * The party's own accounts, opened from the Profile screen.
 *
 * FILL THESE IN BEFORE RELEASE with the party's real links, e.g.
 * `https://www.facebook.com/...`. An empty link hides its icon, and while all
 * are empty the whole "Follow the party" section stays hidden, so members are
 * never sent to an account that is not the party's.
 */
export const SOCIAL_LINKS = {
  facebook: '',
  tiktok: '',
  x: '',
  website: '',
} as const;

export type SocialNetwork = keyof typeof SOCIAL_LINKS;
