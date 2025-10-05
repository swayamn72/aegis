# Tournament Registration Implementation

## Backend Changes
- [ ] Update chat.model.js to add 'tournament_reference' messageType and tournamentId field
- [ ] Add route in message.routes.js to send tournament reference message to captain
- [ ] Update teamTournament.routes.js registration to support selected players (if needed)

## Frontend Changes
- [ ] Modify DetailedTournamentInfo2.jsx to add register button and modals
- [ ] Update ChatPage.jsx to handle tournament_reference messages as clickable cards

## Testing
- [ ] Test captain registration flow with player selection
- [ ] Test non-captain registration attempt and message sending
- [ ] Test chat message display and navigation
- [ ] Verify tournament status and slot checks
