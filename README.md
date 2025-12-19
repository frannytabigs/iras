Download Source Code "IRAS"

The Incident Reporting and Awareness System (IRAS) is a web-based crowdsourcing platform that utilizes a
3-tier architecture to empower users to report and track real-time incidents like crimes and accidents.
The system is capable of converting geospatial coordinates into addresses, sending secure OTPs via SMS,
and generating data visualizations to support public safety and data-driven governance. The following
information below will give you a guide on how to set up using the given source code...

Before getting started, make sure you have the following things installed:
XAMPP https://www.apachefriends.org/
Visual Studio Code https://code.visualstudio.com/
Git https://git-scm.com/
Github https://github.com/


SETTING UP USING THE ZIP file source code.

To try/access the source code file, do the following:

1. Make sure to download XAMPP.

2. Use VSCode as text editor/ide.

3. Download the IRAS zip file.

4. Extract the file and copy "IRAS" folder

6. Paste inside root directory/ where you install xammp (local disk C: drive D: drive E:)

7. Open PHPMyAdmin (http://localhost/phpmyadmin).

8. Create a database with name iras. 

6. Import iras.sql file(given inside the zip package in SQL file folder)

7.Run the script http://localhost/iras


SETTING UP THE REPOSITORY IN YOUR IDE (VSCode) and DATABASE SETUP STEPS.

To clone a repository, do the following:

1. Log in to your Github account.

2. Go to the Repository on Github you want to clone.

3. Click the Green button in the upper right side with the text "Code"

4. Copy the URL of the repository (HTTPS Section).

5. Open VSCode.

6. Click the source Control in VSCode or click Ctrl + Shift + G.

7. Click the Clone Repository. (You can't find this button if you forgot to install git in your device).

8. Paste the URL and press enter.

9. Select the Location/folder where you want to store the files/ Add new file and name it.

10. Click "Select as Repository destination"

11. Click "Open in New Window"

12. The repository is cloned successfully.


To set up the database, do the following: 

13. Open PHPMyAdmin (http://localhost/phpmyadmin).

14. Create a new database named iras. 

15. Import iras.sql file located in the root directory.

16.Run the script http://localhost/iras


API CONFIGURATION
Important: You need your own API keys for the system to work. 
Tip: Get your API keys in textbee.dev and you can get your map api keys in locationiq.com

1.	Navigate to the iras/api/ folder.

2.	Open config.php and update it with your credentials:
    'api_key' => 'YOUR_TEXTBEE_API_KEY',
    'device_id' => 'YOUR_TEXTBEE_DEVICE_ID',
    'base_url' => 'https://api.textbee.dev/api/v1',
    'mapapikey' => 'YOUR_LOCATIONIQ_API_KEY' 


HOW TO USE IRAS AS A USER 

1. If you are directed in the Homepage, click the "Join Now" button. 

2. Sign Up:
   
    - If you don't have an account, sign up and fill out the form.  
    - Provide your phone number to receive a One-Time Password (OTP) via SMS (powered by TextBee API).
    - If you received the OTP, put it in the provided place holder.
    - Finally, click "CREATE ACCOUNT"

3. Log In: 

    - Provide your phone number in the Phone Number placeholder.
    - Provide your password.
    - Click "LOG IN"
    - Finally, you can now access the Website. 
 
4. Report an Incident:

    - Click the Report Menu
    - Fill out the report form with the incident type and description.
    - The system uses the LocationIQ API to automatically turn your GPS coordinates into a human-readable address.

5. Analytics/Dashboard: 

    - Check the dashboard to see summarized incident data in your area.
    - As a user, you can monitor trends but you cannot edit or delete any reports.

HOW TO USE IRAS AS AN ADMIN    

DEFAULT ADMIN ACCOUNT
    Username/Phone Number:
    IRAS

    Password:
    IRASadmin123

1. Click the "Join Now" button.

2. Use the default admin account to log in.

3. Report an incident:
     - The system uses the LocationIQ API to automatically turn your GPS coordinates into a human-readable address.

4. Analytics/Dashboard:
    - Check the dashboard to see summarized incident data in your area.
    - As an admin, you can monitor trends. 
        Access the summarized data visualized through Google Charts (Pie, Column, and Line charts) to identify high-risk areas.
    - Manage Records
        Oversee the incident database to ensure information is accurate for civic engagement and decision-making.
    - Edit & Delete
        An admin can edit a report, can replace the photo evidence, and can also delete reports that is unappropriate or considered as scam.


SIR PAPASARA MI SIRRRRRR HUHUHU PLEASE LANG
AY OA HAHAHAHAA
