# TODO: Implement Login with Session Management and Navbar Updates

## Tasks:
- [x] Create AuthContext.jsx: Implement React context for global auth state management
- [x] Add Login Route (Backend): Add POST /login route in server/routes/player.routes.js
- [x] Update AegisLogin.jsx: Replace mock login with real API call and auth context update
- [x] Update Navbar.jsx: Conditionally render profile logo instead of login/signup buttons
- [x] Update App.jsx: Wrap app with AuthContext provider

## Followup:
- [ ] Test login flow: Signup user, login, verify navbar updates
- [ ] Test logout: Ensure session ends and navbar reverts
- [ ] Handle edge cases: Invalid credentials, errors, token expiration
