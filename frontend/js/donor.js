// frontend/js/donor.js
const token = localStorage.getItem('food_jwt');
const role = localStorage.getItem('food_role');
const userName = localStorage.getItem('food_name');

if (!token || role !== 'donor') { window.location.href = 'index.html'; }
document.getElementById('welcomeText').textContent = `Hello, ${userName}!`;

const API_BASE = 'http://localhost:5000/api';
const messageBox = document.getElementById('messageBox');

function showMessage(text, isError) {
    messageBox.textContent = text;
    messageBox.className = isError ? 'msg-error' : 'msg-success';
    messageBox.classList.remove('hidden');
    setTimeout(() => messageBox.classList.add('hidden'), 5000);
}

function loadDonations() {
    fetch(`${API_BASE}/donations/list`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        const listDiv = document.getElementById('donationsList');
        listDiv.innerHTML = '';
        if (!data.records || data.records.length === 0) {
            listDiv.innerHTML = '<p class="text-muted text-center mt-2">No donations found yet.</p>';
            return;
        }

        data.records.forEach(item => {
            const card = document.createElement('div');
            card.style.border = '1px solid #eee'; card.style.padding = '1rem'; card.style.borderRadius = '8px'; card.style.marginBottom = '1rem';
            let badgeClass = 'badge-pending';
            if(item.status === 'accepted') badgeClass = 'badge-accepted';
            if(item.status === 'completed') badgeClass = 'badge-completed';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="margin:0;">${item.food_type}</h4>
                    <span class="badge ${badgeClass}">${item.status}</span>
                </div>
                <p class="text-muted" style="font-size:0.9rem; margin-top:5px;">Qty: ${item.quantity} • Expires: ${new Date(item.expiry_time).toLocaleString()}</p>
                <p style="font-size:0.9rem; margin-top:8px;"><strong>Location:</strong> ${item.location}</p>
            `;
            listDiv.appendChild(card);
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById('donationsList').innerHTML = '<p class="text-danger">Failed to load history.</p>';
    });
}

document.getElementById('donationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const payload = {
        food_type: document.getElementById('food_type').value,
        quantity: document.getElementById('quantity').value,
        location: document.getElementById('location').value,
        expiry_time: document.getElementById('expiry_time').value.replace('T', ' ') + ':00' 
    };

    fetch(`${API_BASE}/donations/create`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.message && data.message.includes("success")) {
            showMessage("Food item posted to NGOs successfully!", false);
            document.getElementById('donationForm').reset();
            loadDonations();
        } else {
            showMessage(data.message || "Failed to post donation.", true);
        }
    })
    .catch(err => console.error(err));
});

function logout() {
    localStorage.removeItem('food_jwt'); localStorage.removeItem('food_role'); localStorage.removeItem('food_name');
    window.location.href = 'index.html';
}

loadDonations();
