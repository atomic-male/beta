const passcodeField = document.getElementById('passcodeField');
const accessBtn = document.getElementById('accessBtn');
const status = document.getElementById('status');

// Initialize the Supabase client using your project URL and publishable key
const SUPABASE_URL = "https://xmnfsjxqsslnqgmdfgli.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fN_pobDC4-G784uW5Za7Zw_idT_LcqK"; 

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const verifyAccess = async () => {
    const input = passcodeField.value.trim();

    if (!input) {
        status.innerText = "PLEASE ENTER A PASSCODE";
        status.style.color = "#ff4444";
        return;
    }

    status.innerText = "VERIFYING CREDENTIALS...";
    status.style.color = "#555555";

    try {
        // Query the 'access_keys' table for a matching passcode string
        const { data, error } = await supabase
            .from('access_keys')
            .select('key_label')
            .eq('passcode_string', input)
            .single();

        if (error || !data) {
            // No match found or database error
            status.innerText = "INVALID PASSCODE - ACCESS DENIED";
            status.style.color = "#ff4444";
            passcodeField.value = "";
        } else {
            // Match found successfully
            status.innerText = `ACCESS GRANTED - WELCOME ${data.key_label.toUpperCase()}`;
            status.style.color = "#ffffff";
            
            setTimeout(() => {
                alert(`Administrative session started for: ${data.key_label}`);
                // Future redirection logic can go here
            }, 500);
        }
    } catch (err) {
        status.innerText = "SYSTEM ERROR - TRY AGAIN LATER";
        status.style.color = "#ff4444";
        console.error(err);
    }
};

accessBtn.addEventListener('click', verifyAccess);

// Allow entry by pressing 'Enter' key
passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
});