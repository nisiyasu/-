(() => {
  'use strict';
  const dataWebp = b64 => `data:image/webp;base64,${b64 || ''}`;
  const small = window.__LCC_SMALL || {};
  const pick = (direct, key) => direct || small[key] || '';
  window.LCC_ASSETS = Object.freeze({
    home: dataWebp(window.__LCC_HOME),
    save: dataWebp(window.__LCC_SAVE_HERO || window.__LCC_SAVE),
    diary: pick(window.__LCC_ICON_DIARY, 'icon_diary'),
    insight: pick(window.__LCC_ICON_INSIGHT, 'icon_insight'),
    rule: pick(window.__LCC_ICON_RULE, 'icon_rule'),
    other: pick(window.__LCC_ICON_OTHER, 'icon_other'),
    cardTexture: pick(window.__LCC_CARD_TEXTURE, 'card_texture'),
    brushLime: pick(window.__LCC_BRUSH_LIME, 'brush_lime')
  });
  const root = document.documentElement;
  if (window.LCC_ASSETS.cardTexture) root.style.setProperty('--card-texture', `url("${window.LCC_ASSETS.cardTexture}")`);
  if (window.LCC_ASSETS.brushLime) root.style.setProperty('--brush-lime', `url("${window.LCC_ASSETS.brushLime}")`);
  root.dataset.lccBuild = '20260807-v2-riot-neon';
})();
