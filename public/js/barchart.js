function drawDailyBarChart(monthKey, incidents) {

    const [yearStr, monthStr] = monthKey.split('-');
    const dateObj = new Date(yearStr, monthStr - 1, 1);
    const monthName = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const fullDateLabel = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const filteredData = incidents.filter(incident => {
    const date = new Date(incident.occurredAt);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}` === monthKey;
    });

    const daysInMonth = new Date(yearStr, monthStr, 0).getDate();
    const dailyCounts = {};

    for (let i = 1; i <= daysInMonth; i++) {
        dailyCounts[i] = 0;
    }

    filteredData.forEach(incident => {
        const date = new Date(incident.occurredAt);
        const day = date.getDate();
        dailyCounts[day]++;
    });



    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'Day');
    dataTable.addColumn('number', 'Incidents');


    for (let i = 1; i <= daysInMonth; i++) {
        dataTable.addRow([String(i), dailyCounts[i]]);
    }

    var safeTitle = (typeof title !== 'undefined') ? title : "";
    var safeLocTitle = (typeof loctitle !== 'undefined') ? loctitle : "";
    var formatter = new Intl.NumberFormat('en-US');

    const options = {
        title: `Incidents of ${fullDateLabel} ${safeTitle} ${safeLocTitle} (${formatter.format(filteredData.length)} Reports)`,  
        legend: { position: 'none' },
        tooltip: { isHtml: true },
        hAxis: {
            title: `Day of ${monthName}`        
        },
        vAxis: { title: 'Number of Reports', minValue: 0, format: '0' },
        colors: ['#e67e22'],
        animation: { startup: true, duration: 1000, easing: 'out' },
        chartArea: {width: '100%', height: '100%', top: 50, left: 50, right: 20, bottom: 50},
    };
    const chart = new google.visualization.ColumnChart(document.getElementById('barchart'));
    chart.draw(dataTable, options);
    google.visualization.events.addListener(chart, 'select', function() {
            var monthclass =  'month' + fullDateLabel.toLowerCase().substring(0,3);
            scrolltoelement(monthclass);
        }); 

}