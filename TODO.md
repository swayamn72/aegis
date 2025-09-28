# Fix Tournament Routes to Use Real Database Data

## Backend Changes
- [x] Remove top-level groups field from tournament schema (use groups within phases)
- [ ] Update GET /:id route to populate matches from tournament phases
- [ ] Calculate real tournament statistics from match data
- [ ] Use real groups data from phases[].groups
- [ ] Use real stream links from tournament.streamLinks
- [ ] Remove all hardcoded data from the route

## Frontend Changes
- [x] Update Groups tab to display teams instead of standings table
- [ ] Verify frontend can handle real data structure
- [ ] Update any data mapping if needed
- [ ] Test data flow from backend to frontend

## Testing
- [ ] Test tournament details page loads with real data
- [ ] Verify matches tab shows recent matches
- [ ] Check statistics are calculated correctly
- [ ] Ensure groups and streams display real data
