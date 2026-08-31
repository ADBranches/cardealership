# Sprint 7 Admin Chat UI Validation

## Scope

This record validates the admin chat inbox across desktop, tablet, and mobile layouts, including keyboard operation, screen-reader semantics, long content, loading states, connection failures, and recovery controls.

## Validated widths

- Desktop: 1440 px and 1024 px
- Tablet: 768 px
- Mobile: 390 px and 320 px

The tablet layout retains two columns above 760 px. At 760 px and below, the interface changes to a list-or-thread mobile workflow.

## State validation

- No conversations: a labeled empty state remains available.
- Initial loading: the conversation panel remains labeled and exposes `aria-busy`.
- History loading: the message log exposes its busy state and a polite loading status.
- API failure: conversation and history failures expose clear Retry controls.
- Disconnected state: the connection banner explains that sending is paused.
- Reconnecting state: the banner announces automatic recovery behavior.
- Message-send failure: failed replies expose a keyboard-accessible Try again control.

## Content resilience

- Long customer and vehicle names are constrained without expanding the layout.
- Message text uses `overflow-wrap: anywhere` and `word-break: break-word`.
- High unread counts remain contained within bounded badges.
- Panels use `min-width: 0` to prevent grid and flex overflow.

## Keyboard and assistive technology

- Interactive controls retain visible focus treatment.
- Mobile conversation selection transfers focus to the thread heading.
- Returning from a thread transfers focus to the conversation list.
- Incoming message additions are announced through a polite `role="log"` region.
- Loading, connection, validation, and failure states use status or alert semantics.
- Programmatic focus targets use `tabIndex={-1}` and do not alter the normal Tab sequence.

## Mobile usability

- Mobile controls use a minimum 44-pixel touch target where practical.
- The composer stacks vertically on narrow screens.
- The message history contains overscroll behavior and dynamic viewport sizing.
- A visible Back control returns users from the thread to the conversation list.

## Motion

Reduced-motion media queries minimize nonessential transitions. The inbox and unread badge do not flash, blink, or continuously animate.

## Validation commands

```bash
npm run test:admin-chat-accessibility
npm run test:admin-chat-state
npm run test:unread-chat-badge
npm run test:admin-reply-workflow
npm run test:typing-indicator
npm run test:chat-security
npm run build
```

The manual suite uses source inspection and synthetic data. Browser-assisted review at the listed widths remains required before production release.
