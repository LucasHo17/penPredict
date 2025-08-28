import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000';

// basic client-side validation to avoid bad requests
function validatePayload({ team, foot, zone, penaltyNumber, elimination }) {
  if (typeof team !== 'string' || team.length === 0) throw new Error('team is required');
  if (!['L', 'R'].includes(foot)) throw new Error('foot must be "L" or "R"');
  if (!Number.isInteger(zone) || zone < 1 || zone > 9) throw new Error('zone must be integer 1-9');
  if (!Number.isInteger(penaltyNumber) || penaltyNumber < 1 || penaltyNumber > 12) throw new Error('penaltyNumber must be 1-12');
  if (![0,1].includes(elimination)) throw new Error('elimination must be 0 or 1');
}

export async function predictDive({ team, foot, zone, penaltyNumber, elimination }) {
  try {
    validatePayload({ team, foot, zone, penaltyNumber, elimination });
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
    // surface a concise error message
    const msg = err.response?.data?.detail || err.message || 'Prediction failed';
    throw new Error(msg);
  }
}
