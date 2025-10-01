# Community Page Implementation Plan

## Backend Tasks
- [ ] Create Community model (server/models/community.model.js)
- [ ] Create CommunityPost model (server/models/communityPost.model.js)
- [ ] Create community routes (server/routes/community.routes.js) for fetching communities and community info
- [ ] Create community post routes (server/routes/communityPost.routes.js) for fetching and creating posts in communities
- [ ] Register new routes in server/index.js

## Frontend Tasks
- [ ] Update CommunityPage.jsx to fetch community info and posts dynamically using communityId
- [ ] Update CommunitySidebar.jsx to fetch and display list of communities
- [ ] Update CommunityInfo.jsx to show real community info
- [ ] Implement CommunityPost.jsx to display individual community posts
- [ ] Replace placeholders in CommunityPage.jsx with real data

## Testing and Integration
- [ ] Test backend endpoints for communities and community posts
- [ ] Test frontend data fetching and UI updates
- [ ] Ensure community page works similar to Reddit subreddits
