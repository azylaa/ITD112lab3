import React, { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import "../AddDengue.css"; 

const AddDengueData = () => {
  const [location, setLocation] = useState("");
  const [cases, setCases] = useState("");
  const [deaths, setDeaths] = useState("");
  const [date, setDate] = useState("");
  const [regions, setRegions] = useState("");

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0'); 
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    
      const formattedDate = formatDate(date);

      await addDoc(collection(db, "dengueData"), {
        location,
        cases: Number(cases),
        deaths: Number(deaths),
        date: formattedDate,
        regions,
      });
      setLocation("");
      setCases("");
      setDeaths("");
      setDate("");
      setRegions("");
      alert("Data added successfully!");
      window.location.reload();
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Cases"
          value={cases}
          onChange={(e) => setCases(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="number"
          placeholder="Deaths"
          value={deaths}
          onChange={(e) => setDeaths(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="date"
          placeholder="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <div className="form-group">
        <input
          type="text"
          placeholder="Regions"
          value={regions}
          onChange={(e) => setRegions(e.target.value)}
          required
          className="form-input"
        />
      </div>
      <button type="submit" className="submit-button">Add Data</button>
    </form>
  );
};

export default AddDengueData;
