import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://xmnfsjxqsslnqgmdfgli.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fN_pobDC4-G784uW5Za7Zw_idT_LcqK"; 
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginView = document.getElementById('loginView');
const dashboardView = document.getElementById('dashboardView');
const moduleGrid = document.getElementById('moduleGrid');
const userTableBody = document.getElementById('userTableBody');
const status = document.getElementById('status');
const passcodeField = document.getElementById('passcodeField');

const allModules = [
    { id: 'B', title: 'Module B', desc: 'Resource Management' },
    { id: 'C', title: 'Module C', desc: 'Logistics and Logs' },
    { id: 'D', title: 'Module D', desc: 'Configuration Hub' },
    { id: 'E', title: 'Module E', desc: 'Compliance & Audit' },
    { id: 'F', title: 'Module F', desc: 'Network Security' }
];

// Fetch and render the users table from Supabase
const loadAdminTable = async () => {
    const { data: databaseUsers, error } = await supabase
        .from('access_keys')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error loading personnel table:", error);
        return;
    }

    userTableBody.innerHTML = '';
    databaseUsers.forEach((u) => {
        // Skip rendering the root master entry if it doesn't have a name
        if (!u.first_name && u.key_label === 'admin') return;

        const currentPermissions = u.access_permissions || [];
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${u.first_name || ''} ${u.last_name || ''}</strong><br><small>${u.user_role || 'SP'}</small></td>
            <td><code style="background:#f3f4f6; padding:2px 6px; border-radius:4px">${u.passcode_string}</code></td>
            <td>${allModules.map(m => `
                <span class="module-pill ${currentPermissions.includes(m.id) ? 'active' : ''}" 
                      data-id="${u.id}" data-module="${m.id}">${m.id}</span>
            `).join('')}</td>
        `;
        userTableBody.appendChild(row);
    });
};

// Global click delegation for permission pills toggling
window.addEventListener('click', async (e) => {
    if (e.target.classList.contains('module-pill')) {
        const rowId = e.target.getAttribute('data-id');
        const moduleId = e.target.getAttribute('data-module');

        // Fetch current row state
        const { data: row } = await supabase.from('access_keys').select('access_permissions').eq('id', rowId).single();
        if (!row) return;

        let updatedPermissions = row.access_permissions || [];
        if (updatedPermissions.includes(moduleId)) {
            updatedPermissions = updatedPermissions.filter(id => id !== moduleId);
        } else {
            updatedPermissions.push(moduleId);
        }

        // Push update to cloud backend
        await supabase.from('access_keys').update({ access_permissions: updatedPermissions }).eq('id', rowId);
        loadAdminTable();
    }
});

const buildDashboard = (user) => {
    const isAdmin = user.user_role === 'Administrator' || user.isMaster;
    document.getElementById('displayUserName').innerText = isAdmin ? "Administrator" : `${user.first_name} ${user.last_name}`;
    document.getElementById('displayUserRole').innerText = user.user_role || "ROOT";
    
    // Toggle Personnel Management visibility based on administration clearance
    document.getElementById('moduleA').classList.toggle('hidden', !isAdmin);

    moduleGrid.innerHTML = '';
    const permissions = user.access_permissions || [];
    const allowed = allModules.filter(m => permissions.includes(m.id) || isAdmin);
    
    allowed.forEach(m => {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.innerHTML = `<h3>${m.title}</h3><p>${m.desc}</p>`;
        moduleGrid.appendChild(card);
    });

    if (isAdmin) {
        loadAdminTable();
    }
};

// Authentication execution logic
document.getElementById('accessBtn').addEventListener('click', async () => {
    const code = passcodeField.value.trim();
    if (!code) return;

    status.innerText = "VERIFYING CREDENTIALS...";
    status.style.color = "#6b7280";

    const { data, error } = await supabase
        .from('access_keys')
        .select('*')
        .eq('passcode_string', code);

    if (error || !data || data.length === 0) {
        status.innerText = "INVALID PASSCODE - ACCESS DENIED";
        status.style.color = "#dc2626";
        passcodeField.value = '';
    } else {
        const foundUser = data[0];
        status.innerText = "ACCESS GRANTED";
        status.style.color = "#059669";
        
        // Match master authorization flag if it's the pure key entry
        if (foundUser.key_label === 'admin' && !foundUser.first_name) {
            foundUser.isMaster = true;
            foundUser.user_role = 'Administrator';
        }

        setTimeout(() => {
            buildDashboard(foundUser);
            loginView.classList.add('hidden');
            dashboardView.classList.remove('hidden');
        }, 400);
    }
});

// Create new dynamic users inside Supabase
document.getElementById('createUserBtn').addEventListener('click', async () => {
    const fields = ['firstName', 'lastName', 'userEmail', 'userRole'];
    const data = {};
    let valid = true;

    fields.forEach(id => {
        const val = document.getElementById(id).value;
        if (!val) valid = false;
        data[id] = val;
    });

    if (!valid) {
        alert("Registration Failed: All fields are mandatory.");
        return;
    }

    // Auto-generate unique 6-digit numeric passcode
    const generatedPasscode = Math.floor(100000 + Math.random() * 900000).toString();

    const { error } = await supabase
        .from('access_keys')
        .insert([{
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.userEmail,
            user_role: data.userRole,
            passcode_string: generatedPasscode,
            key_label: `${data.firstName.toLowerCase()}_${data.lastName.toLowerCase()}`,
            access_permissions: []
        }]);

    if (error) {
        alert(`Failed to save record to cloud database: ${error.message}`);
    } else {
        loadAdminTable();
        // Clear input form fields
        fields.forEach(id => document.getElementById(id).value = id === 'userRole' ? '' : '');
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
    passcodeField.value = '';
    status.innerText = "AWAITING INPUT";
    status.style.color = "#6b7280";
});