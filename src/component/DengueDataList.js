import React, { useState, useEffect } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "./firebase";
import "../DisplayDengue.css";
import DengueBarChart from './DengueBarChart';
import DengueRadarChart from './DengueRadarChart';
import DengueMap from './DengueMap';

const DengueDataList = () => {
  const [rawData, setRawData] = useState([]);
  const [dengueData, setDengueData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    location: "",
    cases: "",
    deaths: "",
    date: "",
    regions: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredBarData, setFilteredBarData] = useState([]);
  const [filteredRadarData, setFilteredRadarData] = useState([]);
  const [regions, setRegions] = useState([]);
  const [selectedBarRegion, setSelectedBarRegion] = useState('All');
  const [selectedRadarRegion, setSelectedRadarRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("location");
  const [sortOrder, setSortOrder] = useState("asc");
  const [regionCases, setRegionCases] = useState({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage =10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dengueCollection = collection(db, 'dengueData');
        const q = query(dengueCollection, orderBy("location"));
        const dengueSnapshot = await getDocs(q);
        const dataList = dengueSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRawData(dataList);
        if (dataList.length > 0) {
          console.log("Date Field Exists:", dataList.some(item => item.date));  // Check if date exists in any of the records
        }

        const aggregatedData = dataList.reduce((acc, item) => {
          if (!acc[item.location]) {
            acc[item.location] = {
              location: item.location,
              cases: 0,
              deaths: 0,
              regions: item.regions,
              date: item.date || "",  
            };
          }
          acc[item.location].cases += item.cases;
          acc[item.location].deaths += item.deaths;
          return acc;
        }, {});

        const aggregateDataByRegion = (aggregatedData) => {
          return aggregatedData.reduce((acc, item) => {
            const { regions, cases, deaths, date } = item;
        
            // Ensure date exists before parsing
            if (date) {
              const parsedDate = new Date(date);
              const year = parsedDate.getFullYear();
        
              // Check if the parsed year is a valid number
              if (!isNaN(year)) {
                if (!acc[regions]) {
                  acc[regions] = {}; // Initialize a new object for each region
                }
                if (!acc[regions][year]) {
                  acc[regions][year] = { cases: 0, deaths: 0 }; // Initialize cases and deaths for each year in each region
                }
        
                acc[regions][year].cases += cases;
                acc[regions][year].deaths += deaths;
              } else {
                console.warn(`Invalid date encountered: ${date}`);
              }
            } else {
              console.warn(`Missing date encountered in data entry:`, item);
            }
        
            return acc;
          }, {});
        };         
        
        const updatedaggregatedDataList = Object.values(aggregatedData);
        setDengueData(updatedaggregatedDataList);
        setFilteredBarData(updatedaggregatedDataList);
        setFilteredRadarData(updatedaggregatedDataList);
        const updatedRegionCases = aggregateDataByRegion(updatedaggregatedDataList);
        setRegionCases(updatedRegionCases);

        const uniqueRegions = [...new Set(dataList.map((data) => data.regions))];
        setRegions(uniqueRegions);
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString) => {
    const dateObj = new Date(dateString);
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
    const day = String(dateObj.getDate()).padStart(2, '0'); 
    const year = dateObj.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const updateBarChartData = (region) => {
    if (region === 'All') {
      setFilteredBarData(dengueData);
    } else {
      const filtered = dengueData.filter((data) => data.regions === region);
      setFilteredBarData(filtered);
    }
  };

  const updateRadarChartData = (region) => {
    if (region === 'All') {
      setFilteredRadarData(dengueData);
    } else {
      const filtered = dengueData.filter((data) => data.regions === region);
      setFilteredRadarData(filtered);
    }
  };

  const handleBarRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setSelectedBarRegion(selectedRegion);
    updateBarChartData(selectedRegion);
  };

  const handleRadarRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setSelectedRadarRegion(selectedRegion);
    updateRadarChartData(selectedRegion);
  };

  const handleDelete = async (id) => {
    const dengueDocRef = doc(db, "dengueData", id);
    try {
      await deleteDoc(dengueDocRef);
      setRawData(rawData.filter((data) => data.id !== id));
      alert("Data deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const handleEdit = (data) => {
    setEditingId(data.id);
    setEditForm({
      location: data.location,
      cases: data.cases,
      deaths: data.deaths,
      date: formatDate(data.date),
      regions: data.regions,
    });
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const dengueDocRef = doc(db, "dengueData", editingId);
    try {
      await updateDoc(dengueDocRef, {
        location: editForm.location,
        cases: Number(editForm.cases),
        deaths: Number(editForm.deaths),
        date: formatDate(editForm.date), 
        regions: editForm.regions,
      });

      const updatedRawData = rawData.map((data) =>
        data.id === editingId ? { ...data, ...editForm } : data
      );
      setRawData(updatedRawData);

      const updatedAggregatedData = updatedRawData.reduce((acc, item) => {
        if (!acc[item.location]) {
          acc[item.location] = {
            location: item.location,
            cases: 0,
            deaths: 0,
            regions: item.regions,
          };
        }
        acc[item.location].cases += item.cases;
        acc[item.location].deaths += item.deaths;
        return acc;
      }, {});

      const updatedAggregatedDataList = Object.values(updatedAggregatedData);
      setDengueData(updatedAggregatedDataList);
      updateBarChartData(selectedBarRegion);
      updateRadarChartData(selectedRadarRegion);

      setEditingId(null);
      setIsModalOpen(false);
      alert("Data updated successfully!");
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  // Filter and sort raw data based on search query and sort options
  const filteredAndSortedTableData = rawData
    .filter((data) =>
      data.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      data.regions.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "cases" || sortField === "deaths") {
        return sortOrder === "asc" ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
      } else {
        return sortOrder === "asc"
          ? a[sortField].localeCompare(b[sortField])
          : b[sortField].localeCompare(a[sortField]);
      }
    });

  // Pagination controls
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredAndSortedTableData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredAndSortedTableData.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <h2>Dengue Data List</h2>
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Cases"
                  value={editForm.cases}
                  onChange={(e) => setEditForm({ ...editForm, cases: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  placeholder="Deaths"
                  value={editForm.deaths}
                  onChange={(e) => setEditForm({ ...editForm, deaths: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="date"
                  placeholder="Date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Regions"
                  value={editForm.regions}
                  onChange={(e) => setEditForm({ ...editForm, regions: e.target.value })}
                  required
                  className="form-input"
                />
              </div>
              <div className="button-group">
                <button type="submit" className="button">Update</button>
                <button onClick={handleCloseModal} className="button">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="filters-row">
        <input
          type="text"
          placeholder="Search by Location or Region"
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
        <button className="sort-button" onClick={() => handleSort("cases")}>
          Sort by Cases {sortField === "cases" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
        <button className="sort-button" onClick={() => handleSort("deaths")}>
          Sort by Deaths {sortField === "deaths" && (sortOrder === "asc" ? "▲" : "▼")}
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Cases</th>
              <th>Deaths</th>
              <th>Date</th>
              <th>Regions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((data) => (
              <tr key={data.id}>
                <td>{data.location}</td>
                <td>{data.cases}</td>
                <td>{data.deaths}</td>
                <td>{formatDate(data.date)}</td>
                <td>{data.regions}</td>
                <td>
                  <button onClick={() => handleEdit(data)}>Edit</button>
                  <button onClick={() => handleDelete(data.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <label htmlFor="bar-region-filter">Choose Region to View:</label>
          <select id="bar-region-filter" value={selectedBarRegion} onChange={handleBarRegionChange}>
            <option value="All">All</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <DengueBarChart data={filteredBarData} />
      </div>
      <div className="chart-container2">
        <div className="chart-header">
          <label htmlFor="radar-region-filter">Choose Region to View:</label>
          <select id="radar-region-filter" value={selectedRadarRegion} onChange={handleRadarRegionChange}>
            <option value="All">All</option>
            {regions.map((region, index) => (
              <option key={index} value={region}>{region}</option>
            ))}
          </select>
        </div>

        <DengueRadarChart data={filteredRadarData} />
      </div>
      <div className="chart-container" style={{marginBottom:'20px'}}>
        <DengueMap data={regionCases} />
      </div>
    </div>
  );
};

export default DengueDataList;
