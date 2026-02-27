Review the specified React component for UI/UX issues in the NexusHub project.

## Review the following component

**Target:** $ARGUMENTS

## Review Checklist

### Accessibility
- Proper ARIA labels and roles
- Keyboard navigation support
- Color contrast (especially with dark theme)
- Screen reader compatibility
- Focus management for modals/dialogs

### Responsiveness
- Mobile-first breakpoints (`sm:`, `md:`, `lg:`)
- No horizontal overflow on small screens
- Touch-friendly tap targets (min 44px)
- Proper grid/flex wrapping

### Tailwind Best Practices
- No redundant or conflicting utility classes
- Consistent spacing scale usage
- Proper use of dark theme colors (`gray-900`, `gray-800`, `blue-500/600`)
- No inline styles where Tailwind classes exist

### Design Consistency
- Matches project's dark theme palette
- Consistent with other components in `client/src/components/`
- Proper loading and error state handling
- Consistent button styles, form inputs, and card layouts

Provide specific file:line references and concrete fix suggestions for each issue found.
