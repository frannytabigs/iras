



let user = {'role':'guest'}
fetch('../api/loggedin.php')
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        if (data.status === 'logged_in') {
           document.getElementById('profilePhotouser').src = data.user.profilePhoto;
           document.getElementById('profileme').href = '../public/userprofile.html?phoneNumber=' + data.user.phoneNumber.replace("+","%2B");
           user = data.user;
           var x = document.getElementById('greetuser');
           if (x) x.innerText = "Hello " +  data.user.firstName + "!";
        }
        else{
            
document.getElementById('profilePhotouser').src = "";
document.getElementById('user').innerHTML = "<a href='../public/log_in.html'>Log In</a> <a href='../public/signup.html'>Sign Up</a>";

        }
        
    }).catch(error => {
        console.error(error);
document.getElementById('profilePhotouser').src = "";
document.getElementById('user').innerHTML = "<a href='../public/log_in.html'>Log In</a> <a href='../public/signup.html'>Sign Up</a>";
console.log(error);
    });


   
