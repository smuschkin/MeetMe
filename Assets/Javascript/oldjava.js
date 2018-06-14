$(function () {
    google.maps.event.addDomListener(window, "load", function () {
        var fromLocations = new google.maps.places.Autocomplete(document.getElementById("start"));
        var toLocations = new google.maps.places.Autocomplete(document.getElementById("end"));

        google.maps.event.addListener(fromLocations, "change", function () {
            var from = fromLocations.getPlace();
            var fromAddress = from.formattedAddress;
            $("#origin").val(fromAddress);
        });
        google.maps.event.addListener(toLocations, "change", function () {
            var to = toLocations.getPlace();
            var toAddress = to.formattedAddress;
            $("#destination").val(toAddress);
        });
    });
});

function calcDistance() {
    var origin = $("#origin").val();
    var destination = $("#destination").val();
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origin],
            destination: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.unitSystem.IMPERIAL,
        }, callback);

    function callback(response, status)
    $("#distanceForm").submit(function (event) {
        event.preventDefault();
        calcDistance();
    });
};

function callback(response, status) {
    if (status != google.maps.DistanceMatrixService.OK) {
        $("#result").html(err);
    } else (
        var origin = response.originAddresses[0];
        var destination = response.destinationAddresses[0];
        if (response.rows[0].elements.[0].status === "ZERO_RESULTS") {
            
        }
    )
}

function initMap() {
    var directionsService = new google.maps.DirectionsService;
    var directionsDisplay = new google.maps.DirectionsRenderer;
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: { lat: 41.85, lng: -87.65 }
    });
    directionsDisplay.setMap(map);

    var onChangeHandler = function () {
        calculateAndDisplayRoute(directionsService, directionsDisplay);
    };
    document.getElementById('start').addEventListener('change', onChangeHandler);
    document.getElementById('end').addEventListener('change', onChangeHandler);
}

function calculateAndDisplayRoute(directionsService, directionsDisplay) {
    directionsService.route({
        origin: document.getElementById('start').value,
        destination: document.getElementById('end').value,
        travelMode: 'DRIVING'
    }, function (response, status) {
        if (status === 'OK') {
            directionsDisplay.setDirections(response);
        } else {
            // window.alert('Directions request failed due to ' + status);
        }
    });
}

function initAutocomplete() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.8688, lng: 151.2195 },
        zoom: 13,
        mapTypeId: 'roadmap'

    });

    // Create the search box and link it to the UI element.
    var input1 = document.getElementById('start');
    var input2 = document.getElementById('end');

    var searchBox1 = new google.maps.places.SearchBox(input1);
    var searchBox2 = new google.maps.places.SearchBox(input2);

    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input1);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input2);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function () {
        searchBox1.setBounds(map.getBounds());
        searchBox2.setBounds(map.getBounds());

    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox1.addListener('places_changed', function () {
        var places1 = searchBox1.getPlaces();
        var places2 = searchBox2.getPlaces();
        if (places.length == 0) {
            return;
        }
        console.log(places1);

        // Clear out the old markers.
        markers.forEach(function (marker) {
            marker.setMap(null);
        });
        markers = [];

        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function (place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            markers.push(new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            }));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);

    });

    var p1 = new google.maps.LatLng(45.463688, 9.18814);
    var p2 = new google.maps.LatLng(46.0438317, 9.75936230000002);

    alert(calcDistance(p1, p2));

    //calculates distance between two points in km's
    function calcDistance(p1, p2) {
        return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
    }

}

