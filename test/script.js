let userEmail = '';
let accessToken = '';
let emails = [];
let senderCategories = new Map();

async function handleCredentialResponse(response) {
    // Exchange the credential for an access token
    const result = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            code: response.credential,
            client_id: '42908098411-iqf0pgqm02uarv36b9640gug910f7rbh.apps.googleusercontent.com',
            client_secret: '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', // Ensure this is kept secure
            redirect_uri: window.location.origin,
            grant_type: 'authorization_code',
        })
    }).then(res => res.json());

    accessToken = result.access_token;
    await initializeApp();
}

async function initializeApp() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('appContainer').style.display = 'flex';
    
    // Get user profile
    const userInfo = await fetchUserProfile();
    displayUser Info(userInfo);

    // Start fetching emails
    await fetchEmails();
    
    // Set up real-time updates
    startEmailPolling();
}

async function fetchUserProfile() {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}

function displayUser Info(userInfo) {
    const userInfoDiv = document.getElementById('userInfo');
    userInfoDiv.innerHTML = `
        <img src="${userInfo.picture}" class="user-avatar" alt="Profile">
        <span>${userInfo.email}</span>
    `;
    userEmail = userInfo.email;
}

async function fetchEmails() {
    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        console.error('Error fetching emails:', response.status, response.statusText);
        return; // Exit if there's an error
    }

    const data = await response.json();
    
    if (!data.messages || data.messages.length === 0) {
        console.log('No emails found.');
        return; // No emails found
    }

    emails = await Promise.all(data.messages.map(async message => {
        const details = await fetchEmailDetails(message.id);
        return processEmailData(details);
    }));

    updateEmailList(emails);
    updateSendersList();
}

async function fetchEmailDetails(messageId) {
    const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    return response.json();
}

function processEmailData(emailData) {
    const headers = emailData.payload.headers;
    const subject = headers.find(h => h.name === 'Subject')?.value || '(no subject)';
    const from = headers.find(h => h.name === 'From')?.value || '';
    const date = new Date(parseInt(emailData.internalDate));
    
    // Categorize sender
    const senderEmail = extractEmailAddress(from);
    categorizeSender(senderEmail);

    return {
        id: emailData.id,
        subject,
        from,
        date,
        snippet: emailData.snippet,
        category: determineCategory(from, subject)
    };
}

function extractEmailAddress(from) {
    const match = from.match(/<(.+)>/);
    return match ? match[1] : from;
}

function categorizeSender(senderEmail) {
    if (!senderCategories.has(senderEmail)) {
        // Simple categorization based on email domain
        if (senderEmail.includes('linkedin') || senderEmail.includes('facebook')) {
            senderCategories.set(senderEmail, 'social');
        } else if (senderEmail.includes('github') || senderEmail.includes('jira')) {
            senderCategories.set(senderEmail, 'work');
        } else {
            senderCategories.set(senderEmail, 'personal');
        }
    }
}

function determineCategory(from, subject) {
    const lowerSubject = subject.toLowerCase();
    const lowerFrom = from.toLowerCase();
    
    if (lowerSubject.includes('urgent') || lowerSubject.includes('important')) {
        return ' important';
    } else if (lowerFrom.includes('linkedin') || lowerFrom.includes('facebook')) {
        return 'social';
    } else if (lowerFrom.includes('github') || lowerFrom.includes('jira')) {
        return 'work';
    }
    return 'personal';
}

function updateEmailList(emailsToShow) {
    const emailList = document.getElementById('emailList');
    emailList.innerHTML = emailsToShow.map(email => `
        <div class="email-item" data-id="${email.id}">
            <span class="category-tag" style="background: ${getCategoryColor(email.category)}">${email.category}</span>
            <span class="email-sender">${email.from}</span>
            <span class="email-subject">${email.subject}</span>
            <span class="email-date">${formatDate(email.date)}</span>
        </div>
    `).join('');
}

function updateSendersList() {
    const sendersList = document.getElementById('sendersList');
    const uniqueSenders = [...new Set(emails.map(email => email.from))];
    
    sendersList.innerHTML = uniqueSenders.map(sender => `
        <div class="filter-option" data-sender="${sender}">
            ${sender}
        </div>
    `).join('');
}

function getCategoryColor(category) {
    const colors = {
        important: '#ff4444',
        work: '#4285f4',
        personal: '#0f9d58',
        social: '#f4b400'
    };
    return colors[category] || '#666';
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function startEmailPolling() {
    // Poll for new emails every minute
    setInterval(async () => {
        const response = await fetch(
            `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=newer_than:1h`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        
        if (data.messages) {
            const newEmails = await Promise.all(data.messages
                .filter(message => !emails.find(e => e.id === message.id))
                .map(async message => {
                    const details = await fetchEmailDetails(message.id);
                    return processEmailData(details);
                }));
            
            if (newEmails.length > 0) {
                emails = [...newEmails, ...emails];
                updateEmailList(emails);
                updateSendersList();
            }
        }
    }, 60000);
}

// Event Listeners
document.querySelector('.search-bar').addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredEmails = emails.filter(email => 
        email.subject.toLowerCase().includes(searchTerm) ||
        email.from.toLowerCase().includes(searchTerm) ||
        email.snippet.toLowerCase().includes(searchTerm)
    );
    updateEmailList(filteredEmails);
});

document.querySelectorAll('.filter-option[data-category]').forEach(option => {
    option.addEventListener('click', (e) => {
        const category = e.target.dataset.category;
        const filteredEmails = category === 'all' 
            ? emails 
            : emails.filter(email => email.category === category);
        updateEmailList(filteredEmails);
    });
});

console.log('Fetching emails...');
const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=50`, {
    headers: {
        'Authorization': `Bearer ${accessToken}`
    }
});
console.log('Response:', response);