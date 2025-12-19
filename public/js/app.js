function toggle(id,display){
    var element = document.getElementById(id);
    if(element.style.display === display){
        element.style.display = 'none';
    }
    else{element.style.display = display;}
}


function prettyDateTimeManual(timestamp,withtime) {
    const date = new Date(timestamp);
    //console.log(timestamp);
    //console.log(date);
    const datePart = date.toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
    });
    
    const timePart = date.toLocaleTimeString('en-US', { 
        hour: 'numeric', minute: '2-digit', hour12: true 
    });

    if (withtime) return `${datePart} ${timePart}`; 
    return datePart;
}


function getDynamicDates() {
    const now = new Date();

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const todayStart = new Date(now);
    const todayEnd = new Date(now);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const dayOfWeek = now.getDay(); 
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - dayOfWeek); 
    
    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 7); 
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    
    const lastWeekEnd = new Date(thisWeekStart); 

   
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

 
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const thisYearEnd = new Date(now.getFullYear() + 1, 0, 1);

    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear(), 0, 1);

    return {
        "today":      `start_time=${formatDate(todayStart)}&end_time=${formatDate(todayEnd)}`,
        
        "thisweek":   `start_time=${formatDate(thisWeekStart)}&end_time=${formatDate(thisWeekEnd)}`,
        "lastweek":   `start_time=${formatDate(lastWeekStart)}&end_time=${formatDate(lastWeekEnd)}`,
        
        "thismonth":  `start_time=${formatDate(thisMonthStart)}&end_time=${formatDate(thisMonthEnd)}`,
        "lastmonth":  `start_time=${formatDate(lastMonthStart)}&end_time=${formatDate(lastMonthEnd)}`,
        
        "thisyear":   `start_time=${formatDate(thisYearStart)}&end_time=${formatDate(thisYearEnd)}`,
        "lastyear":   `start_time=${formatDate(lastYearStart)}&end_time=${formatDate(lastYearEnd)}`
    };
}

function addOneDay(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);

    const date = new Date(year, month - 1, day);

    date.setDate(date.getDate() + 1);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');

    return `${newYear}-${newMonth}-${newDay}`;
}

var argsdate = getDynamicDates();
const baseUrl = '../api/getincidents.php';
const params = new URLSearchParams({ show: 'true' });
if (startDateVal && endDateVal) {
    params.set('start_time', startDateVal);
    params.set('end_time', addOneDay(endDateVal)); 
} 
else if (dateRangeVal === 'alltime') {
} 
else if (dateRangeVal && argsdate[dateRangeVal]) {
    const rangeParams = new URLSearchParams(argsdate[dateRangeVal]);
    params.set('start_time', rangeParams.get('start_time'));
    params.set('end_time', rangeParams.get('end_time'));
} 
else {
    const defaultParams = new URLSearchParams(argsdate['thisyear']);
    params.set('start_time', defaultParams.get('start_time'));
    params.set('end_time', defaultParams.get('end_time'));
}

let loctitle = "";
if (customLocationVal) {
    params.set('location', customLocationVal);
    loctitle = `(${customLocationVal.toUpperCase()})`;
}

let title = "(All Types)";
if (type && type !== "alltype") {
    params.set('type', type);
    title = `(${type.toUpperCase()})`;
}

const urlapiincident = `${baseUrl}?${params.toString()}`;

const defaultParamsStr = new URLSearchParams({ show: 'true' });
const defParams = new URLSearchParams(argsdate['thisyear']);
defaultParamsStr.set('start_time', defParams.get('start_time'));
defaultParamsStr.set('end_time', defParams.get('end_time'));

const isDefaultState = params.toString() === defaultParamsStr.toString();

if (isDefaultState && window.location.search.length > 0) {
    window.location.href = window.location.pathname;
}
//console.log(urlapiincident);

google.charts.load('current', {'packages':['corechart']});
function loadIncidents(url){
    fetch(url)
    .then(response => response.json())
    .then(data => {
        var incidents = Array.isArray(data) ? data : data.incidents;
        //console.log(incidents.length);
        
       
        loadReportCards(incidents); 
        incidents = incidents.filter(incident => 
            incident.status && incident.status.toLowerCase() !== 'deleted'
        );

        google.charts.setOnLoadCallback( () => {
                loadLineBarChart(incidents); 
                loadPieChart(incidents) ;
            }
            );
        loadMap(incidents,'map');

        chagedatetitle(incidents.at(-1).occurredAt , incidents[0].occurredAt);
      
        }
    ) 
    .catch(error => {console.error(error);
         loadmaphtml('map');
         const lineContainer = document.getElementById('linechart');
            lineContainer.innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#999;">
                    <h4 style="margin:0;">No Trends Available</h4>
                    <p style="margin:5px 0 0 0; font-size:0.9em;">No reported incidents to show with that criteria.</p>
                </div>
            `;
            const barContainer = document.getElementById('barchart');
            barContainer.innerHTML = `
                <div style="height:100%; display:flex; align-items:center; justify-content:center; color:#ccc;">
                    <p>Select criteria to view daily breakdown</p>
                </div>
            `;
            document.getElementById('piechart').innerHTML = `
                <div style="height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#999;">
                    <h4 style="margin:0;">No Data Available</h4>
                    <p style="margin:5px 0 0 0; font-size:0.9em;">No reported incidents to show with that criteria.</p>
                </div>
            `;
            
            return;
    })
    .finally(() => {
        setTimeout(() => {
            var preloader = document.getElementById('preloader');
            preloader.classList.add('loaded');

        }, 1000)}
    )


}

function chagedatetitle(firstdate, lastdate){
    document.getElementById('chart-date-label').innerHTML = prettyDateTimeManual(firstdate) + " to " + prettyDateTimeManual(lastdate);
}

function scrolltoelement(classname){
   var elements = document.querySelectorAll('.'+ classname);
  
   elements[0].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'end' 
    });

    elements.forEach(element => {
      element.classList.remove('highlight-anim');
      void element.offsetWidth; 
      element.classList.add('highlight-anim');
    });
}





loadIncidents(urlapiincident); 




const myButton = document.getElementById("scrollToTopBtn");

window.onscroll = function() {
  scrollFunction();
};

function scrollFunction() {
  if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
    myButton.classList.add("showBtn");
  } else {
    myButton.classList.remove("showBtn");
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth' 
  });
}