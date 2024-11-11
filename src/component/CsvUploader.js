import React, { useState } from 'react';
import Papa from 'papaparse'; 
import { db } from './firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import '../CsvUploader.css'; 

function CsvUploader({ onDataParsed }) { 
  const [csvFile, setCsvFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== "text/csv") {
      alert("Please upload a valid CSV file.");
      return;
    }
    setCsvFile(file);
  };

  const handleFileUpload = async () => {
    if (!csvFile) {
      alert('Please select a CSV file to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
      const rows = parsed.data;

      // Parse rows starting from the third row if necessary
      const data = rows.slice(2).map((row) => ({
        location: row['loc']?.trim() || "",
        cases: isNaN(Number(row['cases']?.trim())) ? 0 : Number(row['cases']?.trim()), 
        deaths: isNaN(Number(row['deaths']?.trim())) ? 0 : Number(row['deaths']?.trim()), 
        date: row['date']?.trim() || "",
        regions: row['Region']?.trim() || "",
        year: row['year']?.trim() || ""
      }));

      try {
        // Batch uploading each row to Firestore
        const batch = data.map(async (item) => {
          await addDoc(collection(db, 'dengueData'), item);
        });

        await Promise.all(batch);
        alert('CSV data uploaded successfully!');
        onDataParsed(data); 
      } catch (error) {
        console.error('Error uploading CSV data:', error);
        alert('Failed to upload CSV data. Please try again.');
      }
    };

    reader.readAsText(csvFile);
  };

  return (
    <div className="csv-uploader-container">
      <h2>Upload File Directly</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="csv-input"
      />
      <button onClick={handleFileUpload} className="csv-upload-button">
        Upload
      </button>
    </div>
  );
}

export default CsvUploader;
