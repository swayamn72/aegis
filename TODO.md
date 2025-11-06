# Task: Replace hardcoded 'http://localhost:5000' URLs with API_BASE_URL in ChatPage.jsx

## Steps to Complete:
- [ ] Identify all hardcoded 'http://localhost:5000' instances in ChatPage.jsx
- [ ] Replace each hardcoded URL with API_BASE_URL variable
- [ ] Verify all fetch calls now use the configurable API_BASE_URL

## Files to Edit:
- client/src/pages/ChatPage.jsx

## Notes:
- API_BASE_URL is already defined as: const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
- This change improves configurability for different environments (dev, staging, prod)
