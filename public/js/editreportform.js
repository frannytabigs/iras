let markerBig = null;
let markerMobile = null;

let mapbigform = loadmaphtml('map');
let mapmobile = loadmaphtml('mapmobile');

const searchOverlay = document.getElementById('search-overlay');
if (searchOverlay) {
    L.DomEvent.disableClickPropagation(searchOverlay);
    L.DomEvent.disableScrollPropagation(searchOverlay);
}

function setupSearch(inputId, listId) {
    const input = document.getElementById(inputId);
    const resultsList = document.getElementById(listId);
    let debounceTimer;

    if (!input || !resultsList) return;

    input.addEventListener('input', function() {
        const query = this.value;
        clearTimeout(debounceTimer);
        if (query.length < 3) {
            resultsList.style.display = 'none';
            return;
        }
        debounceTimer = setTimeout(() => fetchSuggestions(query, resultsList), 300);
    });

    document.addEventListener('click', function(e) {
        if (e.target !== input && e.target !== resultsList) {
            resultsList.style.display = 'none';
        }
    });
}

setupSearch('addressSearch', 'searchResults');       
setupSearch('addressSearchMap', 'searchResultsMap'); 

function fetchSuggestions(query, listElement) {
    const formData = new URLSearchParams();
    formData.append('q', query);

    fetch(`../api/map.php`, {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        listElement.innerHTML = '';
        if (data.length > 0) {
            listElement.style.display = 'block';
            data.forEach(place => {
                const li = document.createElement('li');
                
                li.className = 'search-result-item'; 
                
                li.innerHTML = `
                    <span>${place.display_name}</span>
                `;

                li.addEventListener('click', () => selectPlace(place));
                listElement.appendChild(li);
            });
        } else {
            listElement.style.display = 'none';
        }
    });
}

function selectPlace(place) {
    const lat = parseFloat(place.lat);
    const lon = parseFloat(place.lon);

    const inputForm = document.getElementById('addressSearch');
    const inputMap = document.getElementById('addressSearchMap');
    
    if(inputForm) inputForm.value = place.display_name;
    if(inputMap) inputMap.value = place.display_name;

    document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResultsMap').style.display = 'none';

    updateAll(lat, lon, true);
}

function updateLocationDisplay(lat, lon) {
    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;
}

function syncMarker(map, marker, lat, lon) {
    if (marker) {
        marker.setLatLng([lat, lon]);
        return marker;
    } else {
        const newMarker = L.marker([lat, lon], { draggable: true }).addTo(map);
        newMarker.on('dragend', function(e) {
            const c = e.target.getLatLng();
            updateAll(c.lat, c.lng); 
        });
        return newMarker;
    }
}

function updateAll(lat, lon, searched=false) {
    updateLocationDisplay(lat, lon);
    if (!searched) getAddress(lat, lon); 
    markerBig = syncMarker(mapbigform, markerBig, lat, lon);
    markerMobile = syncMarker(mapmobile, markerMobile, lat, lon);
    mapbigform.panTo([lat, lon]);
    mapmobile.panTo([lat, lon]);
}

function getAddress(lat, lon) {
    const formData = new URLSearchParams();
    formData.append('lat', lat);
    formData.append('lon', lon);
    formData.append('reverse', true);
    
    fetch(`../api/map.php`, {
        method: 'POST',  
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        const inputForm = document.getElementById('addressSearch');
        const inputMap = document.getElementById('addressSearchMap');
        if (data.status === 'success' && data.address.display_name) {
            if(inputForm) inputForm.value = data.address.display_name;
            if(inputMap) inputMap.value = data.address.display_name;
        }
    })
    .catch(error => console.error('Error:', error));
}

function handleMapClick(e) {
    updateAll(e.latlng.lat, e.latlng.lng);
}

mapbigform.on('click', handleMapClick);
mapmobile.on('click', handleMapClick);


const form = document.getElementById('reportform');
form.addEventListener('submit', function(e) {
    e.preventDefault();
    const file = document.getElementById('evidence');
    const formData = new FormData(form);
    
    const incidentDate = document.getElementById('incidentDate').value;
    const incidentTime = document.getElementById('incidentTime').value;
    const generalAddress = document.getElementById('addressSearch').value || document.getElementById('addressSearchMap').value;
    const specificAddress = document.getElementById('address').value;
    const fullAddress = `${generalAddress}, ${specificAddress}`;
    const occuredAt = `${incidentDate} ${incidentTime}`;
    console.log(occuredAt);
    formData.append('occurredAt', occuredAt);
    formData.append('address', fullAddress);
    formData.append('latitude', document.getElementById('latitude').value);
    formData.append('longitude', document.getElementById('longitude').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('type', document.getElementById('incidentType').value);
    formData.append('incidentID', document.getElementById('incidentID').value);


    formData.append('photo', file.files[0]);
    
    const submitBtn = document.getElementById('submitReport');
    submitBtn.textContent = "Editing...";
    submitBtn.disabled = true;

    fetch('../api/editincident.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status) {
            showErrorPopup(data.message);
        } else {
            showSuccessPopup(`Report Edited Successfully!`,'../public/userprofile.html?phoneNumber='+data[0].phoneNumber.replace("+","%2B"));
            form.reset(); 
            const fileLabel = document.querySelector('label[for="evidence"]');
            fileLabel.textContent = "Drag & Drop Photo"; 
            fileLabel.style.backgroundColor = "";
            fileLabel.style.border = "";
            fileLabel.classList.remove('highlight');
            document.getElementById('addressSearch').value = "";
            document.getElementById('addressSearchMap').value = "";
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showErrorPopup('Failed to edit the report! Please refresh the page and try again');
    })
    .finally(() => {
        submitBtn.textContent = "Edit Report";
        submitBtn.disabled = false;
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.querySelector('label[for="evidence"]');
    const fileInput = document.getElementById('evidence');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) { dropZone.classList.add('highlight'); }
    function unhighlight(e) { dropZone.classList.remove('highlight'); }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }

    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            if (!file.type.startsWith('image/')) {
                showErrorPopup("Only image file is allowed")
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                dropZone.innerHTML = ''; 
                const img = document.createElement('img');
                img.src = e.target.result; 
                img.alt = "Evidence Preview";
                dropZone.appendChild(img);
                dropZone.classList.add('highlight');
            };
            reader.readAsDataURL(file);
        }
    });
}); 
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.querySelector('label[for="evidence"]');
    const fileInput = document.getElementById('evidence');

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) { dropZone.classList.add('highlight'); }
    function unhighlight(e) { dropZone.classList.remove('highlight'); }

    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }

    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            const file = this.files[0];
            if (!file.type.startsWith('image/')) {
                showErrorPopup("Only image file is allowed")
                return;
            }
            const reader = new FileReader();
            reader.onload = function(e) {
                dropZone.innerHTML = ''; 
                const img = document.createElement('img');
                img.src = e.target.result; 
                img.alt = "Evidence Preview";
                dropZone.appendChild(img);
                dropZone.classList.add('highlight');
            };
            reader.readAsDataURL(file);
        }
    });
}); 
      
       
       
      
  


   
const urlParams = new URLSearchParams(window.location.search);
const incidentID = urlParams.get('id') ?? null;
const incidentIDtype = document.getElementById('incidentID');

if (!incidentID){
    showErrorPopup("No Incident to edit",'index.html');
}
else{
    incidentIDtype.value = incidentID;
    fetch('../api/getincidents.php?show=true&id='+incidentID)
    .then(response => response.json())
    .then(data => {
        //console.log(data);
        var incidents = Array.isArray(data) ? data : data.incidents;
       

    fetch('../api/loggedin.php')
    .then(response => response.json())
    .then(data => {
        //console.log(data.user.role);
        if (data.status !== 'logged_in') {
            showErrorPopup(`Log in first to edit an incident`,'log_in.html');
        }
        if ((data.user.phoneNumber != incidents[0].phoneNumber) && data.user.role != 'admin'){
            showErrorPopup(`You can only edit your own reported incident`,'reportForm.html');
        }
        else {editincident(incidents);}
        
    });

        
        }
    ) 
    .catch(error => {console.error(error);
        showErrorPopup("No Incident to edit",'index.html')
    })
    
}

function editincident(incident){
    document.getElementById('oldphoto').src = incident[0].photo;
    document.getElementById('latitude').value = incident[0].latitude;
    document.getElementById('longitude').value = incident[0].longitude;
    getAddress(incident[0].latitude,incident[0].longitude);
    updateAll(incident[0].latitude,incident[0].longitude);
    document.getElementById('description').value = incident[0].description;
    document.getElementById('incidentType').value = incident[0].type;
    const dbTimestamp = incident[0].occurredAt;
    const [datePart, timePart] = dbTimestamp.split(' ');
    document.getElementById('incidentDate').value = datePart;
    document.getElementById('incidentTime').value = timePart.substring(0, 5);
}
       
      
  



