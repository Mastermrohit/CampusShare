export const CATEGORIES = ['Textbooks', 'Electronics', 'Lab Gear', 'Sports', 'Misc'] as const;
export type Category = typeof CATEGORIES[number];

export const LISTING_TYPES = ['Lend', 'Borrow', 'Donate'] as const;
export type ListingType = typeof LISTING_TYPES[number];

export const CAMPUS_LOCATIONS = [
  'Central Library',
  'Student Union',
  'Engineering Building',
  'Science Quad',
  'Dining Hall',
  'Athletic Center',
  'North Dorms',
  'South Dorms',
  'Arts Building',
  'Campus Gate',
] as const;

export const CAMPUS_NAMES = [
  'UIT RGPV - Main Campus',
] as const;
