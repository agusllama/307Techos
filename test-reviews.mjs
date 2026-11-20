import {
  formatReviewComment,
  isValidReview,
  getActiveReviews,
  initialReviews,
} from './src/data/reviews.ts';
import assert from 'node:assert';

console.log('Running reviews unit tests...');

// 1. Test truncation logic
const facundoText =
  'Excelente atención. Me pasó presupuesto al toque por WhatsApp con una foto que le mandé y coordinamos para el sábado a la mañana. Terminación perfecta.';
const truncated = formatReviewComment(facundoText);
console.log('Truncated Facundo text:', truncated);
assert(truncated.endsWith('...'), 'Should end with ...');
assert(
  truncated ===
    'Excelente atención. Me pasó presupuesto al toque por WhatsApp con una foto que le mandé y coordinamos para el sábado a la mañana...',
  'Should truncate at the sentence period and append ...'
);

// Short text should remain unchanged
const shortText = 'Quedó impecable el techo del 307.';
assert.strictEqual(formatReviewComment(shortText), shortText);

// Early period should truncate at the period, not mid-word
const earlyPeriodText =
  'Quedó perfecto. Vino el muchacho a casa e hizo todo el trabajo en menos de dos horas sin ningún problema dejando todo limpio y ordenado.';
const truncatedEarly = formatReviewComment(earlyPeriodText);
console.log('Truncated early period:', truncatedEarly);
assert.strictEqual(truncatedEarly, 'Quedó perfecto...');

// Text ending with period that has no remaining text should truncate at word boundary rather than chopping 1 char
const singleSentenceLong =
  'Un trabajo excelente en la puerta de mi casa con una rapidez asombrosa y garantia escrita de tres meses que da mucha tranquilidad para viajar.';
const truncatedSingle = formatReviewComment(singleSentenceLong, 130);
console.log('Truncated single sentence:', truncatedSingle);
assert(truncatedSingle.endsWith('...'));
assert(!truncatedSingle.endsWith('....'));

// Text without period should truncate cleanly at word boundary
const noPeriodLong =
  'Vino Agustin y la verdad que un genio total me dejo el techo como nuevo nunca pense que iba a quedar tan bien y rapido super recomendable para todos los usuarios de 307';
const truncatedNoPeriod = formatReviewComment(noPeriodLong, 100);
console.log('Truncated without period:', truncatedNoPeriod);
assert(truncatedNoPeriod.endsWith('...'));
assert(truncatedNoPeriod.length <= 104);

// 2. Test empty comment rule
const emptyCommentReview = {
  authorName: 'Carlos M.',
  rating: 5,
  comment: '',
};
const undefinedCommentReview = {
  authorName: 'Pablo S.',
  rating: 4,
};
const lowRatingNoComment = {
  authorName: 'Bad User',
  rating: 3,
  comment: '',
};
const lowRatingWithComment = {
  authorName: 'Bad User 2',
  rating: 2,
  comment: 'Malo',
};

assert.strictEqual(isValidReview(emptyCommentReview), true, 'Rating 5 with empty comment should be valid');
assert.strictEqual(isValidReview(undefinedCommentReview), true, 'Rating 4 with undefined comment should be valid');
assert.strictEqual(isValidReview(lowRatingNoComment), false, 'Rating 3 without comment should be invalid');
assert.strictEqual(isValidReview(lowRatingWithComment), false, 'Rating 2 with comment should be invalid');

// 3. Test getActiveReviews pool, GMB phasing out and deduplication
const defaultActive = getActiveReviews();
assert.strictEqual(defaultActive.length, 8, 'Default should have 8 reviews');
assert.strictEqual(defaultActive[7].authorName, 'Facundo Romero');
assert(defaultActive[7].comment?.endsWith('...'), 'Facundo comment should be truncated');

// GMB additions + deduplication (GMB replaces initial review with same authorName)
const incomingGmb = [
  { authorName: 'GMB User 1', rating: 5, comment: 'Excelente' },
  { authorName: 'GMB User 2', rating: 5 }, // No comment, 5 stars
  { authorName: 'Gonzalo P.', rating: 5, comment: 'Actualicé mi reseña de GMB' }, // Same name as initial!
  { authorName: 'GMB User 3 (spam)', rating: 2, comment: 'Falso' }, // Invalid!
];
const mergedWithGmb = getActiveReviews(incomingGmb);
assert.strictEqual(mergedWithGmb.length, 10, 'Total should be capped at 10');
assert.strictEqual(mergedWithGmb[0].authorName, 'GMB User 1', 'GMB review should take slot 0');
assert.strictEqual(mergedWithGmb[0].isGmb, true);
assert.strictEqual(mergedWithGmb[1].authorName, 'GMB User 2', 'GMB review without comment should take slot 1');
assert.strictEqual(mergedWithGmb[1].comment, '');
assert.strictEqual(mergedWithGmb[2].authorName, 'Gonzalo P.', 'GMB version of Gonzalo P. should be present');
assert.strictEqual(mergedWithGmb[2].comment, 'Actualicé mi reseña de GMB');
// Verify Gonzalo P. does NOT appear twice
const gonzaloCount = mergedWithGmb.filter((r) => r.authorName.toLowerCase() === 'gonzalo p.').length;
assert.strictEqual(gonzaloCount, 1, 'Gonzalo P. should not be duplicated');

// 12 incoming GMB reviews
const twelveGmb = Array.from({ length: 12 }, (_, i) => ({
  authorName: `GMB ${i}`,
  rating: 5,
  comment: `Comentario ${i}`,
}));
const capped = getActiveReviews(twelveGmb);
assert.strictEqual(capped.length, 10, 'Should be strictly capped at 10');
assert.strictEqual(capped[0].authorName, 'GMB 0');
assert.strictEqual(capped[9].authorName, 'GMB 9');

// Edge case: whitespace-only comment with rating 5
const whitespaceCommentReview = {
  authorName: 'Marcos R.',
  rating: 5,
  comment: '   ',
};
assert.strictEqual(isValidReview(whitespaceCommentReview), true, 'Whitespace comment with rating 5 should be valid');

// Edge case: missing authorName or non-string authorName
assert.strictEqual(isValidReview({ authorName: '', rating: 5 }), false, 'Empty author should be invalid');
assert.strictEqual(isValidReview({ authorName: '   ', rating: 5 }), false, 'Whitespace author should be invalid');
assert.strictEqual(isValidReview({ authorName: null, rating: 5 }), false, 'Null author should be invalid');

// Edge case: rating < 4 or rating > 5 or NaN
assert.strictEqual(isValidReview({ authorName: 'John', rating: 3.9 }), false, 'Rating 3.9 should be invalid');
assert.strictEqual(isValidReview({ authorName: 'John', rating: 0 }), false, 'Rating 0 should be invalid');
assert.strictEqual(isValidReview({ authorName: 'John', rating: 6 }), false, 'Rating 6 should be invalid');
assert.strictEqual(isValidReview({ authorName: 'John', rating: NaN }), false, 'Rating NaN should be invalid');

// Edge case: formatReviewComment with empty/undefined/whitespace
assert.strictEqual(formatReviewComment(''), '');
assert.strictEqual(formatReviewComment(undefined), '');
assert.strictEqual(formatReviewComment('   '), '');

console.log('All reviews unit tests PASSED successfully!');
