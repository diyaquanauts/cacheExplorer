import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import tilebelt from '@mapbox/tilebelt';

mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const MapboxGlobe = ({ stateName, zoomLevel }) => {
    const [geojsonData, setGeojsonData] = useState(null);

    useEffect(() => {
        // Load the tile cache file
        const loadTileCache = async () => {
            const response = await fetch(`/path/to/tile-poly-cache/${stateName}-tiles.json`);
            const tileData = await response.json();

            if (tileData[zoomLevel]) {
                const tilesGeoJSON = generateTilesGeoJSON(tileData[zoomLevel], zoomLevel);
                setGeojsonData(tilesGeoJSON);
            } else {
                console.error(`No tile data found for zoom level ${zoomLevel}`);
            }
        };

        loadTileCache();
    }, [stateName, zoomLevel]);

    useEffect(() => {
        if (geojsonData) {
            const map = new mapboxgl.Map({
                container: 'map',
                style: 'mapbox://styles/mapbox/satellite-v9',
                center: [-100, 40],
                zoom: 3,
                projection: 'globe' // Display the map as a 3D globe
            });

            map.on('load', () => {
                map.addSource('tiles', {
                    type: 'geojson',
                    data: geojsonData
                });

                map.addLayer({
                    id: 'tiles-layer',
                    type: 'fill',
                    source: 'tiles',
                    paint: {
                        'fill-color': '#888888',
                        'fill-opacity': 0.5,
                        'fill-outline-color': '#000000'
                    }
                });

                const bounds = turf.bbox(geojsonData);
                map.fitBounds(bounds, { padding: 20 });
            });

            return () => map.remove();
        }
    }, [geojsonData]);

    return <div id="map" style={{ width: '100%', height: '100vh' }} />;
};

function generateTilesGeoJSON(tileData, zoomLevel) {
    const features = [];

    for (const [y, xList] of Object.entries(tileData)) {
        const yNum = parseInt(y, 10); // Ensure y is treated as a number
        if (isNaN(yNum)) {
            console.warn(`Warning: y value "${y}" is not a valid number`);
            continue;
        }

        xList.forEach(x => {
            const xNum = parseInt(x, 10); // Ensure x is treated as a number
            if (isNaN(xNum)) {
                console.warn(`Warning: x value "${x}" is not a valid number`);
                return;
            }

            const tilePolygon = tileToPolygon(xNum, yNum, zoomLevel);
            if (tilePolygon) {
                features.push({
                    type: 'Feature',
                    properties: {
                        tile: [xNum, yNum, zoomLevel]
                    },
                    geometry: tilePolygon.geometry
                });
            } else {
                console.error(`Failed to generate polygon for tile [${xNum}, ${yNum}, ${zoomLevel}]`);
            }
        });
    }

    return {
        type: 'FeatureCollection',
        features: features
    };
}

function tileToPolygon(x, y, z) {
    const tile = [x, y, z];
    const bbox = tilebelt.tileToBBOX(tile);
    return turf.bboxPolygon(bbox);
}

export default MapboxGlobe;
