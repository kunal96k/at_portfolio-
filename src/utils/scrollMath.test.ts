import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePortraitChoreography,
  computeStackedCardTransform,
  validateContactForm,
  validateNewsletterEmail,
  parseRoute,
  formatCounterValue,
} from './scrollMath';

test('stacked card transform keeps active card at full scale and scales covered cards down smoothly', () => {
  // At scroll start, card 0 is full scale and undimmed
  const startCard0 = computeStackedCardTransform(0, 0, 4);
  assert.equal(startCard0.scale, 1);
  assert.equal(startCard0.y, 0);
  assert.equal(startCard0.dimOpacity, 0);

  // Once card 1 has covered card 0 (progress = 1/3), card 0 scales down to ~0.92
  const coveredCard0 = computeStackedCardTransform(1 / 3, 0, 4);
  assert.ok(coveredCard0.scale < 0.93 && coveredCard0.scale > 0.91);
  assert.ok(coveredCard0.y < 0);
  assert.ok(coveredCard0.dimOpacity > 0.2);

  // At progress = 1/3, card 1 is now the active front card at full scale
  const activeCard1 = computeStackedCardTransform(1 / 3, 1, 4);
  assert.equal(activeCard1.scale, 1);
  assert.equal(activeCard1.dimOpacity, 0);

  // Last card never scales down at any scroll progress
  const lastCardEnd = computeStackedCardTransform(1, 3, 4);
  assert.equal(lastCardEnd.scale, 1);
  assert.equal(lastCardEnd.y, 0);
  assert.equal(lastCardEnd.dimOpacity, 0);
});

test('portrait choreography starts centered with front view and visible Hi badge at progress 0', () => {
  const state = computePortraitChoreography(0);
  assert.equal(state.translateXPercent, 0);
  assert.equal(state.rotateY, 0);
  assert.equal(state.rotateZ, 0);
  assert.equal(state.hiOpacity, 1);
});

test('portrait choreography shifts right, flips 180deg to back view, and hides Hi badge in Services phase', () => {
  const state = computePortraitChoreography(0.5);
  assert.equal(state.translateXPercent, 100);
  assert.equal(state.rotateY, 180);
  assert.ok(state.rotateZ > 5 && state.rotateZ <= 7);
  assert.equal(state.hiOpacity, 0);
});

test('portrait choreography flips 360deg back to front view in About Me phase', () => {
  const state = computePortraitChoreography(1);
  assert.equal(state.translateXPercent, 100);
  assert.equal(state.rotateY, 360);
  assert.ok(state.rotateZ > 3 && state.rotateZ < 5);
  assert.equal(state.hiOpacity, 0);
});

test('contact form validation catches empty and invalid fields', () => {
  const emptyErrors = validateContactForm({
    name: '',
    email: 'invalid-email',
    service: '',
    message: 'hi',
  });
  assert.ok(emptyErrors.name);
  assert.ok(emptyErrors.email);
  assert.ok(emptyErrors.service);
  assert.ok(emptyErrors.message);

  const validErrors = validateContactForm({
    name: 'John Smith',
    email: 'john@example.com',
    service: 'UI / UX',
    message: 'Looking for a complete brand and web redesign.',
  });
  assert.deepEqual(validErrors, {});
});

test('newsletter email validation rejects bad emails and accepts valid ones', () => {
  assert.ok(validateNewsletterEmail(''));
  assert.ok(validateNewsletterEmail('not-an-email'));
  assert.equal(validateNewsletterEmail('jane@framer.com'), null);
});

test('route parser resolves all Portavia routes cleanly', () => {
  assert.deepEqual(parseRoute('/'), { page: 'home' });
  assert.deepEqual(parseRoute('/about/'), { page: 'about' });
  assert.deepEqual(parseRoute('/upcoming-training'), { page: 'upcoming-training' });
  assert.deepEqual(parseRoute('/it-services'), { page: 'it-services' });
  assert.deepEqual(parseRoute('/resources'), { page: 'resources' });
  assert.deepEqual(parseRoute('/testimonials'), { page: 'testimonials' });
  assert.deepEqual(parseRoute('/gallery'), { page: 'gallery' });
  assert.deepEqual(parseRoute('/projects'), { page: 'projects' });
  assert.deepEqual(parseRoute('/projects/summer-vibes-festival-campaign'), {
    page: 'project-detail',
    slug: 'summer-vibes-festival-campaign',
  });
  assert.deepEqual(parseRoute('/blogs'), { page: 'blogs' });
  assert.deepEqual(parseRoute('/blogs/5-design-trends-that-will-define-2024'), {
    page: 'blog-detail',
    slug: '5-design-trends-that-will-define-2024',
  });
  assert.deepEqual(parseRoute('/unknown'), { page: 'home' });
});

test('counter value formats and clamps cleanly', () => {
  assert.equal(formatCounterValue(12.4, 12, ''), '12');
  assert.equal(formatCounterValue(50, 50, '+'), '50+');
  assert.equal(formatCounterValue(98, 98, '%'), '98%');
  assert.equal(formatCounterValue(-5, 200, '%'), '0%');
});
