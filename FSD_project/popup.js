document.addEventListener('DOMContentLoaded', () => {
    fetchEmails();
    document.getElementById('sync-calendar').addEventListener('click', syncCalendar);
  });
  
  function fetchEmails() {
    chrome.runtime.sendMessage({ action: 'getEmails' }, (response) => {
      const urgentEmails = document.getElementById('urgent-emails');
      const otherEmails = document.getElementById('other-emails');
  
      response.emails.forEach(email => {
        const emailElement = document.createElement('div');
        emailElement.textContent = `${email.sender}: ${email.subject}`;
        if (email.urgent) {
          urgentEmails.appendChild(emailElement);
        } else {
          otherEmails.appendChild(emailElement);
        }
      });
    });
  }
  
  function syncCalendar() {
    chrome.runtime.sendMessage({ action: 'syncCalendar' }, (response) => {
      alert('Calendar Synced');
    });
  }
  