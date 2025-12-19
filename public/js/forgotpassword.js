const form = document.getElementById('signupform');

form.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(form);
 
        fetch('../api/forgotpassword.php', {
            method: 'POST',
            body: formData
        }).then(response => response.json())
        .then(data => {
            if (data.status){showErrorPopup(data.message);
                return;}
            showSuccessPopup(data.message,'../public/log_in.html');       
        }).catch((error) => {
             console.error('Error:', error);
             showErrorPopup("Failed to reset password! Refresh the page and try again");
        });
        

    });

function triggerOtp() {
    const otpButton = document.querySelector('.otp-btn'); 
    otpButton.disabled = true;
    otpButton.innerText = "Sending...";
    otpButton.style.cursor = "not-allowed";
    otpButton.style.opacity = "0.7";
    phonetext = document.getElementById('phoneNumber');
    phonetext.readOnly = true;
    otpsend(phonetext.value.trim(), otpButton, phonetext); 
}

function otpsend(phoneNumber, otpButton, phonetext) {
    
    const formData = new URLSearchParams();
    formData.append('phoneNumber', phoneNumber);

    fetch('../api/forgotpassword.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData 
    })
    .then(response => {
        if (!response.ok) {
            showErrorPopup('An error has occurred. Please refresh the page');
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