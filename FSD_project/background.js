chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getEmails') {
      getEmails().then(emails => sendResponse({ emails }));
      return true; // Keeps the sendResponse channel open
    }
    if (request.action === 'syncCalendar') {
      syncCalendar().then(result => sendResponse(result));
      return true;
    }
  });
  
  async function getEmails() {
    // Fetch emails from an API or backend server, and categorize them
    const emails = await fetch('https://api.yourbackend.com/emails').then(res => res.json());
    return categorizeEmails(emails);
  }
  
  function categorizeEmails(emails) {
    // Simple categorization logic or call to ML model
    return emails.map(email => ({
      ...email,
      urgent: email.subject.includes('urgent') || email.sender.includes('CEO')
    }));
  }
  
  async function syncCalendar() {
    const response = await fetch('https://api.yourbackend.com/sync-calendar', { method: 'POST' });
    return response.json();
  }
  