import { assign, createMachine, enqueueActions, not } from 'xstate';
import { NOTEBOOK_SHORTCUTS_LOOKUP, isMac } from './constant';

const {
  EXIT_SELECTED_CELL,
  SEARCH_OR_REPLACE_THIS_CELL_EDITOR,
  ...commandModeEvents
} = Object.values(NOTEBOOK_SHORTCUTS_LOOKUP).reduce(
  (acc, { eventName, actions }) => ({
    ...acc,
    [eventName]: { actions }
  }),
  {}
);

const overrideCommandModeEvents = {
  ...commandModeEvents,
  RUN_CELL_AND_ADVANCE: {
    actions: enqueueActions(({ enqueue, check }) => {
      enqueue('RUN_THIS_CELL_ONLY');
      if (check(not({ type: 'isNotLastCell' }))) {
        enqueue('ADD_CELL_BELOW');
      }
      enqueue('GO_TO_NEXT_CELL');
      if (check({ type: 'isEdit' })) {
        enqueue('ENTER_SELECTED_CELL');
      }
    })
  },
  DELETE_SELECTED_CELL: {
    actions: enqueueActions(({ enqueue, check }) => {
      enqueue('DELETE_SELECTED_CELL');
      if (check(not({ type: 'isNotLastCell' }))) {
        enqueue('GO_TO_PREVIOUS_CELL');
      }
    })
  },
  ADD_CELL_ABOVE: {
    actions: ['ADD_CELL_ABOVE', 'GO_TO_NEXT_CELL']
  },
  MOVE_CELL_UP: {
    guard: 'isNotFirstCell',
    actions: ['MOVE_CELL_UP', 'GO_TO_PREVIOUS_CELL']
  },
  MOVE_CELL_DOWN: {
    guard: 'isNotLastCell',
    actions: ['MOVE_CELL_DOWN', 'GO_TO_NEXT_CELL']
  },
  ENTER_SELECTED_CELL: {
    target: 'edit',
    actions: ['ENTER_SELECTED_CELL']
  }
};

const cells = new Array(10)
  .fill(0)
  .map((_, index) => ({ content: `Cell ${index}` }));

export default createMachine(
  {
    id: 'NotebookKeyboardShortcuts',
    initial: 'command',
    context: {
      isMac: isMac,
      cells,
      selectedIndex: 0,
      // should be cell state instead of machine
      focusIndex: -1,
      // should be cell state instead of machine
      runIndex: -1
    },
    states: {
      command: {
        on: {
          ...overrideCommandModeEvents
        }
      },
      edit: {
        on: {
          EXIT_SELECTED_CELL: {
            target: 'command',
            actions: ['EXIT_SELECTED_CELL']
          },
          SEARCH_OR_REPLACE_THIS_CELL_EDITOR: {
            actions: ['SEARCH_OR_REPLACE_THIS_CELL_EDITOR']
          }
        }
      }
    }
    // Define actions here, such as `runAllCells` to implement the logic for running all cells
  },
  {
    actions: {
      GO_TO_NEXT_CELL: assign({
        selectedIndex: ({ context: { selectedIndex, cells } }) =>
          Math.max(Math.min(selectedIndex + 1, cells.length - 1), 0)
      }),
      GO_TO_PREVIOUS_CELL: assign({
        selectedIndex: ({ context }) => Math.max(context.selectedIndex - 1, 0)
      }),
      RUN_THIS_CELL_ONLY: assign({
        runIndex: ({ context }) => context.selectedIndex
      }),
      ENTER_SELECTED_CELL: assign({
        focusIndex: ({ context }) => context.selectedIndex
      }),
      EXIT_SELECTED_CELL: assign({
        focusIndex: ({ context }) => -1
      }),
      MOVE_CELL_UP: assign({
        cells: ({ context: { cells, selectedIndex } }) => {
          [cells[selectedIndex], cells[selectedIndex - 1]] = [
            cells[selectedIndex - 1],
            cells[selectedIndex]
          ];
          return cells;
        }
      }),
      MOVE_CELL_DOWN: assign({
        cells: ({ context: { cells, selectedIndex } }) => {
          [cells[selectedIndex], cells[selectedIndex + 1]] = [
            cells[selectedIndex + 1],
            cells[selectedIndex]
          ];
          return cells;
        }
      }),
      ADD_CELL_ABOVE: assign({
        cells: ({ context: { cells, selectedIndex } }) =>
          cells
            .slice(0, selectedIndex)
            .concat(
              cells[selectedIndex] || { content: `Cell ${selectedIndex}` }
            )
            .concat(cells.slice(selectedIndex))
      }),
      ADD_CELL_BELOW: assign({
        cells: ({ context: { cells, selectedIndex } }) =>
          cells
            .slice(0, selectedIndex + 1)
            .concat(
              cells[selectedIndex] || { content: `Cell ${selectedIndex}` }
            )
            .concat(cells.slice(selectedIndex + 1))
      }),
      DELETE_SELECTED_CELL: assign({
        cells: ({ context: { cells, selectedIndex } }) =>
          cells.slice(0, selectedIndex).concat(cells.slice(selectedIndex + 1))
      }),
      SHOW_KEYBOARD_SHORTCUTS: () => {
        alert('Show keyboard shortcuts');
      },
      SEARCH_OR_REPLACE_THIS_CELL_EDITOR: () => {
        alert('search');
      }
    },
    guards: {
      isNotFirstCell: ({ context: { selectedIndex } }) => selectedIndex > 0,
      isNotLastCell: ({ context: { selectedIndex, cells } }) =>
        selectedIndex < cells.length - 1,
      isEdit: ({ context: { selectedIndex, focusIndex } }) =>
        selectedIndex === focusIndex
    }
  }
);
