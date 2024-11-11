document.getElementById('login-button').addEventListener('click', loginWithGoogle);
document.getElementById('sync-calendar').addEventListener('click', syncCalendar);

function loginWithGoogle() {
  fetch('http://localhost:3000/auth')
    .then(() => {
      alert("Please check your browser to complete Google login.");
    })
    .catch(error => console.error("Error during login:", error));
}

function syncCalendar() {
  fetch('http://localhost:3000/sync-calendar')
    .then(response => response.json())
    .then(data => {
      const calendarStatus = document.getElementById('calendar-status');
      if (data.length) {
        calendarStatus.textContent = `Synced ${data.length} events.`;
        console.log("Calendar events:", data);
      } else {
        calendarStatus.textContent = "No events found.";
      }
    })
    .catch(error => console.error("Error fetching calendar events:", error));
}
