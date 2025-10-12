# Team Grouping Enhancements

## Current Work
Enhancing TeamGrouping.jsx to support automated random group allocation per phase, shuffling, and manual editing as per user feedback.

## Key Technical Concepts
- React state management for per-phase data (teamsPerGroup, groups).
- Random shuffling using Math.random() for fair allocation.
- Phase-specific teams from tournament.phases[].teams or filtered participatingTeams by currentStage.
- API integration: PUT /tournaments/:id/groups with phaseId to update phase.groups.
- UI: Collapsible per-phase sections with inputs, buttons, and editable group lists.

## Relevant Files and Code
- client/src/components/TeamGrouping.jsx
  - Existing: Manual group creation/add teams, basic randomize across groups.
  - Changes: Restructure to per-phase rendering, add teamsPerGroup input, allocate/shuffle logic, manual drag/select for teams.

## Problem Solving
- Handle missing phase.teams: Fall back to participatingTeams with matching currentStage.
- Ensure no duplicate teams across groups.
- Preserve existing groups/teams during allocation if possible.
- Error handling: No teams in phase, invalid input.

## Pending Tasks and Next Steps
- [x] Step 1: Update state management in TeamGrouping.jsx to handle per-phase data (teamsPerGroup object keyed by phase.name, load existing groups from phase.groups).
  - "Add state for per-phase teamsPerGroup (default 16) and ensure groups load from tournament.phases.find(p => p.name === phaseName)?.groups || []"
- [x] Step 2: Restructure JSX to loop over tournament.phases, render heading for each phase.
  - "For each phase: <h3>Phase: {phase.name}</h3>, input for teamsPerGroup, 'Allocate Groups' button, 'Shuffle' button, then groups list."
- [x] Step 3: Implement Allocate Groups: Calculate numGroups = Math.ceil(phaseTeams.length / teamsPerGroup), create/update groups (name: 'Group ' + String.fromCharCode(65 + i)), shuffle phaseTeams, assign evenly.
  - "If groups.length < numGroups, create new; else reuse/resize. Use phase.teams || participatingTeams.filter(t => t.currentStage === phase.name).map(t => t.team._id)"
- [x] Step 4: Implement Shuffle: Shuffle all phaseTeams, reassign to existing groups evenly.
  - "Maintain group count and names, just redistribute teams randomly."
- [x] Step 5: Enhance manual editing: For each group, show available phaseTeams (not assigned elsewhere), allow add/remove (update local state).
  - "getAvailableTeams(phaseName, groupId): phaseTeams.filter(team => !otherGroupsHave(team) || thisGroupHas(team))"
- [x] Step 6: Update save function: Loop over phases with changes, send PUT for each phaseId with updated groups.
  - "Track dirty phases, or save all on button click. Clear errors/success."
- [x] Step 7: Add UI polish: Loading states, validation (e.g., teamsPerGroup > 0), remove phase select (now per-phase).
  - "Remove newGroupName input; groups auto-created on allocate."
- [x] Step 8: Test: Use execute_command to run client, verify in browser (navigate to Groups tab, allocate/shuffle/edit/save).
  - "After all edits, attempt_completion with demo command if needed."
