import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";

const App = () => {
  const [input, setInput] = useState(""); // Input for CET/REG No
  const [candidateData, setCandidateData] = useState(null); // Candidate details
  const [chartData, setChartData] = useState(null); // Chart data
  const [error, setError] = useState(""); // Error handling

  const fetchCandidateData = async () => {
    try {
      console.log("Calling API:", `${process.env.REACT_APP_API_URL}/search/`);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/search/`, {
        params: { cet_no: input }, // Replace with reg_no if searching by REG No
      });

      console.log("API Response:", response.data);

      // Set candidate details
      setCandidateData(response.data.candidate);

      // Prepare chart data
      setChartData({
        labels: response.data.chart_data.map((item) => item.name), // Names
        datasets: [
          {
            label: "Total Marks",
            data: response.data.chart_data.map((item) => item.total_marks), // Marks
            backgroundColor: response.data.chart_data.map((item) =>
              item.is_highlighted ? "orange" : "skyblue" // Highlight candidate
            ),
          },
        ],
      });

      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("API Error:", err.response || err);
      setError(err.response?.data?.detail || "An error occurred.");
      setCandidateData(null);
      setChartData(null);
    }
  };

  return (
    <div>
      <h1>Candidate Performance</h1>
      <input
        type="text"
        placeholder="Enter CET or REG No"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={fetchCandidateData}>Search</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {candidateData && (
        <div>
          <h2>Candidate Details</h2>
          <p>Name: {candidateData.name}</p>
          <p>Total Marks: {candidateData.total_marks}</p>
        </div>
      )}

      {chartData && (
        <div>
          <h2>Performance Chart</h2>
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
};

export default App;
