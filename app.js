const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const moduleGrid = document.getElementById('moduleGrid');
const userTableBody = document.getElementById('userTableBody');

const MASTER_PASSCODE = "fuck!";
let users = []; // Persistent user list for the session

const allModules = [
    { id: 'B', title: 'Module B', desc: 'Resource Management' },
    { id: 'C', title: 'Module C', desc: 'Logistics and Logs' },
    { id: 'D', title: 'Module D', desc: 'Configuration Hub' },
    { id: 'E', title: 'Module E', desc: 'Compliance & Audit' },
    { id: 'F', title: 'Module F', desc: 'Network Security' }
];

const renderAdminTable = () => {
    userTableBody.innerHTML = '';
    users.forEach((u, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${u.firstName} ${u.lastName}</strong><br><small>${u.role}</small></td>
            <td><code style="background:#f3f4f6; padding:2px 6px; border-radius:4px">${u.passcode}</code></td>
            <td>${allModules.map(m => `
                <span class="module-pill ${u.access.includes(m.id) ? 'active' : ''}" 
                      onclick="window.toggleModule(${i}, '${m.id}')">${m.id}</span>
            `).join('')}</td>
        `;
        userTableBody.appendChild(row);
    });
};

window.toggleModule = (idx, modId) => {
    const user = users[idx];
    // This allows both adding and removing permissions
    user.access = user.access.includes(modId) 
        ? user.access.filter(m => m !== modId) 
        : [...user.access, modId];
    renderAdminTable();
};

const buildDashboard = (user) => {
    const isAdmin = user.role === 'Administrator' || user.isMaster;
    document.getElementById('displayUserName').innerText = isAdmin ? "Administrator" : `${user.firstName} ${user.lastName}`;
    document.getElementById('displayUserRole').innerText = user.role || "ROOT";
    
    document.getElementById('moduleA').classList.toggle('hidden', !isAdmin);

    moduleGrid.innerHTML = '';
    const allowed = allModules.filter(m => user.access.includes(m.id) || isAdmin);
    allowed.forEach(m => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.innerHTML = `<h3>${m.title}</h3><p>${m.desc}</p>`;
        moduleGrid.appendChild(card);
    });
};

// Fixed Validation: Checks registered users as well as Master key
document.getElementById('accessBtn').addEventListener('click', () => {
    const code = document.getElementById('passcodeField').value;
    
    // 1. Check Master Key
    if (code === MASTER_PASSCODE) {
        buildDashboard({ isMaster: true, role: 'Administrator', access: [] });
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        return;
    }

    // 2. Check Registered Users
    const foundUser = users.find(u => u.passcode === code);
    if (foundUser) {
        buildDashboard(foundUser);
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
    } else {
        alert("Invalid Passcode.");
    }
});

document.getElementById('createUserBtn').addEventListener('click', () => {
    const fields = ['firstName', 'lastName', 'userEmail', 'userRole'];
    const data = {};
    let valid = true;

    // Check mandatory fields
    fields.forEach(id => {
        const val = document.getElementById(id).value;
        if (!val) valid = false;
        data[id] = val;
    });

    if (!valid) {
        alert("Registration Failed: All fields are mandatory.");
        return;
    }

    users.push({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.userEmail,
        role: data.userRole,
        passcode: Math.floor(100000 + Math.random() * 900000).toString(),
        access: []
    });

    renderAdminTable();
    fields.forEach(id => document.getElementById(id).value = id === 'userRole' ? '' : '');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    document.getElementById('passcodeField').value = '';
});