const express = require('express');
const { google } = require('googleapis');
const open = require('open');

const app = express();
const PORT = 3000;

// OAuth2 Client Setup
const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID', // Replace with your Client ID
  'YOUR_CLIENT_SECRET', // Replace with your Client Secret
  `http://localhost:${PORT}/oauth2callback` // Redirect URL for local testing
);

// Scopes for Gmail and Calendar
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar'
];

// Redirect user to Google for Authentication
app.get('/auth', async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  await open(authUrl);
  res.send("Authorization process initiated. Check your browser to complete login.");
});

// OAuth2 callback
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  res.send("Authorization successful! You can close this window.");
});

// Fetch Google Calendar Events
app.get('/sync-calendar', async (req, res) => {
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  const events = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime'
  });
  res.json(events.data.items);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Visit http://localhost:3000/auth to start the authentication process.");
});
