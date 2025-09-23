# Tournament Schema Update: Include Groups in Phases

## Plan Summary
Update the schema to include groups in phases, where each phase can have different groups. This involves modifying the database schema and UI components.

## Steps to Complete

### 1. Update Schema (`server/models/tournament.model.js`)
- Add a `groups` array to each phase in the `phases` schema.
- Each group should have `name`, `teams`, and `standings`.
- Keep or remove the top-level `groups` array as needed.

### 2. Update PhaseManager Component (`client/src/components/PhaseManager.jsx`)
- Add UI elements to manage groups within each phase.
- Allow adding/removing groups, assigning teams, and editing standings.

### 3. Check and Update Other Components
- Review `client/src/components/TournamentWindow.jsx` for compatibility.
- Review `client/src/components/MatchManagement.jsx` for compatibility.
- Update any routes or models that reference groups.

### 4. Testing and Migration
- Test the updated schema and UI.
- Handle database migrations if needed.
- Verify match creation and standings work with the new structure.

## Progress
- [x] Step 1: Update Schema
- [x] Step 2: Update PhaseManager
- [x] Step 3: Check Other Components
- [ ] Step 4: Testing and Migration
