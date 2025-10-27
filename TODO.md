# Recruitment System Implementation TODO

## Overview
Implement a new recruitment system by replacing AegisOpportunities.jsx with RecruitmentPage.jsx, allowing players to post LFT (Looking for Team) posts and teams to search for players. Integrate tryout chats in ChatPage.jsx as group chats that close after acceptance/rejection.

## Steps

### 1. Delete AegisOpportunities.jsx
- [x] Remove the file `client/src/components/AegisOpportunities.jsx` entirely.

### 2. Create RecruitmentPage.jsx
- [x] Create new component at `client/src/components/RecruitmentPage.jsx`.
- [x] Implement tabbed interface: "Post LFT" (for players) and "Find Players" (for teams).
- [x] Add form for players to post LFT: fields for description, requirements (game, roles, region, etc.).
- [x] Add search and filter functionality for teams to find players.
- [x] Include buttons to initiate tryout chats, linking to ChatPage.jsx tryout section.
- [x] Integrate with existing backend endpoints (e.g., `/api/team-applications/looking-for-team`).
- [x] If needed, add new backend model/route for LFT posts.

### 3. Update ChatPage.jsx
- [x] Add a new section/tab for "Tryout Chats".
- [x] Ensure tryout chats are group chats including team members and the player.
- [x] Implement functionality for teams to accept/reject players at the end of tryout.
- [x] Upon acceptance: Update team membership in backend, close chat (no more messaging, but history visible).
- [x] Upon rejection: Close chat (no more messaging, but history visible).
- [x] Use existing tryoutChat model for backend integration.

### 4. Update Routing
- [x] In `client/src/App.jsx`, replace references to AegisOpportunities with RecruitmentPage.

### 5. Backend Adjustments (if needed)
- [ ] If LFT posts require a dedicated model: Create `server/models/recruitmentPost.model.js`, `server/routes/recruitment.routes.js`, `server/controllers/recruitment.controller.js`.
- [ ] Ensure tryout chat acceptance updates team membership.
- [ ] Update middleware and seeding if necessary.

### 6. Testing and Followup
- [ ] Test RecruitmentPage: Posting LFT, searching players, initiating tryouts.
- [ ] Test ChatPage: Tryout chat initiation, group chat functionality, accept/reject flow.
- [ ] Run client and server locally to verify integrations.
- [ ] Ensure authentication and error handling.

## Progress Tracking
- [ ] Step 1: Delete AegisOpportunities.jsx
- [ ] Step 2: Create RecruitmentPage.jsx
- [ ] Step 3: Update ChatPage.jsx
- [ ] Step 4: Update Routing
- [ ] Step 5: Backend Adjustments
- [ ] Step 6: Testing and Followup
