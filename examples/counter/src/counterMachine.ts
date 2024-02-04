import { assign, createMachine, not } from 'xstate';
import { NOTEBOOK_SHORTCUTS_LOOKUP, isMac } from './constant';

const {
  RUN_CELL_AND_ADVANCE,
  RUN_THIS_CELL_ONLY,
  RUN_ALL_CELLS,
  ADD_CELL_ABOVE,
  ADD_CELL_BELOW,
  MOVE_CELL_UP,
  MOVE_CELL_DOWN,
  GO_TO_NEXT_CELL,
  GO_TO_PREVIOUS_CELL,
  SEARCH_OR_REPLACE_THIS_CELL_EDITOR,
  ENTER_SELECTED_CELL,
  EXIT_SELECTED_CELL,
  DELETE_SELECTED_CELL,
  CONVERT_TO_MARKDOWN_CELL,
  CONVERT_TO_PYTHON_OR_SQL_CELL,
  SHOW_KEYBOARD_SHORTCUTS
} = Object.values(NOTEBOOK_SHORTCUTS_LOOKUP).reduce(
  (acc, { eventName, actions }) => ({
    ...acc,
    [eventName]: { actions }
  }),
  {}
);

const cells = new Array(10)
  .fill(0)
  .map((_, index) => ({ content: `Cell ${index}` }));

export const machine = createMachine(
  {
    id: 'NotebookKeyboardShortcuts',
    initial: 'command',
    context: {
      isMac: isMac,
      cells,
      selectedIndex: cells.length ? 0 : -1,
      // should be cell state instead of machine
      focusIndex: -1,
      // should be cell state instead of machine
      runIndex: -1
    },
    states: {
      command: {
        initial: 'zero',
        always: [
          { guard: not('hasCells'), target: '.zero' },
          { guard: 'hasOneCell', target: '.one' },
          { target: '.many' }
        ],
        states: {
          zero: {
            on: {
              ADD_CELL_BELOW: {
                actions: ['ADD_CELL_BELOW', 'GO_TO_NEXT_CELL']
              }
            }
          },
          one: {
            on: {
              RUN_CELL_AND_ADVANCE: {
                actions: ['RUN_THIS_CELL_ONLY', 'GO_TO_NEXT_CELL']
              },
              RUN_THIS_CELL_ONLY,
              RUN_ALL_CELLS,
              DELETE_SELECTED_CELL: {
                target: 'zero',
                actions: ['DELETE_SELECTED_CELL', 'RESET']
              },
              ENTER_SELECTED_CELL: {
                target: '#NotebookKeyboardShortcuts.edit',
                guard: 'hasCells',
                actions: ['ENTER_SELECTED_CELL']
              },
              CONVERT_TO_MARKDOWN_CELL,
              CONVERT_TO_PYTHON_OR_SQL_CELL
            }
          },
          many: {
            initial: 'first',
            always: [
              { guard: 'isFirstCell', target: '.first' },
              { guard: 'isLastCell', target: '.last' },
              { target: '.intermediate' }
            ],
            states: {
              first: {
                on: {
                  GO_TO_NEXT_CELL,
                  MOVE_CELL_DOWN
                }
              },
              intermediate: {
                on: {
                  GO_TO_NEXT_CELL,
                  GO_TO_PREVIOUS_CELL,
                  MOVE_CELL_DOWN,
                  MOVE_CELL_UP
                }
              },
              last: {
                on: {
                  GO_TO_PREVIOUS_CELL,
                  MOVE_CELL_UP,
                  RUN_CELL_AND_ADVANCE: {
                    actions: [
                      'RUN_THIS_CELL_ONLY',
                      'ADD_CELL_BELOW',
                      'GO_TO_NEXT_CELL'
                    ]
                  },
                  RUN_THIS_CELL_ONLY
                }
              }
            },
            on: {
              RUN_THIS_CELL_ONLY,
              RUN_CELL_AND_ADVANCE: {
                actions: ['RUN_THIS_CELL_ONLY', 'GO_TO_NEXT_CELL']
              },
              RUN_ALL_CELLS,
              CONVERT_TO_MARKDOWN_CELL,
              CONVERT_TO_PYTHON_OR_SQL_CELL,
              ENTER_SELECTED_CELL: {
                target: '#NotebookKeyboardShortcuts.edit',
                guard: 'hasCells',
                actions: ['ENTER_SELECTED_CELL']
              },
              DELETE_SELECTED_CELL: [
                {
                  target: '#NotebookKeyboardShortcuts.command.zero',
                  guard: 'hasOneCell',
                  actions: ['DELETE_SELECTED_CELL', 'RESET']
                },
                {
                  target: '#NotebookKeyboardShortcuts.command.one',
                  guard: 'hasTwoCells',
                  actions: ['DELETE_SELECTED_CELL', 'GO_TO_NEXT_CELL']
                },
                {
                  guard: 'isLastCell',
                  actions: ['DELETE_SELECTED_CELL', 'GO_TO_PREVIOUS_CELL']
                },
                { actions: ['DELETE_SELECTED_CELL'] }
              ]
            }
          }
        },
        on: {
          ADD_CELL_ABOVE: {
            actions: ['ADD_CELL_ABOVE', 'GO_TO_NEXT_CELL']
          },
          ADD_CELL_BELOW
        }
      },
      edit: {
        initial: 'first',
        always: [
          { guard: 'isFirstCell', target: '.first' },
          { guard: 'isLastCell', target: '.last' },
          { target: '.intermediate' }
        ],
        states: {
          first: {
            on: {
              RUN_CELL_AND_ADVANCE: {
                actions: [
                  'RUN_THIS_CELL_ONLY',
                  'GO_TO_NEXT_CELL',
                  'ENTER_SELECTED_CELL'
                ]
              }
            }
          },
          intermediate: {
            on: {
              RUN_CELL_AND_ADVANCE: {
                actions: [
                  'RUN_THIS_CELL_ONLY',
                  'GO_TO_NEXT_CELL',
                  'ENTER_SELECTED_CELL'
                ]
              }
            }
          },
          last: {
            on: {
              RUN_CELL_AND_ADVANCE: {
                actions: [
                  'RUN_THIS_CELL_ONLY',
                  'ADD_CELL_BELOW',
                  'GO_TO_NEXT_CELL',
                  'ENTER_SELECTED_CELL'
                ]
              }
            }
          }
        },
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
            .concat({ content: `Cell ${Date.now()}` })
            .concat(cells.slice(selectedIndex))
      }),
      ADD_CELL_BELOW: assign({
        cells: ({ context: { cells, selectedIndex } }) =>
          cells
            .slice(0, selectedIndex + 1)
            .concat({ content: `Cell ${Date.now()}` })
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
      },
      RESET: assign({
        focusIndex: () => -1,
        selectedIndex: () => -1,
        runIndex: () => -1
      })
    },
    guards: {
      isFirstCell: ({ context: { selectedIndex } }) => selectedIndex === 0,
      isLastCell: ({ context: { selectedIndex, cells } }) =>
        selectedIndex === cells.length - 1,
      hasCells: ({ context: { cells } }) => cells.length > 0,
      hasOneCell: ({ context: { cells } }) => cells.length === 1,
      hasTwoCells: ({ context: { cells } }) => cells.length === 2
    }
  }
);
