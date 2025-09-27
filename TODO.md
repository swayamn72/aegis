# TODO: Add Admin Upload Options for Tournament Logo and Cover Page

## Steps to Complete:

1. **[COMPLETED]** Add file upload UI sections to `client/src/components/TournamentForm.jsx` for Tournament Logo and Tournament Cover Page (after the Description field). Include file inputs (type="file", accept="image/*"), labels, and preview images using URL.createObjectURL.

2. **[COMPLETED]** Add state variables in `TournamentForm.jsx` for selected files: `logoFile` and `coverFile` (useState(null)). Update `handleChange` to handle file inputs by setting these states. Add cleanup for previews on unmount.

3. **[COMPLETED]** Update `handleSubmit` in `TournamentForm.jsx`: Perform client-side validation (file type image/*, size <=5MB). Create FormData, append all formData fields (flatten nested objects with JSON.stringify), append `logoFile` as 'logo' and `coverFile` as 'coverImage' if selected. Exclude media.logo/banner from formData if files are provided. Pass FormData to `onSubmit`.

4. **[COMPLETED]** In `useEffect` of `TournamentForm.jsx` for editing: If tournament exists, set preview src for logo and banner using existing URLs, but do not set file states (to avoid re-uploading unchanged files).

5. **[COMPLETED]** Update `createTournament` function in `client/src/pages/AdminTournaments.jsx`: Remove explicit 'Content-Type': 'application/json' header. Use `body: tournamentData` directly (since FormData sets multipart). Handle response accordingly.

6. **[COMPLETED]** FormData handling is implemented for both create and edit functionality.

7. **[PENDING]** Test: Run the server (`cd server && npm start`), open AdminTournaments page, create a tournament with logo/cover files, verify upload success, check that images are saved to Cloudinary/DB, and display in the tournament table (logo preview).

8. **[PENDING]** Verify no errors in console/network tab. If Cloudinary issues, confirm config in server (e.g., env vars for cloud_name, api_key, api_secret).

9. **[COMPLETED]** Update this TODO.md as steps are finished, marking them as [DONE].

*Note: Backend (admin.routes.js) already handles uploads via multer/Cloudinary for 'logo' and 'coverImage' fields. No server changes needed.*
