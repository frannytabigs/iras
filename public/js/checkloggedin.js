fetch('../api/loggedin.php')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'logged_in') {
            //console.log(data);
            showSuccessPopup(`Hello ${escapeHtml(data.user.firstName)}. You are already logged in. Log out first in the dashboard`,'../public/index.html');
        }
        
    });

