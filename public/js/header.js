function loadHTML(url, elementId) {
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.error('Error loading component:', error));
}

loadHTML('header.html', 'main-header');

function toggle(id,display){
    var element = document.getElementById(id);
    if(element.style.display === display){
        element.style.display = 'none';
    }
    else{element.style.display = display;}
}

toggle ('main-header', 'block')