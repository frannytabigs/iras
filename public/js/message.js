function showErrorPopup(message,link="#") {
     const clickActionError = (link === '#' || link === '') 
        ? `document.getElementById('error-popup').remove()` 
        : `window.location.href='${link}'`;
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
                    ${message}
                </p>

                <button    onclick="${clickActionError}" style="
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
                >
                    Try Again
                </button>
            </div>
        </div>
    `);
}

function showSuccessPopup(message, link = '#') {
    const clickAction = (link === '#' || link === '') 
        ? `document.getElementById('custom-popup').remove()` 
        : `window.location.href='${link}'`;

    document.body.insertAdjacentHTML('beforeend', `
    <style>
        @keyframes popupEntrance {
            from { opacity: 0; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1); }
        }
    </style>

    <div id="custom-popup" style="
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
                width: 60px; height: 60px; background-color: #d1e7dd; 
                color: #0f5132; border-radius: 50%; display: flex; 
                align-items: center; justify-content: center; 
                margin: 0 auto 20px auto; font-size: 30px;
            ">✓</div>

            <h2 style="margin-top: 0; color: #333; margin-bottom: 10px;">${message}</h2>

            <button style="
                background-color: #007bff;
                color: white;
                border: none;
                padding: 12px 30px;
                font-size: 16px;
                border-radius: 6px;
                cursor: pointer;
                box-shadow: 0 4px 6px rgba(0, 123, 255, 0.2);
                transition: background-color 0.2s;
            "
            onmouseover="this.style.backgroundColor='#0056b3'" 
            onmouseout="this.style.backgroundColor='#007bff'"
            onclick="${clickAction}"
            >
               Continue
            </button>
        </div>
    </div>`);
}


function goback() {
    if (document.referrer !== "" && window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'home.html'; 
    }
}