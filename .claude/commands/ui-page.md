Scaffold a new page component with routing integration for NexusHub.

## Instructions

Follow existing page patterns in `client/src/pages/`:
- Protected route (requires JWT auth, redirect to login if unauthenticated)
- Dark theme: `bg-gray-900` background, `bg-gray-800` cards, blue accents
- Responsive grid layout
- Include navigation/sidebar consistent with existing pages (Dashboard, Admin)
- Fetch data from the API using the existing auth token pattern

## Page Details

**Name:** $ARGUMENTS

## Steps
1. Create the page component in `client/src/pages/`
2. Add the route in the app's router configuration
3. Add navigation link in the sidebar/nav if appropriate
4. Include data fetching with loading/error states
5. Follow the responsive grid pattern used in Dashboard.jsx
