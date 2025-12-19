
        const locselect = document.getElementById('location');
        const customLocGroup = document.getElementById('custom-loc-group');
        const customLocInput = document.getElementById('location_select');

        const dateRangeSelect = document.getElementById('daterange');
        const startDateGroup = document.getElementById('start-date-group');
        const endDateGroup = document.getElementById('end-date-group');
        const startDateInput = document.getElementById('startdate');
        const endDateInput = document.getElementById('enddate');

        locselect.addEventListener('change', function() {
            if (this.value === 'custom_location') {
                customLocGroup.classList.remove('hidden');
                customLocInput.required = true;
            } else {
                customLocGroup.classList.add('hidden');
                customLocInput.required = false;
                customLocInput.value = '';
            }
        });

        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom_date') {
                startDateGroup.classList.remove('hidden');
                endDateGroup.classList.remove('hidden');
                startDateInput.required = true;
                endDateInput.required = true;
            } else {
                startDateGroup.classList.add('hidden');
                endDateGroup.classList.add('hidden');
                startDateInput.required = false;
                endDateInput.required = false;
                startDateInput.value = '';
                endDateInput.value = '';
            }
        });



 const locationSelect = document.getElementById('location');
            

            const urlParams = new URLSearchParams(window.location.search);
            
            const customLocationVal = urlParams.get('location_select');
            const locationVal = urlParams.get('location');
            const startDateVal = urlParams.get('startdate');
            const endDateVal = urlParams.get('enddate');
            const dateRangeVal = urlParams.get('daterange');
            const type = urlParams.get('type');
            
            const typeinput = document.getElementById('type');

            if (type){
                typeinput.value = type;
            }
            if (locationVal) {
                locationSelect.value = locationVal;
            }
            if (customLocationVal && locationSelect.value === 'custom_location') {
                customLocInput.value = customLocationVal;
                handleLocationChange();
            }

            if (dateRangeVal) {
                dateRangeSelect.value = dateRangeVal;
            }
            if (startDateVal && endDateVal && dateRangeSelect.value === 'custom_date') {
                startDateInput.value = startDateVal;
                endDateInput.value = endDateVal;
                handleDateChange();
            }


            function handleLocationChange() {
                if (locationSelect.value === 'custom_location') {
                    customLocGroup.classList.remove('hidden');
                    customLocInput.required = true;
                } else {
                    customLocGroup.classList.add('hidden');
                    customLocInput.required = false;
                    customLocInput.value = ''; 
                }
            }

            function handleDateChange() {
                if (dateRangeSelect.value === 'custom_date') {
                    startDateGroup.classList.remove('hidden');
                    endDateGroup.classList.remove('hidden');
                    startDateInput.required = true;
                    endDateInput.required = true;
                } else {
                    startDateGroup.classList.add('hidden');
                    endDateGroup.classList.add('hidden');
                    startDateInput.required = false;
                    endDateInput.required = false;
                    startDateInput.value = '';
                    endDateInput.value = '';
                }
            }

            locationSelect.addEventListener('change', handleLocationChange);
            dateRangeSelect.addEventListener('change', handleDateChange);