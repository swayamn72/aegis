# Community Features Enhancement

## Backend Changes

### 1. Add Admin Middleware
- Create middleware to check if user is admin of the community
- File: server/middleware/auth.js (add new function)
- [x] COMPLETED

### 2. Update Community Routes
- Add PUT /:id route for editing community (name, description, image) - admin only
- Add DELETE /:id route for deleting community - admin only
- File: server/routes/community.routes.js
- [x] COMPLETED

### 3. Update CommunityPost Routes
- Add membership check in create post route
- File: server/routes/communityPost.routes.js
- [x] COMPLETED

## Frontend Changes

### 4. Update CommunityInfo Component
- Add Edit and Delete buttons if user is admin
- Handle edit/delete actions
- File: client/src/components/CommunityInfo.jsx
- [x] COMPLETED

### 5. Create EditCommunityModal Component
- Similar to CreateCommunityModal but for editing
- File: client/src/components/EditCommunityModal.jsx (new)
- [x] COMPLETED

### 6. Update CommunityPage
- Add create post form if user is member
- File: client/src/pages/CommunityPage.jsx
- [x] COMPLETED

### 7. Create CreateCommunityPost Component
- Adapted from CreatePost for community posts
- File: client/src/components/CreateCommunityPost.jsx (new)
- [x] COMPLETED
