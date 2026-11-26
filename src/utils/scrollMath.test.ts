import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePortraitChoreography,
  computeTabletChoreography,
  shouldSwapTabletFrontToAbout,
  computeStageHorizontalShift,
  computeMobileHeroPortraitTransform,
  computeMobileFlipTransform,
  getScrollRevealConfig,
  computeStackedCardTransform,
  containsDangerousMarkup,
  isValidPhone,
  sanitizePhoneInput,
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

test('tablet md choreography completes shifts and flips earlier and swaps front face away from Hero portrait for About Me', () => {
  const start = computeTabletChoreography(0);
  assert.equal(start.rotateY, 0);
  assert.equal(shouldSwapTabletFrontToAbout(0), false);

  // Already fully shifted and flipped to 180deg by progress 0.36
  const expertise = computeTabletChoreography(0.36);
  assert.equal(expertise.translateXPercent, 100);
  assert.equal(expertise.rotateY, 180);
  assert.equal(expertise.hiOpacity, 0);

  // Swaps hidden front face once safely flipped to back face
  assert.equal(shouldSwapTabletFrontToAbout(0.48), true);

  // Completes second flip cleanly by progress 0.80
  const about = computeTabletChoreography(0.8);
  assert.equal(about.rotateY, 360);
});

test('stage horizontal shift adapts cleanly across mobile, md tablet, and lg desktop widths', () => {
  assert.equal(computeStageHorizontalShift(390), 0);
  const tabletShift = computeStageHorizontalShift(768);
  assert.ok(tabletShift >= 195 && tabletShift <= 215);
  const desktopShift = computeStageHorizontalShift(1440);
  assert.equal(desktopShift, Math.round(1120 * 0.275));
});

test('mobile scroll flip transforms rotate smoothly and complete early while visibly in viewport', () => {
  const expStart = computeMobileFlipTransform(0, 'front-to-back');
  assert.equal(expStart.rotateY, 0);
  const expMid = computeMobileFlipTransform(0.25, 'front-to-back');
  assert.ok(expMid.rotateY > 70 && expMid.rotateY < 110);
  assert.ok(expMid.scale < 1);
  // Completes 180deg flip cleanly by mid-viewport (0.45) rather than lagging off-screen
  const expDone = computeMobileFlipTransform(0.45, 'front-to-back');
  assert.equal(expDone.rotateY, 180);

  const aboutStart = computeMobileFlipTransform(0, 'back-to-front');
  assert.equal(aboutStart.rotateY, 180);
  const aboutDone = computeMobileFlipTransform(0.45, 'back-to-front');
  assert.equal(aboutDone.rotateY, 360);

  const heroTilt = computeMobileHeroPortraitTransform(0.6);
  assert.ok(heroTilt.rotateY > 10 && heroTilt.hiOpacity === 0);
});

test('responsive scroll reveal config triggers early on sm/md and preserves lg desktop defaults', () => {
  const smConfig = getScrollRevealConfig(390, 0.25, 0.6);
  assert.equal(smConfig.isCompactViewport, true);
  assert.equal(smConfig.viewport.amount, 0.02);
  assert.equal(smConfig.viewport.margin, '80px 0px 80px 0px');
  assert.ok(smConfig.duration <= 0.4);

  const mdConfig = getScrollRevealConfig(768, 0.25, 0.6);
  assert.equal(mdConfig.isCompactViewport, true);

  const lgConfig = getScrollRevealConfig(1280, 0.25, 0.6);
  assert.equal(lgConfig.isCompactViewport, false);
  assert.equal(lgConfig.viewport.amount, 0.25);
  assert.equal(lgConfig.viewport.margin, undefined);
  assert.equal(lgConfig.duration, 0.6);
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

test('phone validation enforces 7 to 15 digits max and XSS protection rejects markup', () => {
  assert.equal(isValidPhone('+91 88888 29652'), true);
  assert.equal(isValidPhone('+123456789012345'), true);
  assert.equal(isValidPhone('1234567890123456'), false);
  assert.equal(isValidPhone('123456'), false);
  assert.equal(sanitizePhoneInput('+91abc987654321012345'), '+919876543210123');
  assert.equal(containsDangerousMarkup('<script>alert(1)</script>'), true);
  assert.equal(containsDangerousMarkup('Normal text input'), false);

  const xssErrors = validateContactForm({
    name: '<script>x</script>',
    email: 'valid@domain.com',
    phone: '1234567890123456',
    service: 'Red Hat',
    message: 'Valid length inquiry message.',
  });
  assert.ok(xssErrors.name);
  assert.ok(xssErrors.phone);
});

test('route parser resolves all Portavia routes cleanly', () => {
  assert.deepEqual(parseRoute('/'), { page: 'home' });
  assert.deepEqual(parseRoute('/about/'), { page: 'about' });
  assert.deepEqual(parseRoute('/upcoming-batches'), { page: 'upcoming-batches' });
  assert.deepEqual(parseRoute('/upcoming-training'), { page: 'upcoming-batches' });
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
  assert.deepEqual(parseRoute('/unknown'), { page: 'not-found' });
});

test('counter value formats and clamps cleanly', () => {
  assert.equal(formatCounterValue(12.4, 12, ''), '12');
  assert.equal(formatCounterValue(50, 50, '+'), '50+');
  assert.equal(formatCounterValue(98, 98, '%'), '98%');
  assert.equal(formatCounterValue(-5, 200, '%'), '0%');
});
