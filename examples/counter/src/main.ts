import { __unsafe_getAllOwnEventDescriptors, createActor } from 'xstate';
import { NOTEBOOK_SHORTCUTS_LOOKUP } from './constant';
import { machine } from './counterMachine';
import { getKeyHashFromEvent } from './util';

document.querySelector<HTMLDivElement>('#app').innerHTML = `
<div class="container">
  <div class="control">
  <h2 id="machine-name">TestMachine</h2>
  <h3>State value</h3>
  <h3><code id="state"></code></h3>
  <div id="events-container">
    <h3 id="events-title">EVENTS</h3>
    <div id="events"></div>
    <p id="no-events-text">No events to send</p>
  </div>
  <h3>Context</h3>
  <code><pre id="context"></pre></code>
</div>
<div class="output">
  <output id="output"></output>
</div>
`;
const actor = createActor(machine);
(window as any).actor = actor;
actor.subscribe((state) => {
  const stateValueString = state._nodes
    .filter((s) => s.type === 'atomic' || s.type === 'final')
    .map((s) => s.id)
    .join(', ')
    .split('.')
    .slice(1)
    .join('.');
  // Machine State value
  document.querySelector<HTMLPreElement>('#state').outerHTML =
    `<code id="state">${stateValueString}</code>`;

  // Machine context
  document.querySelector('#context').innerHTML = JSON.stringify(
    state.context ?? {},
    null,
    2
  );

  const nextEvents = __unsafe_getAllOwnEventDescriptors(state);

  console.log(
    `%cState value:%c ${state.value}`,
    'background-color: #056dff',
    'background-color: none'
  );
  console.log(
    `%cState:%c ${JSON.stringify(state, null, 2)}`,
    'background-color: #056dff',
    'background-color: none'
  );
  console.log(
    `%cNext events:%c ${nextEvents.map((eventType, i) =>
      i > 0 ? ' ' + eventType : eventType
    )}`,
    'background-color: #056dff',
    'background-color: none'
  );

  // create a button for each state event
  const eventsList = document.querySelector<HTMLUListElement>('#events');
  eventsList.innerHTML = '';
  nextEvents.forEach((eventType) => {
    if (eventType.startsWith('xstate.')) return;
    const button = document.createElement('button');
    if (!state.can({ type: eventType })) {
      button.disabled = true;
    }
    button.innerText = eventType;
    button.onclick = () => {
      actor.send({ type: eventType });
    };
    eventsList.appendChild(button);
    return button;
  });

  if (nextEvents.length === 0) {
    document.querySelector('#no-events-text').classList.add('show');
  }
});
actor.start();

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
    <ul tabindex="0">
      ${cells
        .map(
          (cell, index) => `
        <li tabindex="0" class="${index === selectedIndex ? 'selected' : ''} ${
          index === focusIndex ? 'focused' : ''
        } ${index === runIndex ? 'ran' : ''}">
          ${cell.content}
        </li>
      `
        )
        .join('')}
    </ul>
  `);
});

actor.send({ type: 'EXIT_SELECTED_CELL' });

function handleKeyDown(event: KeyboardEvent) {
  const eventKeyHash = getKeyHashFromEvent(event);
  if (NOTEBOOK_SHORTCUTS_LOOKUP[eventKeyHash]) {
    const { eventName } = NOTEBOOK_SHORTCUTS_LOOKUP[eventKeyHash];
    event.preventDefault();
    actor.send({ type: eventName });
  }
}

document.body.addEventListener('keydown', handleKeyDown);
