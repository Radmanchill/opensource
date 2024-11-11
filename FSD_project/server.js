const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

app.get('/emails', async (req, res) => {
  const emails = await fetchEmailsFromAPI(); // Connect to Email API
  const categorizedEmails = categorizeEmails(emails);
  res.json(categorizedEmails);
});

app.post('/sync-calendar', async (req, res) => {
  const result = await syncWithCalendarAPI();
  res.json({ status: 'success', result });
});

function categorizeEmails(emails) {
  // ML logic or call to categorization model
  return emails.map(email => ({ ...email, urgent: email.subject.includes('urgent') }));
}

app.listen(3000, () => console.log('Server running on port 3000'));
