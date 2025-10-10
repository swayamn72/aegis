# Tournament Routes Consistency Fix

## Tasks to Complete

- [x] Update `/live` route to use `Tournament.findLive()` static method instead of manual query
- [x] Update `/upcoming` route to use `Tournament.findUpcoming()` static method instead of manual query
- [x] Update `/all` route to use `Tournament.findByGameAndRegion()` static method where appropriate
- [x] Update `/featured` route to be consistent
- [x] Update `/search` route to be consistent and add support for tags
- [x] Update single tournament route to use model's `isLive()` method
- [x] Replace manual `currentPhase` calculation in `/:id` route with `tournament.currentCompetitionPhase` virtual
- [x] Replace manual registration status calculation with `tournament.registrationDisplayStatus` virtual
- [x] Add support for `subRegion` field in queries and responses
- [x] Add support for `tags` field in search and responses
- [x] Ensure consistent field selection across all routes
- [x] Remove `lean()` where it conflicts with virtuals, or ensure virtuals are included
- [x] Fix population paths to match model structure (organizer is object, not ref)
- [x] Add routes for approval system fields if needed (_approvalStatus, etc.)
- [ ] Test all routes to ensure they work with updated model usage
