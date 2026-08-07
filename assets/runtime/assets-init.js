(() => {
  'use strict';
  const dataWebp = b64 => `data:image/webp;base64,${b64 || ''}`;
  window.LCC_ASSETS = Object.freeze({
    home: dataWebp(window.__LCC_HOME),
    save: dataWebp(window.__LCC_SAVE_HERO),
    diary: window.__LCC_ICON_DIARY,
    insight: window.__LCC_ICON_INSIGHT,
    rule: window.__LCC_ICON_RULE,
    other: window.__LCC_ICON_OTHER,
    cardTexture: window.__LCC_CARD_TEXTURE,
    brushLime: window.__LCC_BRUSH_LIME
  });
  const root = document.documentElement;
  if (window.LCC_ASSETS.cardTexture) root.style.setProperty('--card-texture', `url("${window.LCC_ASSETS.cardTexture}")`);
  if (window.LCC_ASSETS.brushLime) root.style.setProperty('--brush-lime', `url("${window.LCC_ASSETS.brushLime}")`);
  root.dataset.lccBuild = '20260807-v1-riot-neon';
})();
