import React, { useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';
import tilebelt from '@mapbox/tilebelt';
import { Box, Text, NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper, useMediaQuery } from '@chakra-ui/react';

mapboxgl.accessToken = 'pk.eyJ1IjoiYnJldHRtc21pdGgiLCJhIjoiY2x2cjNvOThrMGxtbDJycnJ2NTViYTVvMCJ9.ATBZCW_8mlpzUgBEeN_alA'; // Replace with your Mapbox access token

const HawaiiMap = () => {
    const [geojsonData, setGeojsonData] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(3); // Initial zoom level
    const [map, setMap] = useState(null); // State to store the map instance
    const [tileCount, setTileCount] = useState(0); // State to store the number of tiles
    const [isMobile] = useMediaQuery("(max-width: 768px)");

    useEffect(() => {
        // Initialize the map only once
        const initMap = new mapboxgl.Map({
            container: 'map',
            style: {
                version: 8,
                sources: {
                    'usgs-topo': {
                        type: 'raster',
                        tiles: [
                            'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}'
                        ],
                        tileSize: 256,
                    }
                },
                layers: [
                    {
                        id: 'usgs-topo-layer',
                        type: 'raster',
                        source: 'usgs-topo',
                        paint: {}
                    }
                ]
            },
            center: [-155.5828, 19.8968], // Centered on Hawaii
            zoom: 2, // Initial zoom level
            projection: 'globe', // Display the map as a 3D globe
        });

        initMap.on('style.load', () => {
            initMap.setFog({
                range: [0.5, 10],
                color: 'black',
                "horizon-blend": 0.3
            });

            setMap(initMap); // Store the map instance in the state
        });

        return () => initMap.remove();
    }, []);

    useEffect(() => {
        // Load the tile cache for Hawaii
        const loadTileCache = async () => {
            const response = await fetch('/tileCache/Hawaii-tiles.json');
            const tileData = await response.json();

            if (tileData[zoomLevel]) {
                const tilesGeoJSON = generateTilesGeoJSON(tileData[zoomLevel], zoomLevel);
                setGeojsonData(tilesGeoJSON);
                setTileCount(tilesGeoJSON.features.length); // Update tile count
            } else {
                console.error(`No tile data found for zoom level ${zoomLevel}`);
            }
        };

        loadTileCache();
    }, [zoomLevel]);

    useEffect(() => {
        if (geojsonData && map) {
            if (map.getSource('tiles')) {
                map.getSource('tiles').setData(geojsonData);
            } else {
                map.addSource('tiles', {
                    type: 'geojson',
                    data: geojsonData,
                });

                map.addLayer({
                    id: 'tiles-layer',
                    type: 'line', // Use a line layer to outline the polygons
                    source: 'tiles',
                    paint: {
                        'line-color': '#ff1c14', // Neon green color
                        'line-width': 2,
                        'line-blur': 4, // Adds a glow effect to the lines
                        'line-opacity': 1,
                    },
                });
            }
        }
    }, [geojsonData, map]);

    return (
        <Box height="100vh" width="100vw" bg="black" position="relative">
            <Box
                position="absolute"
                top={isMobile ? 4 : 10}
                left="50%"
                transform="translateX(-50%)"
                zIndex={1}
                p={4}
                bg={"white"}
                borderRadius="md"
                boxShadow="md"
                textAlign="center"
            >
                <NumberInput
                    value={zoomLevel}
                    onChange={(valueString) => setZoomLevel(parseInt(valueString, 10))}
                    min={0}
                    max={14}
                    mb={4}
                    size="lg"
                    textAlign="center"
                    width="80px"
                    margin="0 auto"
                >
                    <NumberInputField textAlign="center" />
                    <NumberInputStepper size={'sm'}>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                    </NumberInputStepper>
                </NumberInput>
                <Text fontSize="md">Number of Tiles: {tileCount}</Text>
            </Box>
            <Box height="100%" width="100%" id="map" />

            <Box height="100%" width="100%" id="map" />
        </Box>
    );
};

function generateTilesGeoJSON(tileData, zoomLevel) {
    const features = [];

    for (const [y, xList] of Object.entries(tileData)) {
        const yNum = parseInt(y, 10); // Ensure y is treated as a number
        if (isNaN(yNum)) {
            console.warn(`Warning: y value "${y}" is not a valid number`);
            continue;
        }

        xList.forEach((x) => {
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
                        tile: [xNum, yNum, zoomLevel],
                    },
                    geometry: tilePolygon.geometry,
                });
            } else {
                console.error(`Failed to generate polygon for tile [${xNum}, ${yNum}, ${zoomLevel}]`);
            }
        });
    }

    return {
        type: 'FeatureCollection',
        features: features,
    };
}

function tileToPolygon(x, y, z) {
    const tile = [x, y, z];
    const bbox = tilebelt.tileToBBOX(tile);
    return turf.bboxPolygon(bbox);
}

export default HawaiiMap;
