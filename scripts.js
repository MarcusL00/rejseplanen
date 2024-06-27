function getData(query) {
    let baseUrl = 'https://xmlopen.rejseplanen.dk/bin/rest.exe/';
    let argument = 'location?input=';
    let apiURL = `${baseUrl}${argument}${query}&format=json`;

    return fetch(apiURL)
        .then(response => response.json());
}

document.getElementById('location').addEventListener('input', function() {
    handleAutocomplete(this.value, 'location-suggestions', 'location');
});

document.getElementById('destination').addEventListener('input', function() {
    handleAutocomplete(this.value, 'destination-suggestions', 'destination');
});

function handleAutocomplete(query, suggestionsContainerId, inputId) {
    if (query.length > 2) {
        getData(query).then(data => {
            if (data.LocationList.StopLocation) {
                displaySuggestions(data.LocationList.StopLocation, suggestionsContainerId, inputId);
            } else {
                clearSuggestions(suggestionsContainerId);
            }
        });
    } else {
        clearSuggestions(suggestionsContainerId);
    }
}

function displaySuggestions(suggestions, suggestionsContainerId, inputId) {
    let suggestionsContainer = document.getElementById(suggestionsContainerId);
    clearSuggestions(suggestionsContainerId);
    suggestions.forEach(suggestion => {
        let div = document.createElement('div');
        div.classList.add('suggestion-item');
        div.textContent = suggestion.name;
        div.dataset.id = suggestion.id;
        div.addEventListener('click', function() {
            document.getElementById(inputId).value = suggestion.name;
            document.getElementById(inputId).dataset.id = suggestion.id;
            clearSuggestions(suggestionsContainerId);
        });
        suggestionsContainer.appendChild(div);
    });
}

function clearSuggestions(suggestionsContainerId) {
    let suggestionsContainer = document.getElementById(suggestionsContainerId);
    while (suggestionsContainer.firstChild) {
        suggestionsContainer.removeChild(suggestionsContainer.firstChild);
    }
}

document.getElementById('trip-form').addEventListener('submit', function(event) {
    event.preventDefault();
    let originId = document.getElementById('location').dataset.id;
    let destinationId = document.getElementById('destination').dataset.id;
    
    if (originId && destinationId) {
        fetchTripData(originId, destinationId);
    } else {
        alert('Please select both origin and destination from suggestions.');
    }
});

function fetchTripData(originId, destinationId) {
    let baseUrl = 'https://xmlopen.rejseplanen.dk/bin/rest.exe/';
    let tripEndpoint = 'trip?';
    let apiURL = `${baseUrl}${tripEndpoint}originId=${originId}&destId=${destinationId}&format=json`;

    fetch(apiURL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('API Response:', data);
            displayTrips(data.TripList.Trip);
        })
        .catch(error => {
            console.error('Error fetching trip data:', error);
        });
}

function displayTrips(trips) {
    if(trips === 0) {
        return;
    }

    trips.forEach(trip => {
        console.log(trip);
        displayTripData(trip)
    })
}

function displayTripData(data) {

    console.log('Trip Data:', data);

    if (data.Leg) {
        const megafarmand = Array.from(data.Leg);
        const farmand = megafarmand.map((transport) => {
            return `
            <div class="transport">
            <div class="top">
              <p>${transport.Origin.time}</p>
              <p>${transport.Origin.name}</p>
              <p>${
                transport.Origin.rtTrack ? `spor ${transport.Origin.rtTrack}` : ' '
              }</p>
            </div>
            <div class='type-container'>
              <div class="type-transport"></div>
              <h4>${transport.type}</h4>
            </div>
            <div class="bottom">
              <p>${transport.Destination.time}</p>
              <p>${transport.Destination.name}</p>
              <p>${
                transport.Destination.rtTrack
                  ? `spor ${transport.Destination.rtTrack}`
                  : ' '
              }</p>
            </div>
          </div> 
           ` 
        });

        farmand.forEach(transport => {
            $('#trip-output').append(transport)
        });
    } else {
        tripOutput.innerHTML = '<p>No trips found.</p>';
        console.error('TripList or Trip is missing or not an array:', data.TripList);
    }
}