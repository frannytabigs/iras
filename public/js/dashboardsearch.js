let markerBig = null;

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
  
    //document.getElementById('searchResults').style.display = 'none';
    document.getElementById('searchResultsMap').style.display = 'none';
    customLocGroup.classList.remove('hidden');
    customLocInput.value = place.display_name;
    locationSelect.value = 'custom_location'
    updateAll(lat, lon,true);
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
    if (!searched) getAddress(lat, lon); 
    markerBig = syncMarker(mapbig, markerBig, lat, lon);
    mapbig.panTo([lat, lon]);

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
            customLocGroup.classList.remove('hidden');
            customLocInput.value = data.address.display_name;
            locationSelect.value = 'custom_location'

        }
    })
    .catch(error => console.error('Error:', error));
}

function handleMapClick(e) {
    updateAll(e.latlng.lat, e.latlng.lng);
}

