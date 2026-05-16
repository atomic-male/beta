const passcodeField = document.getElementById('passcodeField');
const accessBtn = document.getElementById('accessBtn');
const status = document.getElementById('status');

const ADMIN_PASSCODE = "fuck!";

const verifyAccess = () => {
    const input = passcodeField.value;

    if (input === ADMIN_PASSCODE) {
        status.innerText = "ACCESS GRANTED - INITIALIZING...";
        status.style.color = "#ffffff";
        // Logic for redirect or session start goes here
        setTimeout(() => {
            alert("Administrative session started.");
        }, 500);
    } else {
        status.innerText = "INVALID PASSCODE - ACCESS DENIED";
        status.style.color = "#ff4444";
        passcodeField.value = "";
    }
};

accessBtn.addEventListener('click', verifyAccess);

// Allow entry by pressing 'Enter' key
passcodeField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAccess();
});