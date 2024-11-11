import React from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement } from 'chart.js';


ChartJS.register(Title, Tooltip, Legend, RadialLinearScale, PointElement, LineElement);

const DengueRadarChart = ({ data }) => {
  
  const labels = [...new Set(data.map(item => item.location))];
  const casesData = labels.map(label => {
    const locationData = data.find(item => item.location === label);
    return locationData ? locationData.cases : 0;
  });
  const deathsData = labels.map(label => {
    const locationData = data.find(item => item.location === label);
    return locationData ? locationData.deaths : 0;
  });

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Cases',
        data: casesData,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      },
      {
        label: 'Deaths',
        data: deathsData,
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

 
  const chartOptions = {
    scales: {
      r: {
        pointLabels: {
          font: {
            size: 7, 
          },
          color: '#333', 
        },
        ticks: {
          font: {
            size: 12, 
          }
        }
      }
    },
    plugins: {
      legend: {
        labels: {
          font: {
            size: 14, 
          }
        }
      }
    }
  };

  return (
    <Radar data={chartData} options={chartOptions} />
  );
};

export default DengueRadarChart;
