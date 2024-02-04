import { createBrowserInspector } from '@statelyai/inspect';
import './style.css';

import { createActor } from 'xstate';
import { NOTEBOOK_SHORTCUTS_LOOKUP } from './constant';
import counterMachine from './counterMachine';
import { getKeyHashFromEvent } from './util';

const { inspect } = createBrowserInspector();
const actor = createActor(counterMachine, { inspect });
actor.start();

function handleKeyDown(event: KeyboardEvent) {
  const eventKeyHash = getKeyHashFromEvent(event);
  if (NOTEBOOK_SHORTCUTS_LOOKUP[eventKeyHash]) {
    const { eventName } = NOTEBOOK_SHORTCUTS_LOOKUP[eventKeyHash];
    console.log(`attempt: sending ${eventName}`);
    event.preventDefault();
    actor.send({ type: eventName });
  }
}

document.body.addEventListener('keydown', handleKeyDown);

const outputEl = document.querySelector<HTMLDivElement>('#output')!;

function render(html: string): void {
  outputEl.innerHTML = html;
}

actor.subscribe((state) => {
  const {
    context: { selectedIndex, focusIndex, runIndex, cells },
    value
  } = state;
  render(`
    <div>
      <div class="card">
        <div>
          ${JSON.stringify(
            {
              selectedIndex,
              focusIndex,
              runIndex,
              numberOfCells: cells.length
            },
            null,
            2
          )}
        </div>
        <ul tabindex="0">
          ${cells
            .map(
              (cell, index) => `
            <li tabindex="0" class="${
              index === selectedIndex ? 'selected' : ''
            } ${index === focusIndex ? 'focused' : ''} ${
              index === runIndex ? 'ran' : ''
            }">
              ${cell.content}
            </li>
          `
            )
            .join('')}
        </ul>
      </div>
    </div>
  `);
});
