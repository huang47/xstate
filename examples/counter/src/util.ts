export const getKeyHash = ({ meta, ctrl, shift, alt, key }) => {
  const m = meta ? 'Meta' : '';
  const c = ctrl ? 'Ctrl' : '';
  const s = shift ? 'Shift' : '';
  const a = alt ? 'Alt' : '';
  return `${m}${c}${s}${a}${key}`;
};

export const getKeysHash = (shortcutKeys) => {
  return shortcutKeys.map(getKeyHash).join(',');
};

export const getKeyHashFromEvent = (event: KeyboardEvent) => {
  const { metaKey, ctrlKey, shiftKey, altKey, key } = event;
  return getKeyHash({
    meta: metaKey,
    ctrl: ctrlKey,
    shift: shiftKey,
    alt: altKey,
    key
  });
};
