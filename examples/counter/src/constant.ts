import { getKeysHash } from './util';

export const isMac = true;

export const NOTEBOOK_SHORTCUTS = {
  runAll: {
    keys: [{ meta: isMac, ctrl: !isMac, shift: true, key: 'Enter' }],
    label: 'Run all cells'
  },
  runThisCellOnly: {
    keys: [{ meta: isMac, ctrl: !isMac, key: 'Enter' }],
    label: 'Run this cell only'
  },
  runCellAndAdvance: {
    keys: [{ shift: true, key: 'Enter' }],
    label: 'Run cell and advance'
  },
  addCellBelow: {
    keys: [{ key: 'b' }],
    label: 'Add cell below'
  },
  addCellAbove: {
    keys: [{ key: 'a' }],
    label: 'Add cell above'
  },
  moveCellUp: {
    keys: [{ ctrl: true, shift: true, key: 'ArrowUp' }],
    label: 'Move cell up'
  },
  moveCellDown: {
    keys: [{ ctrl: true, shift: true, key: 'ArrowDown' }],
    label: 'Move cell down'
  },
  goToNextCell: {
    keys: [{ key: 'j' }],
    label: 'Go to next cell'
  },
  goToPrevCell: {
    keys: [{ key: 'k' }],
    label: 'Go to previous cell'
  },
  nextLineOrCell: {
    keys: [{ key: 'ArrowDown' }],
    label: 'Go to next cell'
  },
  prevLineOrCell: {
    keys: [{ key: 'ArrowUp' }],
    label: 'Go to previous cell'
  },
  searchThisCell: {
    keys: [{ key: 'f', meta: isMac, ctrl: !isMac }],
    label: 'Search or replace this cell editor'
  },
  enterSelectedCellEditor: {
    keys: [{ key: 'Enter' }],
    label: 'Enter selected cell'
  },
  exitSelectedCellEditor: {
    keys: [{ key: 'Escape' }],
    label: 'Exit selected cell'
  },
  deleteCell: {
    keys: [{ key: 'd' }, { key: 'd' }],
    label: 'Delete selected cell'
  },
  deleteCellWithBackspace: {
    keys: [{ key: 'Backspace' }],
    label: 'Delete selected cell'
  },
  convertToMarkdown: {
    keys: [{ key: 'm' }],
    label: 'Convert to Markdown cell'
  },
  convertToCode: {
    keys: [{ key: 'y' }],
    label: 'Convert to Python or SQL cell'
  },
  showKeyboardShortcuts: {
    keys: [{ shift: true, key: '?' }],
    label: 'Show keyboard shortcuts'
  }
};
export const NOTEBOOK_SHORTCUTS_LOOKUP = Object.entries(
  NOTEBOOK_SHORTCUTS
).reduce((acc, [actionName, shortcut]) => {
  const eventName = shortcut.label.toUpperCase().split(' ').join('_');
  return {
    ...acc,
    [getKeysHash(shortcut.keys)]: {
      actions: [eventName],
      eventName
    }
  };
}, {});
