function deleteacc(){
    var otp = document.getElementById('otpCodeDelete');
    if (otp.value){
        const formData = new URLSearchParams();
        formData.append('otpCode',otp.value);

 fetch('../api/deleteuser.php', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
    .then(data => {
        if (data.status === 'error'){ 
            showErrorPopup(data.message);
            return;
        }
        showSuccessPopup(data.message, '../public/log_in.html');       
    }).catch((error) => {
         console.error('Error:', error);
         showErrorPopup("Failed to delete your account! Refresh the page and try again");
    });

    return;
    }
    showErrorPopup('OTP code is required to delete your account');
}



function triggerOtpDelete(){
    var element =  document.getElementById('otpdelete');
    element.innerText = "Sending...";
    fetch('../api/deleteuser.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    
    })  .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'error') {
            showErrorPopup(data.message);return;
        }
        showSuccessPopup(data.message);   
    }).catch(error => {console.error(error);           
     showErrorPopup('Failed to delete your account. Please refresh the page');
    }
).finally(() => element.innerText = origmsg)

    
}
  