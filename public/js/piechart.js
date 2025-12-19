const typeColors = {
    'Fire': '#EF4444',       
    'Assault': '#991B1B',    
    'Accident': '#F59E0B',   
    'Theft': '#8B5CF6',      
    'Flooding': '#3B82F6',   
    'Harassment': '#EC4899', 
    'Suspicious': '#6366F1', 
    'Other': '#9CA3AF',      
    'Road Damage': '#4B5563',
    'Waste Management': '#0891B2',
};
function loadPieChart(incidents) {
        const chartData = [['Incident Type', 'Count']];

        const typeCounts = {};
        incidents.forEach(incident => {
            const type = incident.type;
            if (typeCounts[type]) {
                typeCounts[type]++;
            } else {
                typeCounts[type] = 1;
            }
        });
        for (const [type, count] of Object.entries(typeCounts)) {
            chartData.push([type, count]);
        }
        var formatter = new Intl.NumberFormat('en-US');
        drawPieChart(chartData, formatter.format(incidents.length));
    }


function drawPieChart(chartDataArray,totalpie) {
    var data = google.visualization.arrayToDataTable(chartDataArray);

    var options = {
        title: 'Incidents by Type ' + loctitle + " (" + totalpie + " Reports) ",
        pieHole: 0.2,
        slices: {
          
        },
        tooltip: { isHtml: true },
        chartArea: {
            width: '100%', 
            height: '100%',top:30, left:20, right:20},
        legend: { position: 'right' },
        backgroundColor: 'transparent'
    };
    for (var i = 1; i < chartDataArray.length; i++) {
    var typeName = chartDataArray[i][0]; 
    if (typeColors[typeName]) {
        options.slices[i-1] = { color: typeColors[typeName] };
    }
}
    var chart = new google.visualization.PieChart(document.getElementById('piechart'));
    chart.draw(data, options);
}


