/**
 * Tests for assets/js.js
 * Run with Jest (testEnvironment: jsdom)
 */

jest.setTimeout(10000);

beforeEach(() => {
  jest.resetModules();
  // basic DOM structure matching index.html
  document.body.innerHTML = `
    <div id="fableCard">
      <h2 class="js-fable-title"></h2>
      <img class="js-fable-image" />
      <div class="js-fable-caption"></div>
      <div class="js-fable"></div>
      <div class="js-fable-comment"></div>
    </div>
    <button id="prevFable"></button>
    <button id="nextFable"></button>
  `;
  // ensure the script's init() runs immediately on require
  Object.defineProperty(document, 'readyState', { value: 'complete', configurable: true });
});

test('hides image and clears src when fable.image is null', async () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { title: 'T1', content: 'C1', image: null, imageAlt: null }
    ]
  });

  require('../assets/js.js');
  // click Next to trigger fetch and rendering of the first fable
  const next = document.getElementById('nextFable');
  next.click();
  await new Promise((r) => setTimeout(r, 20));

  const img = document.querySelector('.js-fable-image');
  expect(img).toBeTruthy();
  expect(img.style.display).toBe('none');
  expect(img.getAttribute('src')).toBeNull();
  expect(document.querySelector('.js-fable-title').textContent).toBe('T1');
  expect(document.querySelector('.js-fable').textContent).toContain('C1');
});

test('shows image and sets src/alt when image URL present', async () => {
  const url = 'https://example.org/Aesops_Fables-Rackham-1.jpg';
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { title: 'T2', content: 'C2', image: url, imageAlt: 'Rackham 1' }
    ]
  });

  require('../assets/js.js');
  const next = document.getElementById('nextFable');
  next.click();
  await new Promise((r) => setTimeout(r, 20));

  const img = document.querySelector('.js-fable-image');
  expect(img).toBeTruthy();
  expect(img.style.display === '' || img.style.display === 'inline' || img.style.display === 'block').toBe(true);
  expect(img.getAttribute('src')).toBe(url);
  expect(img.getAttribute('alt')).toBe('Rackham 1');
  expect(document.querySelector('.js-fable-title').textContent).toBe('T2');
  expect(document.querySelector('.js-fable').textContent).toContain('C2');
});
