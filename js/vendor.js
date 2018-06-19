// Get new js calls

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        mapTypeControl: false,
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13
    });

    new AutocompleteDirectionsHandler(map);
}

function AutocompleteDirectionsHandler(map) {
    this.map = map;
    this.originPlaceId = null;
    this.destinationPlaceId = null;
    this.travelMode = 'WALKING';
    var originInput = document.getElementById('origin-input');
    var destinationInput = document.getElementById('destination-input');
    var modeSelector = document.getElementById('mode-selector');
    this.directionsService = new google.maps.DirectionsService;
    this.directionsDisplay = new google.maps.DirectionsRenderer;
    this.directionsDisplay.setMap(map);

    var originAutocomplete = new google.maps.places.Autocomplete(
        originInput, { placeIdOnly: true });
    var destinationAutocomplete = new google.maps.places.Autocomplete(
        destinationInput, { placeIdOnly: true });

    this.setupClickListener('changemode-walking', 'WALKING');
    this.setupClickListener('changemode-transit', 'TRANSIT');
    this.setupClickListener('changemode-driving', 'DRIVING');

    this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
    this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
}

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete. ("This" is redefined by choosing a tavel mode.)
AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
    var radioButton = document.getElementById(id);
    var me = this;
    radioButton.addEventListener('click', function () {
        me.travelMode = mode;
        me.route();
    });
};
// This "me" is redefined for the place selected. If not origin, it is the destination. This is function for destination. 
AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
    var me = this;
    autocomplete.bindTo('bounds', this.map);
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        if (!place.place_id) {
            window.alert("Please select an option from the dropdown list.");
            return;
        }
        if (mode === 'ORIG') {
            me.originPlaceId = place.place_id;
        } else {
            me.destinationPlaceId = place.place_id;
        }
        me.route();
    });

};

AutocompleteDirectionsHandler.prototype.route = function () {
    if (!this.originPlaceId || !this.destinationPlaceId) {
        return;
    }
    var me = this;

    this.directionsService.route({
        origin: { 'placeId': this.originPlaceId },
        destination: { 'placeId': this.destinationPlaceId },
        travelMode: this.travelMode
    }, function (response, status) {
        if (status === 'OK') {
            me.directionsDisplay.setDirections(response);
        } else {
            window.alert('Directions request failed due to ' + status);
        }
    });
};

// Create object to store location data and find midpoint
let meet = {
    origin: [],
    destination: [],
    findMiddle: function () {
        // We are flat Earthers
        this.theMiddle.lat = (this.origin[0] + this.destination[0]) / 2;
        this.theMiddle.lng = (this.origin[1] + this.destination[1]) / 2;
    },
    theMiddle: {},
}

// Create click event
$("button").click(function () {
    // Get user input and store
    const myLoc = $("#origin-input").val();
    const friendLoc = $("#destination-input").val();

    // Store google api key
    const googleAPI = "AIzaSyAZ73W29ubLVV9YoW1dsMyob-ZlEiZWoPs";

    // Create function to make API request and get location data
    function getLatLng(query, person) {
        // Concatenate query url
        const URL = "https://maps.googleapis.com/maps/api/geocode/json?" +
            "address=" + query +
            "&key=" + googleAPI;
        // console.log(URL);

        // Make API request
        $.ajax({
            url: URL,
            method: "GET",
        }).then(function (response) {
            // console log response
            console.log(response);

            // Store lat lng coords
            if (person === "me") {
                meet.origin[0] = response.results["0"].geometry.location.lat;
                meet.origin[1] = response.results["0"].geometry.location.lng;
            } else if (person === "friend") {
                meet.destination[0] = response.results["0"].geometry.location.lat;
                meet.destination[1] = response.results["0"].geometry.location.lng;
            } else { }
        });
    }

    // Call function for both inputs
    getLatLng(myLoc, "me");
    getLatLng(friendLoc, "friend");

    // Delay one second before calculating midpoint.
    // This is an easy but unelegant way to wait for the ajax requests
    //  to complete before executing the findMiddle function.
    // Ideally we should find a more elegant solution.
    setTimeout(function () {
        // Calculate midpoint
        meet.findMiddle();
        // Write midpoint to html
        $("#middle").text(meet.theMiddle.lat + " " + meet.theMiddle.lng);


        // Create function to make Yelp Ajax request
        function getYelpData() {
            jQuery.ajaxPrefilter(function (options) {
                if (options.crossDomain && jQuery.support.cors) {
                    options.url = 'https://cors-anywhere.herokuapp.com/' + options.url;
                }
            });

            const yelpURL = "https://api.yelp.com/v3/businesses/search?" +
                "latitude=" + meet.theMiddle.lat +
                "&longitude=" + meet.theMiddle.lng +
                "&radius=" + 3000;

            // Make API call
            $.ajax({
                url: yelpURL,
                crossDomain: true,
                method: "GET",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer gfAAsdu8zgOMbEu_1uAb1fMN4JtX982WdDD6dNgnkhbt0u4-nHcuAiL0uSZgRKkG3F4_I9wNNzBsFpZUo3K9RLz4VYswcm9FI44bf4s2S7hg_a8eqPBKnmKbmfUbW3Yx');
                }
            }).then(function (response) {
                // Log response
                console.log(response);
            });
        }
        getYelpData();
    }, 1000);
    });
    