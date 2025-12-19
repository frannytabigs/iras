
let mapbig;

function loadmaphtml(id){
    const map = L.map(id).setView([10.3233, 123.9411], 14); 
map.locate({ setView: true, maxZoom: 20});
map.on('locationfound', function(e) {
    L.circleMarker(e.latlng).addTo(map).bindPopup("You are here").openPopup();
});
map.on('locationerror', function(e) {
    console.log("Location access denied or not available.");
});
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 20,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
mapbig = map;
mapbig.on('click', handleMapClick);
return map;
}

function loadMap(incidents,id) {
        const map = loadmaphtml(id);
        map.setView([incidents[0].latitude,incidents[0].longitude],16);
        incidents.forEach(incident => {
            const dateStr = prettyDateTimeManual(incident.occurredAt,true);
            
            const typeKey = incident.type.toLowerCase().split(' ')[0];
            const pinClass = `pin-${typeKey}`; 

            const customIcon = L.divIcon({
                className: '', 
                html: `<div class="custom-pin ${pinClass}"><i></i></div>`, 
                iconSize: [30, 42],
                iconAnchor: [15, 42], 
                popupAnchor: [0, -35]
            });

            L.marker([incident.latitude, incident.longitude], { icon: customIcon })
             .addTo(map)
             .bindPopup(`
                <div style="text-align:center;">
                    <strong style="color:var(--primaryColor); text-transform:uppercase;">${incident.type}</strong>
                    <br>
                    <span style="font-size:0.8em; color:#666;">${dateStr}</span>
                    <br>
                    <div style="margin-top:5px; font-size:0.85em;">${incident.address} <br> Reported by ${incident.firstName} (${incident.phoneNumber})</div>
                </div>
             `);
             });

    
    
} 

