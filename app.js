import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const passcodeField = document.getElementById('passcodeField');
const accessBtn = document.getElementById('accessBtn');
const status = document.getElementById('status');
const loginGate = document.getElementById('loginGate');
const dashboardView = document.getElementById('dashboardView');
const userBadge = document.getElementById('userBadge');

const SUPABASE_URL = "https://xmnfsjxqsslnqgmdfgli.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fN_pobDC4-G784uW5Za7Zw_idT_LcqK"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const verifyAccess = async () => {
    const input = passcodeField.value.trim();

    if (!input) {
        status.innerText = "PLEASE ENTER A PASSCODE";
        status.style.color = "#ef4444";
        return;
    }

    status.innerText = "VERIFYING CREDENTIALS...";
    status.style.color = "#94a3b8";

    try {
        const { data, error } = await supabase
            .from('access_keys')
            .select('key_label')
            .eq('passcode_string', input);

        if (error || !data || data.length === 0) {
            status.innerText = "INVALID PASSCODE - ACCESS DENIED";
            status.style.color = "#ef4444";
            passcodeField.value = "";
        } else {
            const record = data[0];
            status.innerText = "ACCESS GRANTED";
            status.style.color = "#10b981";
            
            userBadge.innerText = `SESSION: ${record.key_label.toUpperCase()}`;

            // Seamlessly swap the login screen for the dashboard layout
            setTimeout(() => {
                loginGate.style.display = 'none';
                dashboardView.style.display = 'block';
            }, 500);
        }
    } catch (err) {
        status.innerText = "SYSTEM ERROR - TRY AGAIN LATER";
        status.style.color = "#ef4444";
        console.error(err);
    }
};

accessBtn.addEventListener('click', verifyAccess);

passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
});