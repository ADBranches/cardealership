# Sprint 7 Admin Chat UI Validation

## Scope

The responsive and accessibility review validates the protected admin inbox across desktop, tablet, mobile, and narrow-mobile layouts. It covers accessibility, long content, loading, empty, offline, reconnecting, API-error, and message-send failure states.

## Viewport matrix

- Desktop: 1440 by 900 and 1280 by 800.
- Tablet: 1024 by 768 and 768 by 1024.
- Mobile: 390 by 844 and 360 by 800.
- Narrow mobile: 320 by 568.

## Validation scenarios

1. No conversations.
2. Initial conversation loading.
3. History loading.
4. API failure with Retry action.
5. Socket disconnection with disabled sending.
6. Reconnecting state with recovery explanation.
7. Message-send failure with Try again action.
8. Very long customer name.
9. Very long vehicle name.
10. Long unbroken message text.
11. High unread count capped visually at 99+.
12. Keyboard navigation and visible focus.
13. Screen-reader announcement of incoming messages.
14. Mobile conversation selection and return-to-list behavior.

## Dependency status

The final shared backend chat contract is not yet available on the collaborator branch. Existing adapters and synthetic fixtures remain the temporary integration boundary. No production endpoint or payload was invented during this validation work.

## Manual procedure

1. Run the accessibility manual test.
2. Run all existing admin-chat tests.
3. Run the production build.
4. Inspect every listed viewport in browser responsive mode.
5. Navigate using Tab, Shift+Tab, Enter, and Space.
6. Verify status, alert, busy, and message-log announcements with a screen reader.
7. Simulate offline, reconnecting, API-failure, and send-failure states.
8. Confirm recovery actions are keyboard operable.

## Exit criteria

- Desktop, tablet, mobile, and narrow-mobile layouts remain usable.
- No content overlaps or becomes inaccessible.
- Keyboard focus and screen-reader affordances are present.
- Failure states provide recovery actions or clear recovery guidance.
- Manual chat validation passes.
- Existing chat tests pass.
- Production build passes.

## Integration follow-up

Before replacing mocks, collaborators must publish the final conversation-list, history, mark-read, socket-event, acknowledgement, failure, and reconnect contracts. Revalidate all fourteen scenarios after integration.
