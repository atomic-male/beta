import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const passcodeField = document.getElementById('passcodeField');
const accessBtn = document.getElementById('accessBtn');
const status = document.getElementById('status');

const SUPABASE_URL = "https://xmnfsjxqsslnqgmdfgli.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fN_pobDC4-G784uW5Za7Zw_idT_LcqK"; 

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const verifyAccess = async () => {
    // .trim() removes any accidental trailing spaces you might type
    const input = passcodeField.value.trim();

    if (!input) {
        status.innerText = "PLEASE ENTER A PASSCODE";
        status.style.color = "#ff4444";
        return;
    }

    status.innerText = "VERIFYING CREDENTIALS...";
    status.style.color = "#555555";

    try {
        // Query using a clean text match
        const { data, error } = await supabase
            .from('access_keys')
            .select('key_label, passcode_string')
            .eq('passcode_string', input);

        // Check if we got an error or if the array came back completely empty
        if (error || !data || data.length === 0) {
            status.innerText = "INVALID PASSCODE - ACCESS DENIED";
            status.style.color = "#ff4444";
            passcodeField.value = "";
        } else {
            // Match found! Use the first row returned
            const record = data[0];
            status.innerText = `ACCESS GRANTED - WELCOME ${record.key_label.toUpperCase()}`;
            status.style.color = "#10b981"; // Clean green success color
            
            setTimeout(() => {
                alert(`Administrative session started for: ${record.key_label}`);
            }, 500);
        }
    } catch (err) {
        status.innerText = "SYSTEM ERROR - TRY AGAIN LATER";
        status.style.color = "#ff4444";
        console.error(err);
    }
};

accessBtn.addEventListener('click', verifyAccess);

passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
});