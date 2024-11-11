import React, { useState } from 'react';
import AddDengueData from './component/AddDengueData';
import CsvUploader from './component/CsvUploader';
import DengueDataList from './component/DengueDataList';
import './App.css'; // Import the CSS file for layout
import headerImage from '../src/DengueData.png';

function App() {
  const [isTableVisible, setIsTableVisible] = useState(true); // State to manage table visibility
  const [csvData, setCsvData] = useState([]); // State to store parsed CSV data

  const handleDataParsed = (data) => {
    setCsvData(data); // Set the parsed data in the state
  };

  return (
    <div className="App">
       <img src={headerImage} alt="Header" className="header-image" /> 
      <div className="form-row"> 
        <div className="form-wrapper">
          <AddDengueData />
        </div>
        <div className="csv-wrapper">
          <CsvUploader onDataParsed={handleDataParsed} /> {/* Pass the callback to CsvUploader */}
        </div>
      </div>
    <DengueDataList />
    </div>
  );
}

export default App;
