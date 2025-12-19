const urlParams = new URLSearchParams(window.location.search);
const phoneNumber = urlParams.get('phoneNumber');
function erroruser(){
       document.body.insertAdjacentHTML('beforeend', `
        <style>
            @keyframes popupEntrance {
                from { opacity: 0; transform: scale(0.8); }
                to { opacity: 1; transform: scale(1); }
            }
        </style>

        <div id="error-popup" style="
            position: fixed;
            top: 0; 
            left: 0;
            width: 100%; 
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.6); 
            backdrop-filter: blur(4px);            
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;                        
            animation: popupEntrance 0.3s ease-out forwards;
        ">

            <div style="
                background-color: #ffffff;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.3);
                text-align: center;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 400px;
                width: 85%;
                border: 1px solid #eee;
            ">
                
                <div style="
                    width: 60px; height: 60px; 
                    background-color: #f8d7da; /* Light Red BG */
                    color: #842029;            /* Dark Red Text */
                    border-radius: 50%; display: flex; 
                    align-items: center; justify-content: center; 
                    margin: 0 auto 20px auto; font-size: 30px;
                ">✕</div>

                <h2 style="margin-top: 0; color: #333; margin-bottom: 10px;">Error!</h2>
                
                <p style="color: #666; margin-bottom: 30px; line-height: 1.5;">
                  User not found
                </p>

                <button style="
                    background-color: #dc3545; /* Red Button */
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    font-size: 16px;
                    border-radius: 6px;
                    cursor: pointer;
                    box-shadow: 0 4px 6px rgba(220, 53, 69, 0.2);
                    transition: background-color 0.2s;
                "
                onmouseover="this.style.backgroundColor='#bb2d3b'" 
                onmouseout="this.style.backgroundColor='#dc3545'"
                onclick=' window.location.href = "../public/index.html"';
                >
                    Go back to dashboard
                </button>
            </div>
        </div>
    `);
}
if (!phoneNumber){
    erroruser();
}
else{
     fetch('../api/getuser.php?show=true&phoneNumber='+phoneNumber.replace("+","%2B"))
     .then(response => response.json())
        .then(data => {
            if (data.message){
                erroruser();
                return;}
              checkuseraccount(data);
              userdetails(data);         })
.catch((error) => {
             console.error('Error:', error);
            erroruser();        });
}

function userdetails(user){
    document.getElementById('fullName').innerText = `${user.firstName} ${user.middleName ?? ''} ${user.lastName} ${user.suffix ?? ''}`;   
    const img = document.getElementById('profile-image');
    img.crossOrigin = "Anonymous";
    img.src = user.profilePhoto;
    document.getElementById('phoneNumberLABEL').innerText = user.phoneNumber;   
    document.getElementById('creation').innerText = "Joined IRAS: " +  prettyDateTimeManual(user.creation,true);
    img.onload = () => {
     document.getElementById('banner-color').style.backgroundColor = getDominantColorManual(img);
    };   
    loadIncidents('../api/getincidents.php?show=true&phoneNumber='+phoneNumber.replace("+","%2B"));


}

function prettyDateTimeManual(timestamp,withtime) {
    const date = new Date(timestamp);

    const datePart = date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const timePart = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', minute: '2-digit', hour12: true 
    });

    if (withtime) return `${datePart} ${timePart}`; 
    return datePart;
}

function getDominantColorManual(imageElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = imageElement.width;
    canvas.height = imageElement.height;
    
    ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const colorCounts = {};
    let maxCount = 0;
    let dominantColorHex = "";

    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 128) continue; 

        const hex = rgbToHex(r, g, b);

        if (!colorCounts[hex]) {
            colorCounts[hex] = 0;
        }
        colorCounts[hex]++;

        if (colorCounts[hex] > maxCount) {
            maxCount = colorCounts[hex];
            dominantColorHex = hex;
        }
    }

    return dominantColorHex;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

const loctitle = '(All Time)';
google.charts.load('current', {'packages':['corechart']});
function loadIncidents(url){
    fetch(url)
    .then(response => response.json())
    .then(data => {
        var incidents = Array.isArray(data) ? data : data.incidents;
        //console.log(incidents.length);
        
        tableincident = document.getElementById('reports-table-body');
        tablei = ''
        incidents.forEach(incident => {
            tablei += `<tr> 
            <td>${escapeHtml( shortit(incident.description))}</td>
             <td>${escapeHtml(shortit(incident.address))}</td>
              <td>${escapeHtml(incident.type)}</td>
               <td>${escapeHtml(prettyDateTimeManual(incident.occurredAt))}</td>`;
            if (incident.status != 'deleted'){
             tablei += `<td style='text-align:center;display:flex'> <button class='editbt' onclick='window.location.href = "editreportform.html?id=${incident.incidentID}"'>Edit</button><button class='deletebt'onclick='deletedataincident(${incident.incidentID})'>Delete</button> </td> </tr>`
            } else {
             tablei += `<td>${escapeHtml(incident.status)}</td> </tr>`
            }
        });
        tableincident.innerHTML = tablei
        incidents = incidents.filter(incident => 
            incident.status && incident.status.toLowerCase() !== 'deleted'
        );
        document.getElementById('monthReports').innerText = getCurrentMonthCount(incidents);

        document.getElementById('totalNumber').innerText = incidents.length;

        google.charts.setOnLoadCallback( () => {
                loadPieChart(incidents);
                loadBarChart(incidents);
            }   
            );

      
      
        }
    ) 
    .catch(error => {console.error(error);
        
            const barContainer = document.getElementById('barchart');
            barContainer.innerHTML = `
                <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">
                    <p>No data</p>
                </div>
            `;
            document.getElementById('piechart').innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#999;">
                    <h4 style="margin:0;">No Data Available</h4>
                    <p style="margin:5px 0 0 0; font-size:0.9em;">No data</p>
                </div>
            `;
            
            return;
    })
  


}

function shortit(text){
   
if (text.length > 40) {
    return text.slice(0, 40) + "...";
} 
return text;
}

function loadBarChart(incidents) {
    const validDates = [];
    incidents.forEach(incident => {
        const dateStr = incident.occurredAt;
        if (dateStr) {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                validDates.push(date);
            }
        }
    });

    if (validDates.length === 0) {
        document.getElementById('barchart').innerHTML = 
            '<div style="height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">No date data</div>';
        return;
    }

    const uniqueMonths = new Set(validDates.map(d => 
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    ));

    const useYearlyGrouping = uniqueMonths.size > 12;

    const counts = {};
    
    validDates.forEach(date => {
        let key;
        if (useYearlyGrouping) {
            key = date.getFullYear().toString();
        } else {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            key = `${year}-${month}`;
        }
        counts[key] = (counts[key] || 0) + 1;
    });

    const chartData = [[useYearlyGrouping ? 'Year' : 'Month', 'Incidents']];
    const sortedKeys = Object.keys(counts).sort();

    sortedKeys.forEach(key => {
        let label = key;
        
        if (!useYearlyGrouping) {
            const [year, month] = key.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, 1);
            label = dateObj.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        }

        chartData.push([label, counts[key]]);
    });
    const data = google.visualization.arrayToDataTable(chartData);

    const options = {
        title: `Incidents by ${useYearlyGrouping ? 'Year' : 'Month'} `,
        titleTextStyle: { color: '#333', fontSize: 16 },
        hAxis: { 
            title: useYearlyGrouping ? 'Year' : 'Month', 
            slantedText: true,
            textStyle: { fontSize: 12 }
        },
        vAxis: { 
            title: 'Number of Reports', 
            minValue: 0,
            format: '0', 
            gridlines: { count: -1 } 
        },
        legend: { position: 'none' },
       colors: ['#e67e22'],
        animation: { startup: true, duration: 1000, easing: 'out' },
        chartArea: {width: '100%', height: '100%', top: 50, left: 50, right: 20, bottom: 50},
    };

    const chart = new google.visualization.ColumnChart(document.getElementById('barchart'));
    chart.draw(data, options);
}

function getCurrentMonthCount(incidents) {
    const now = new Date();
    const currentMonth = now.getMonth(); 
    const currentYear = now.getFullYear();

    const currentMonthIncidents = incidents.filter(incident => {
        const dateStr = incident.occurredAt;
        
        if (!dateStr) return false;

        const incidentDate = new Date(dateStr);

        return !isNaN(incidentDate.getTime()) && 
               incidentDate.getMonth() === currentMonth && 
               incidentDate.getFullYear() === currentYear;
    });

    return currentMonthIncidents.length;
}

let origmsg;
function checkuseraccount(user){

    fetch('../api/loggedin.php')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'logged_in') {
            if (data.user.userID == user.userID){

                document.getElementById('otpdelete').innerText = 'Send OTP to ' + data.user.phoneNumber;
                origmsg =  'Send OTP to ' + data.user.phoneNumber;

                document.getElementById('myaccountonly').style.display = 'flex';
                Object.keys(user).forEach(key => {
                    //console.log(user[key]);
                const element = document.getElementById(key);
                if (element) {
                if (key === 'profilePhoto') {
                    //console.log("profilepic");
                }
                
                else {
                element.value = user[key];
        }
    }
});
            }

        }
        
    });
    document.getElementById('new-pass').value = '';

}

