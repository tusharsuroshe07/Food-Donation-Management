// frontend/js/ngo.js
const token = localStorage.getItem('food_jwt');
const role = localStorage.getItem('food_role');
const userName = localStorage.getItem('food_name');

if (!token || role !== 'ngo') { window.location.href = 'index.html'; }
document.getElementById('welcomeText').textContent = `${userName} (NGO)`;

const API_BASE = 'http://localhost:5000/api';
const messageBox = document.getElementById('messageBox');
let currentTab = 'pending';

function showMessage(text, isError) {
    messageBox.textContent = text;
    messageBox.className = isError ? 'msg-error' : 'msg-success';
    messageBox.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => messageBox.classList.add('hidden'), 5000);
}

function switchTab(tabName) {
    currentTab = tabName;
    const btnP = document.getElementById('btnPending');
    const btnA = document.getElementById('btnAccepted');
    if(tabName === 'pending') {
        btnP.style.background = '#2E7D32'; btnP.style.color = 'white';
        btnA.style.background = '#ddd'; btnA.style.color = '#333';
    } else {
        btnA.style.background = '#2E7D32'; btnA.style.color = 'white';
        btnP.style.background = '#ddd'; btnP.style.color = '#333';
    }
    loadDonations();
}

function loadDonations() {
    const endpoint = currentTab === 'pending' ? 'list' : 'list?filter=my_tasks';

    fetch(`${API_BASE}/donations/${endpoint}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        const listDiv = document.getElementById('donationsList');
        listDiv.innerHTML = '';
        if (!data.records || data.records.length === 0) {
            listDiv.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">No ${currentTab} food found at the moment.</p>`;
            return;
        }

        data.records.forEach(item => {
            const card = document.createElement('div');
            card.className = 'card';
            let badgeClass = item.status === 'accepted' ? 'badge-accepted' : (item.status === 'completed' ? 'badge-completed' : 'badge-pending');

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <h3 style="margin:0">${item.food_type}</h3>
                    <span class="badge ${badgeClass}">${item.status}</span>
                </div>
                <p class="text-muted" style="margin-top:10px; font-size:0.9rem;"><strong>Donor:</strong> ${item.donor_name}</p>
                <div style="background:var(--light-green); padding:10px; border-radius:6px; margin: 15px 0;">
                    <p style="margin-bottom:5px;"><strong>Quantity:</strong> ${item.quantity}</p>
                    <p style="margin-bottom:5px;"><strong>Location:</strong> ${item.location}</p>
                    <p style="margin-bottom:0px; color:#c62828;"><strong>Expires:</strong> ${new Date(item.expiry_time).toLocaleString()}</p>
                </div>
            `;

            if (currentTab === 'pending' && item.status === 'pending') {
                html += `<button class="btn btn-orange" style="width:100%" onclick="updateStatus(${item.id}, 'accepted')">Accept Delivery</button>`;
            } else if (currentTab === 'accepted' && item.status === 'accepted') {
                html += `<button class="btn" style="width:100%" onclick="updateStatus(${item.id}, 'completed')">Mark as Picked Up</button>`;
            }
            card.innerHTML = html;
            listDiv.appendChild(card);
        });
    })
    .catch(err => {
        console.error(err);
        document.getElementById('donationsList').innerHTML = '<p class="text-danger" style="grid-column: 1/-1;">Failed to load data.</p>';
    });
}

window.updateStatus = function(donation_id, new_status) {
    if (!confirm(`Are you sure you want to change status to: ${new_status.toUpperCase()}?`)) return;

    fetch(`${API_BASE}/donations/update_status`, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ donation_id: donation_id, status: new_status })
    })
    .then(res => res.json())
    .then(data => {
        if (data.message && data.message.includes("success")) {
            showMessage("Status successfully updated!", false);
            loadDonations();
        } else {
            showMessage(data.message || "Failed to update.", true);
        }
    })
    .catch(err => console.error(err));
};

function logout() {
    localStorage.removeItem('food_jwt'); localStorage.removeItem('food_role'); localStorage.removeItem('food_name');
    window.location.href = 'index.html';
}

loadDonations();
