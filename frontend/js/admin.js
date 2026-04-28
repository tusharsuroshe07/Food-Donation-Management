// frontend/js/admin.js
const token = localStorage.getItem('food_jwt');
const role = localStorage.getItem('food_role');
const userName = localStorage.getItem('food_name');

if (!token || role !== 'admin') { window.location.href = 'index.html'; }
document.getElementById('welcomeText').textContent = `Admin: ${userName}`;

// Pointing to the Python Flask Server running on port 5000!
const API_BASE = 'http://localhost:5000/api';

function loadStats() {
    fetch(`${API_BASE}/admin/stats`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        if(data.total_users !== undefined) {
            document.getElementById('statUsers').textContent = data.total_users;
            document.getElementById('statDonations').textContent = data.total_donations;
            document.getElementById('statCompleted').textContent = data.total_completed;
        }
    })
    .catch(err => console.error(err));
}

function loadAllDonations() {
    fetch(`${API_BASE}/donations/list`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('adminDonationsList');
        tbody.innerHTML = '';
        if (!data.records || data.records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No donations found.</td></tr>';
            return;
        }

        data.records.forEach(item => {
            const tr = document.createElement('tr');
            let badgeClass = item.status === 'accepted' ? 'badge-accepted' : (item.status === 'completed' ? 'badge-completed' : 'badge-pending');
            
            tr.innerHTML = `
                <td><strong>${item.food_type}</strong><br><small class="text-muted">Qty: ${item.quantity}</small></td>
                <td>${item.donor_name || 'Unknown'}</td>
                <td>${item.ngo_name || '<span class="text-muted">- None -</span>'}</td>
                <td><span class="badge ${badgeClass}">${item.status}</span></td>
                <td>${new Date(item.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => console.error(err));
}

function loadUsers() {
    fetch(`${API_BASE}/admin/users`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
    .then(res => res.json())
    .then(data => {
        const tbody = document.getElementById('adminUsersList');
        tbody.innerHTML = '';
        if (!data.records || data.records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No users found.</td></tr>';
            return;
        }

        data.records.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${user.name}</strong></td>
                <td>${user.email}</td>
                <td style="text-transform: capitalize;">${user.role}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(err => console.error(err));
}

function logout() {
    localStorage.removeItem('food_jwt'); localStorage.removeItem('food_role'); localStorage.removeItem('food_name');
    window.location.href = 'index.html';
}

loadStats();
loadAllDonations();
loadUsers();
