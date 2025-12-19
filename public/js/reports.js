
function escapeHtml(unsafe) {
    unsafe = unsafe ?? '';
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace("+",'%2B'); 
}

function loadReportCards(incidents) {  
        const container = document.querySelector('.reports-container');
       

       
        const fragment = document.createDocumentFragment();
        
        incidents.forEach(incident => {
            const badgeClass = `type-${incident.type.split(" ")[0].toLowerCase()}`;
            var dateincident = prettyDateTimeManual(incident.occurredAt,true);
            const cardDiv = document.createElement('div');
         
            cardDiv.className = 'report-card status' + incident.status.toLowerCase() + ' month' + dateincident.toLowerCase().substring(0,3);
            cardDiv.id = "incidentid" + incident.incidentID; 
            var bts = 'Delete Incident';
            if (incident.status.toLowerCase() == 'deleted') bts = 'DELETED INCIDENT'
            

cardDiv.innerHTML = `
    <div class="card-image">
        <img src="${incident.photo}" loading="lazy" alt="Incident" 
             onerror="this.onerror=null; this.src='https://placehold.co/600x400/png?text=No+Image';">
        <span class="badge ${badgeClass}">${escapeHtml(incident.type)}</span>
    </div>

    <div class="card-content">
        <div class="meta-header">
            <span class="incident-id">Incident ID: #${incident.incidentID}</span>
            <span class="incident-date">${dateincident}</span>
        </div>

        <div class="location-box">
            <span class="loc-icon">📍</span>
            <div class="loc-text">
                <div class="address">${escapeHtml(incident.address)}</div>
                <div class="coords">${incident.latitude}, ${incident.longitude}</div>
            </div>
        </div>

        <p class="description">${escapeHtml(incident.description)}</p>

        <div class="reporter-info">
            <img src="${incident.profilePhoto}" loading="lazy" alt="Profile" class="avatar" 
                 onerror="this.onerror=null; this.src='https://placehold.co/40x40/4f46e5/ffffff?text=${incident.userID}';">
            <span class="reporter-name">Reported by <a href='../public/userprofile.html?phoneNumber=${escapeHtml(incident.phoneNumber)}'><strong>${incident.firstName}</strong></a></span>
        </div>  
`;
    
if (user.role == 'admin') {cardDiv.innerHTML += `<button class="deletereport" onclick='deleteincident("incidentid${incident.incidentID}"); deletedataincident(${incident.incidentID})'>${bts}</button>`;}
    cardDiv.innerHTML += " </div>"

            fragment.appendChild(cardDiv);
        });

        container.innerHTML = ''; 

        container.appendChild(fragment); 
    

}





