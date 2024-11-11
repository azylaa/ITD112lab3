import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import phGeoData from '../ph.json';
import "../DengueMap.css";

const populationData = {
  "National Capital Region": 13484462,
  "Ilocos": 5300000,
  "Cagayan Valley": 3680000,
  "Central Luzon": 13029000,
  "Calabarzon": 16205000,
  "Mimaropa": 3296000,
  "Bicol": 6000000,
  "Western Visayas": 7937000,
  "Central Visayas": 8029000,
  "Eastern Visayas": 4500000,
  "Zamboanga Peninsula": 3800000,
  "Northern Mindanao": 5100000,
  "Davao": 5100000,
  "Soccsksargen": 4500000,
  "Caraga": 2800000,
  "Autonomous Region in Muslim Mindanao": 4100000,
  "Cordillera Administrative Region": 1700000
};

const DengueMap = ({ data = {} }) => {
  const [metric, setMetric] = useState('cases');
  const [year, setYear] = useState('all'); // Default to 'all' to show data for all years
  const [mapKey, setMapKey] = useState(0); // Key for forcing map re-render

  useEffect(() => {
    setMapKey((prevKey) => prevKey + 1); // Re-render map when metric or year changes
  }, [metric, year]);

  if (!data || Object.keys(data).length === 0) {
    return <div>Loading data...</div>;
  }

  console.log("Data received in DengueMap:", data);

  // Color scale for cases
  const getColorForCases = (density) => {
    return density > 10 ? '#800026' :
           density > 5  ? '#BD0026' :
           density > 2  ? '#E31A1C' :
           density > 1  ? '#FC4E2A' :
           density > .5   ? '#FD8D3C' :
           density > .2   ? '#FEB24C' :
           density > .1   ? '#FED976' :
                          '#FFEDA0';
  };

  // Color scale for deaths
  const getColorForDeaths = (density) => {
    return density > .09 ? '#800026' :
           density > .07  ? '#BD0026' :
           density > .05  ? '#E31A1C' :
           density > .03  ? '#FC4E2A' :
           density > 0.025 ? '#FD8D3C' :
           density > 0.02 ? '#FEB24C' :
           density > 0.01 ? '#FED976' :
                          '#FFEDA0';
  };

  const onEachRegion = (region, layer) => {
    const geoRegionName = region.properties?.name || '';
    const regionData = data[geoRegionName] || {};

    let value = 0;
    let cases = 0;
    let deaths = 0;

    if (year === 'all') {
      // Sum up all years' data for the selected region
      Object.keys(regionData).forEach((yr) => {
        cases += regionData[yr]?.cases || 0;
        deaths += regionData[yr]?.deaths || 0;
      });
      value = metric === 'cases' ? cases : deaths;
    } else {
      // Use the selected year's data
      const yearData = regionData[year] || {};
      cases = yearData.cases || 0;
      deaths = yearData.deaths || 0;
      value = metric === 'cases' ? cases : deaths;
    }

    // Get population for the region and calculate density per 1000 people
    const population = populationData[geoRegionName] || 1; // Default to 1 to avoid division by zero
    const density = (value / population) * 1000;

    // Select color scheme based on metric and density
    const fillColor = metric === 'cases' ? getColorForCases(density) : getColorForDeaths(density);

    layer.setStyle({
      fillColor: fillColor,
      color: '#4a83ec',
      weight: 1,
      fillOpacity: 0.7,
    });

    layer.bindPopup(
      `<b>${geoRegionName}</b><br>${metric === 'cases' ? 'Cases' : 'Deaths'} per 1000 people: ${density.toFixed(2)}`
    );
  };

  // Get list of available years
  const years = Object.keys(data).reduce((acc, region) => {
    Object.keys(data[region]).forEach((year) => {
      if (!acc.includes(year)) acc.push(year);
    });
    return acc;
  }, []);
  years.push('all'); // Add 'all' option to display data for all years

  return (
    <div style={{ height: '500px', marginTop: '20px' }}>
      <h2>Dengue Density Rate</h2>
      {/* Dropdown for selecting metric */}
      <div className="chart-header">
        <label htmlFor="metric-select">Select Metric: </label>
        <select 
          id="metric-select" 
          value={metric} 
          onChange={(e) => setMetric(e.target.value)}
          style={{ marginBottom: '10px' }}
        >
          <option value="cases">Cases</option>
          <option value="deaths">Deaths</option>
        </select>

        {/* Dropdown for selecting year */}
        <label htmlFor="year-select">Select Year: </label>
        <select 
          id="year-select" 
          value={year} 
          onChange={(e) => setYear(e.target.value)}
          style={{ marginBottom: '10px' }}
        >
          {years.map((yearOption) => (
            <option key={yearOption} value={yearOption}>{yearOption === 'all' ? 'All Years' : yearOption}</option>
          ))}
        </select>
      </div>

      <MapContainer key={mapKey} center={[12.8797, 121.774]} zoom={5} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON 
          data={phGeoData} 
          onEachFeature={onEachRegion} 
        />
      </MapContainer>
    </div>
  );
};

export default DengueMap;
