# UI architecture

The application uses Tailwind CSS v4 and shadcn-style components backed by the Radix primitives that are actually required. Do not add a second UI framework (such as Material UI) or install a complete generated component collection.

The supported shared components are alert, badge, button, card, dialog, input, label, progress, select, skeleton, table and tabs, with `utils.ts` for class composition. Feature-specific components live in their existing feature directories. Keep interactive primitives keyboard accessible and provide labels, focus indication, reduced-motion support and responsive layouts.

Before introducing a new component or package, check whether an existing primitive meets the need. Add only its required dependency, document the feature that uses it, and validate the production build plus relevant accessibility and regression tests. Keep React and React DOM as runtime dependencies. Maintain the npm lockfile rather than deleting it to resolve dependency changes.
