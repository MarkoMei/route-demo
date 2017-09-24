/*
	routedemo.js
*/

// don't allow sloppy JavaScript!
"use strict";

var map, heatmap;
var maxPointsInRoute = 10;
var maxRoutesToSave = 10;
var kamppi = { lat: 60.1675, lng: 24.9311 };
var currentRoute=[];
var currentPolyline=null;
var savedRoutes=[];

// initialize the map and heatmap and define the function that is called 
// when the map is clicked
function initMap() {
   
    var mapOptions = {
        zoom: 14,
        minZoom: 14,
        maxZoom: 14,
        center: kamppi,
        draggable: false,
        gestureHandling: 'none',
        mapTypeId: 'roadmap',
        disableDefaultUI: true
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);

    heatmap = new google.maps.visualization.HeatmapLayer();

    var clickListener = map.addListener('click', function (e) {
        if (savedRoutes.length >= maxRoutesToSave) {
            // warn the user as there already is the max number of routes saved
            showAlert('Max ' + maxRoutesToSave + ' routes can be saved!');
        }
        if (currentRoute.length < maxPointsInRoute) {
            // add a new point in the current route
            var marker = new google.maps.Marker({
                position: e.latLng,
                map: map
            });
            currentRoute.push(marker);
            
            // add the new point also in polyLine
            if (currentPolyline == null)
            {
                currentPolyline = makePolyline();
            }
            currentPolyline.getPath().push(e.latLng);
        }
        else {
            showAlert('Max ' + maxPointsInRoute + ' points in route!');
        }
    });
}

// make a polyline object and add it to the current map
function makePolyline() {
    var polyline = new google.maps.Polyline({
          strokeColor: '#000000',
          strokeOpacity: 0.8,
          strokeWeight: 1
        });
    polyline.setMap(map);
    return polyline;
}

// clear the given route from the map
function clearRoute(route) {
    while(route.length) {
        // take marker from array one by one (reducing its size)
        // and set them invisible
        route.pop().setMap(null);
    }
    hideAlert();
}

// hide and then clear the current polyline
function clearCurrentPolyline() {
    if (currentPolyline != null) {
        currentPolyline.setMap(null);
        currentPolyline=null;
    }
}

// append newest route to the saved routes' list
function addRouteToList(routeName) {
    var list = document.getElementById('savedrouteslist');
    var newItem = document.createElement('LI');
    newItem.innerText = routeName;
    newItem.className = 'savedroutelistitem';
    list.appendChild(newItem);
}

// make controls inside 'savedroutes' div visible
function showSavedRoutes() {
    var savedRoutes = document.getElementById('savedroutes');
    savedRoutes.style.display = 'flex';
}

function saveRoute(route) {
    if (savedRoutes.length < maxRoutesToSave) {
        // allow saving also a route with only 1 point
        if (route.length > 0) {
            var coordinates = [];
            for (var i = 0; i < route.length; i++) {
                coordinates.push(route[i].position);
            }
            var routeName = 'Route ' + (savedRoutes.length+1);
            var routeToSave = { routename: routeName, coordinates: coordinates};
            savedRoutes.push(routeToSave);
            // add item to 'Saved routes' list
            addRouteToList(routeName);
            showSavedRoutes();
            return true;
        }
    }
    return false;
}

// toggle heatmap visibility
function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

// returns all route poits as google.maps.LatLng objects
function getAllRoutePoints() {
    var points = [];
    savedRoutes.forEach(function(route) {
        route.coordinates.forEach(function(coordinate) {
            points.push(new google.maps.LatLng(coordinate.lat(), coordinate.lng()));
        });
    });
    return points;
}

// export all saved routes
function exportRoutes() {
    // make JSON using 2 spaces intendation
    var content = JSON.stringify(savedRoutes, null, 2);
    var contentType = 'application/json';
    var filename = new Date().toISOString().slice(0, 19).replace(/:/g, '_') + ' routes.json';

    var a = document.createElement('a');
    var blob = new Blob([content], {'type': contentType});
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}


function showAlert(alertText) {
    var alertDiv = document.getElementById('alert');
    alertDiv.innerHTML = alertText;
    alertDiv.style.display = 'inline-block';
}

function hideAlert() {
    var alertDiv = document.getElementById('alert');
    alertDiv.style.display = 'none';
}

// function that is called when document html is loaded
document.addEventListener('DOMContentLoaded', function() {

    loadMapScript();
    
    var clearRouteButton = document.getElementById('clearroute');
    var saveRouteButton = document.getElementById('saveroute');
    var showHeatmapButton = document.getElementById('showheatmap');
    var exportRoutesButton = document.getElementById('exportroutes');
    
    clearRouteButton.addEventListener('click', function() {
        clearRoute(currentRoute);
        clearCurrentPolyline();
    });
    
    saveRouteButton.addEventListener('click', function() {
        if (saveRoute(currentRoute)) {
            clearRoute(currentRoute);
            clearCurrentPolyline();
            heatmap.setData(getAllRoutePoints());
        }
    });
    
    showHeatmapButton.addEventListener('click', toggleHeatmap);
    
    exportRoutesButton.addEventListener('click', exportRoutes);
});

