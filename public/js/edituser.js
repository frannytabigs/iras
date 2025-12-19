const form = document.getElementById('edituserform');

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(form);

    fetch('../api/edituser.php', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        if (data.status === 'error'){ 
            showErrorPopup(data.message);
            return;
        }
        let url = new URL(window.location.href);
        url.searchParams.set('phoneNumber', data.phoneNumber);
        console.log(url);   
        showSuccessPopup(data.message, url);       
    }).catch((error) => {
         console.error('Error:', error);
         showErrorPopup("Failed to change user details! Refresh the page and try again");
    });
});

function triggerOtp() {
    const otpButton = document.querySelector('.otp-button-send'); 
    otpButton.disabled = true;
    otpButton.innerText = "Sending...";
    otpButton.style.cursor = "not-allowed";
    otpButton.style.opacity = "0.7";
    
    const phonetext = document.getElementById('phoneNumber');
    phonetext.readOnly = true;
    otpsend(phonetext.value.trim(), otpButton, phonetext); 
}

function otpsend(phoneNumber, otpButton, phonetext) {
    const formData = new URLSearchParams();
    formData.append('phoneNumber', phoneNumber);
    formData.append('otponly','true');

    fetch('../api/edituser.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'error') {
            showErrorPopup(data.message);
        } else {
            showSuccessPopup(data.message);   
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorPopup('An error has occurred. Please refresh the page');
    }).finally(() =>{
        otpButton.innerText = 'Send OTP';
        otpButton.disabled = false;
        phonetext.readOnly = false;
        otpButton.style.cursor = "pointer";
        otpButton.style.opacity = "1";
    })
}