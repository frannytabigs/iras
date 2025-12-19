function deleteincident(id){
    var cardincident = document.getElementById(id);
    cardincident.style = 'opacity:0.3;border-color:red;animation: flipY 10s linear infinite;';
    cardincident.querySelector('button').innerHTML = "DELETED INCIDENT";
}

function deletedataincident(id){

     fetch('../api/getincidents.php?show=true&id='+id)
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        let incidents = Array.isArray(data) ? data : data.incidents;
         incidents = incidents.filter(incident => 
            incident.status && incident.status.toLowerCase() !== 'deleted'
        );

    fetch('../api/loggedin.php')
    .then(response => response.json())
    .then(data => {
        //console.log(data.user.role);
        if (data.status !== 'logged_in') {
            showErrorPopup(`Log in first to report an incident`,'log_in.html');
            return
        }
        if ((data.user.phoneNumber != incidents[0].phoneNumber) && data.user.role != 'admin'){
            showErrorPopup(`You can only delete your own reported incident`);
            return
            
        }
        else {
            deleteitnow(incidents);
        }
        
    })   .catch(error => {console.error(error);
        showErrorPopup("Incident is not found or it is already deleted")
    });

        
        }
    ) 
    .catch(error => {console.error(error);
        showErrorPopup("Incident is not found or it is already deleted")
    })
    
}

function deleteitnow(incident){
       const formData = new URLSearchParams();
       console.log(incident);
    formData.append('incidentID', incident[0].incidentID);

    fetch(`../api/deleteincident.php`, {
        method: 'POST',  
        body:formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status){
            showErrorPopup(data.message);
            return;
        }
        showSuccessPopup('Incident Deleted');
    })
     .catch(error => {console.error(error);
        showErrorPopup("Incident is not found or it is already deleted");
    })
    
}