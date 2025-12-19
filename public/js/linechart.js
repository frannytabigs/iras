
function loadLineBarChart(incidents) {
   
        const monthlyCounts = {};

        incidents.forEach(incident => {
            const date = new Date(incident.occurredAt);
            const year = date.getFullYear(); 
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const monthKey = `${year}-${month}`; 

            if (monthlyCounts[monthKey]) {
                monthlyCounts[monthKey]++;
            } else {
                monthlyCounts[monthKey] = 1;
            }
        });

        
        const availableKeys = Object.keys(monthlyCounts).sort();
        const startKey = availableKeys[0];
        const endKey = availableKeys[availableKeys.length - 1];

        let loopDate = new Date(startKey + "-01");
        const endDate = new Date(endKey + "-01");
        var tt = Object.keys(monthlyCounts).length > 12;
      
        const chartData = [['Month', 'Incidents']];
        const allMonthsFilled = []; 
        while (loopDate <= endDate) {
            
            const y = loopDate.getFullYear();
            const m = String(loopDate.getMonth() + 1).padStart(2, '0');
            const currentKey = `${y}-${m}`;

            const count = monthlyCounts[currentKey] || 0;

            let label = "";
            if (tt) {
                label = loopDate.toLocaleDateString('en-US', { month: 'short', year:'numeric'});
            } else {
                label = loopDate.toLocaleDateString('en-US', { month: 'short'});
            }

            chartData.push([label, count]);
            
            allMonthsFilled.push(currentKey);

            loopDate.setMonth(loopDate.getMonth() + 1);
        }

        const dataTable = google.visualization.arrayToDataTable(chartData);

        var s = allMonthsFilled[0]; 
        var [x, y] = s.split('-');
        var dateObj = new Date(x, y - 1, 1);
        var yearstart = dateObj.toLocaleDateString('en-US', { year: 'numeric', month:'short' });

        s = allMonthsFilled.at(-1); 
        var [x, y] = s.split('-');
        var dateObj = new Date(x, y - 1, 1);
        var yearend = dateObj.toLocaleDateString('en-US', { year: 'numeric', month:'short' });

        var safeTitle = (typeof title !== 'undefined') ? title : "";
        var safeLocTitle = (typeof loctitle !== 'undefined') ? loctitle : "";
        var formatter = new Intl.NumberFormat('en-US');

        const options = {
            title: 'Incident Reports of ' +  yearstart + ' to ' + yearend + " " + safeTitle + " " + safeLocTitle + " (" + formatter.format(incidents.length) + " Reports) ",
            legend: { position: 'bottom' },
            tooltip: { isHtml: true },
            hAxis: { title: 'Month' },
            vAxis: { title: 'Number of Reports', minValue: 0 },
            pointSize: 5, 
            colors: ['#4f46e5'], 
            chartArea: { width: '100%', height: '100%', top:50, left:50, right:20, bottom:45 },
            backgroundColor: 'transparent',
            animation: { startup: true, duration: 1000, easing: 'out' }
        };

        const chart = new google.visualization.LineChart(document.getElementById('linechart'));
        chart.draw(dataTable, options);


        drawDailyBarChart(allMonthsFilled.at(-1), incidents);

        google.visualization.events.addListener(chart, 'select', function() {
            const selection = chart.getSelection();
            
            if (selection.length > 0) {
                const row = selection[0].row;
                var selectedMonthKey = allMonthsFilled[row]; 
                
                drawDailyBarChart(selectedMonthKey, incidents);
                document.getElementById('barchart').scrollIntoView({'block':'end'});
            }
        }); 

    
}
