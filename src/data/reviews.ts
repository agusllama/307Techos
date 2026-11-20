export interface Review {
  id?: string;
  authorName: string;
  rating: number; // 1 to 5
  comment?: string;
  avatarColor?: string;
  avatarUrl?: string;
  date?: string;
  isGmb?: boolean;
}

export const GOOGLE_AVATAR_COLORS = [
  '#4285F4', // Blue
  '#34A853', // Green
  '#FBBC05', // Amber
  '#EA4335', // Red
];

/**
 * Formats and truncates review comments if they exceed maxLength.
 * Rule: if very long (> maxLength), find a sentence ending (period '.')
 * and append '...'.
 */
export function formatReviewComment(comment?: string, maxLength: number = 130): string {
  if (!comment) return '';
  const trimmed = comment.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // Find all period matches that end a sentence (followed by whitespace, quote/punctuation, or end of string)
  const periodMatches = [...trimmed.matchAll(/\.(?:\s+|$|[!?"])/g)];

  // We only consider periods that actually truncate content (there is text remaining after the period)
  const truncatingPeriods = periodMatches.filter((m) => {
    const idx = m.index ?? 0;
    const remaining = trimmed.slice(idx + 1).trim();
    return remaining.length > 0;
  });

  if (truncatingPeriods.length > 0) {
    // 1. Prefer the latest period that is within maxLength
    const candidateBefore = truncatingPeriods
      .filter((m) => (m.index ?? 0) <= maxLength)
      .pop();

    if (candidateBefore && candidateBefore.index !== undefined) {
      const text = trimmed.slice(0, candidateBefore.index).replace(/[.,:;!\s]+$/, '');
      return text + '...';
    }

    // 2. Or a period slightly past maxLength (within +25 chars)
    const candidateNear = truncatingPeriods.find(
      (m) => (m.index ?? 0) > maxLength && (m.index ?? 0) <= maxLength + 25
    );
    if (candidateNear && candidateNear.index !== undefined) {
      const text = trimmed.slice(0, candidateNear.index).replace(/[.,:;!\s]+$/, '');
      return text + '...';
    }

    // 3. If there is an earlier period, use it rather than cutting mid-sentence at a random word
    const earliest = truncatingPeriods[0];
    if (earliest && earliest.index !== undefined) {
      const text = trimmed.slice(0, earliest.index).replace(/[.,:;!\s]+$/, '');
      return text + '...';
    }
  }

  // Fallback if no truncating period is found: cut at last word boundary before maxLength
  const truncated = trimmed.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 20) {
    return truncated.slice(0, lastSpace).replace(/[.,:;!\s]+$/, '') + '...';
  }
  return truncated.replace(/[.,:;!\s]+$/, '') + '...';
}

/**
 * Validates whether a review is qualified to be displayed.
 * Rules:
 * - Must have valid authorName (non-empty string)
 * - Must have rating >= 4 and <= 5 (no NaN)
 * - If comment is empty/omitted/whitespace, it IS valid as long as rating >= 4
 */
export function isValidReview(review: Review): boolean {
  if (!review) return false;
  if (typeof review.authorName !== 'string' || review.authorName.trim() === '') return false;
  if (
    typeof review.rating !== 'number' ||
    Number.isNaN(review.rating) ||
    review.rating < 4 ||
    review.rating > 5
  ) {
    return false;
  }
  return true;
}

/**
 * Initial 8 authentic reviews provided by the business.
 */
export const initialReviews: Review[] = [
  {
    id: 'rev-1',
    authorName: 'Gonzalo P.',
    rating: 5,
    comment: 'quedo como 0km!! encima me dieron garantia escrita, un lujo!',
    avatarColor: '#4285F4',
    avatarUrl: '/images/avatars/avatar-playa.webp',
    date: 'Hace 1 semana',
  },
  {
    id: 'rev-2',
    authorName: 'Esteban Rossi',
    rating: 5,
    comment: 'todo bien! vino Agustin super profesional y prolijo recomiendo',
    avatarColor: '#34A853',
    date: 'Hace 2 semanas',
  },
  {
    id: 'rev-3',
    authorName: 'Lucas Benítez',
    rating: 4,
    comment: 'cumplieron el turno que me dieron en dia y hora quedo bien',
    avatarColor: '#FBBC05',
    avatarUrl: '/images/avatars/avatar-pareja.webp',
    date: 'Hace 3 semanas',
  },
  {
    id: 'rev-4',
    authorName: 'Diego M.',
    rating: 5,
    comment: 'Quedó impecable el techo del 307.',
    avatarColor: '#EA4335',
    date: 'Hace 1 mes',
  },
  {
    id: 'rev-5',
    authorName: 'Martín F.',
    rating: 5,
    comment: 'Me estaba jodiendo el tapizado viejo no aguantaba mas por suerte lo solucionaron',
    avatarColor: '#4285F4',
    avatarUrl: '/images/avatars/avatar-planta.webp',
    date: 'Hace 1 mes',
  },
  {
    id: 'rev-6',
    authorName: 'Hernán G.',
    rating: 5,
    comment: 'Trabajo súper rápido y muy prolijo',
    avatarColor: '#34A853',
    date: 'Hace 2 meses',
  },
  {
    id: 'rev-7',
    authorName: 'Alejandro V.',
    rating: 5,
    comment: 'Todo diez puntos. Puntual, rápido y con materiales de primera.',
    avatarColor: '#EA4335',
    date: 'Hace 2 meses',
  },
  {
    id: 'rev-8',
    authorName: 'Facundo Romero',
    rating: 5,
    comment: 'Excelente atención. Me pasó presupuesto al toque por WhatsApp con una foto que le mandé y coordinamos para el sábado a la mañana. Terminación perfecta.',
    avatarColor: '#FBBC05',
    date: 'Hace 3 meses',
  },
];

/**
 * Returns active reviews up to 10 total.
 * Helper logic for future Google My Business sync:
 * - Newest valid GMB reviews take the first slots
 * - Remaining slots filled by initial reviews
 * - Total reviews capped at 10
 */
export function getActiveReviews(gmbReviews: Review[] = []): Review[] {
  const validGmb = gmbReviews.filter(isValidReview).map((r, index) => ({
    ...r,
    comment: r.comment ? formatReviewComment(r.comment) : '',
    avatarColor: r.avatarColor || GOOGLE_AVATAR_COLORS[index % GOOGLE_AVATAR_COLORS.length],
    isGmb: true,
  }));

  const gmbAuthorNames = new Set(validGmb.map((r) => r.authorName.trim().toLowerCase()));

  const validInitial = initialReviews
    .filter(isValidReview)
    .filter((r) => !gmbAuthorNames.has(r.authorName.trim().toLowerCase()))
    .map((r) => ({
      ...r,
      comment: r.comment ? formatReviewComment(r.comment) : '',
    }));

  return [...validGmb, ...validInitial].slice(0, 10);
}
