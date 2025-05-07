import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

export async function predictDive({ team, foot, zone, penaltyNumber, elimination }) {
  try {
    const { data } = await axios.post(`${API_URL}/predict`, {
      Team:           team,
      Foot:           foot,
      Zone:           zone,
      Penalty_Number: penaltyNumber,   // ← use this exact key!
      Elimination:    elimination
    });
    return {
      diveZones:     data.dive_zones,
      probabilities: data.probabilities
    };
  } catch (err) {
    console.error("Failed to predict:", err.response?.data || err.message);
    throw err;
  }
}
