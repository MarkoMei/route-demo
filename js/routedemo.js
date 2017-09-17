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
        if (currentRoute.length < maxPointsInRoute) {
            var marker = new google.maps.Marker({
                position: e.latLng,
                map: map
            });
            currentRoute.push(marker);
            
            // add a new point also in polyLine
            if (currentPolyline == null)
            {
                currentPolyline = makePolyline();
            }
            currentPolyline.getPath().push(e.latLng);
        }
    });
}

function makePolyline() {
    var polyline = new google.maps.Polyline({
          strokeColor: '#000000',
          strokeOpacity: 0.8,
          strokeWeight: 1
        });
    polyline.setMap(map);
    return polyline;
}

function clearRoute(route) {
    while(route.length) {
        // take marker from array one by one (reducing its size)
        // and set them invisible
        route.pop().setMap(null);
    }
}

function clearCurrentPolyline() {
    if (currentPolyline != null) {
        currentPolyline.setMap(null);
        currentPolyline=null;
    }
}

function addRouteToList(routeName) {
    var list = document.getElementById('savedrouteslist');
    var newItem = document.createElement('LI');
    newItem.innerText = routeName;
    newItem.className = 'savedroutelistitem';
    list.appendChild(newItem);
}

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
            //alert(JSON.stringify(routeToSave));
            // add item to 'Saved routes' list
            addRouteToList(routeName);
            showSavedRoutes();
            return true;
        }
    }
    else {
        console.log('Sorry, out of space!')
    }
    return false;
}

function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
}

function getAllRoutePoints() {
    var points = [];
    savedRoutes.forEach(function(route) {
        route.coordinates.forEach(function(coordinate) {
            points.push(new google.maps.LatLng(coordinate.lat(), coordinate.lng()));
        });
    });
    return points;
}


// function that is called when document html is loaded
document.addEventListener('DOMContentLoaded', function() {

    loadMapScript();
    
    var clearRouteButton = document.getElementById('clearroute');
    var saveRouteButton = document.getElementById('saveroute');
    var showHeatmapButton = document.getElementById('showheatmap');
    
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
    
    showHeatmapButton.addEventListener('click', function() {
        toggleHeatmap();
    });
});

