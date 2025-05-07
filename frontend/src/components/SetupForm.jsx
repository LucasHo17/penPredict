import {useState,React} from 'react'
import './SetupForm.css';
import { useNavigate } from 'react-router-dom';


const teams = [
    'ARG','BEL','BRA','BUL','CHI','COL','CRA','CRO','DEN','ENG',
    'FRA','GER','GHA','GRE','HOL','IRE','ITA','JAP','KOR','MEX',
    'PAR','POR','ROM','RUM','RUS','SPA','SWE','SWZ','UKR','URU','YUG'
  ];

  export default function SetupForm({ onStart }) {
    // Notice we destructure onStart from props here!
    const navigate = useNavigate();
    const [team, setTeam] = useState('FRA');
    const [foot, setFoot] = useState('R');
    const [elimination, setElimination] = useState(0);
    const [penaltyNumber, setPenaltyNumber] = useState(1); // Add this line

    const handleSubmit = e => {
      e.preventDefault();
      // onStart is defined because we pulled it in above
      navigate('/game', { state: { team, foot, penaltyNumber, elimination } })
    };
  
    return (
      <div className="setup-page">
        <video autoPlay loop muted playsInline id="bg-video">
          <source src="/public/setup_form_wall.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <form className="setup-form" onSubmit={handleSubmit}>
          <h2 className="header1">Configure Your Penalty</h2>
    
          {/* Team selector */}
          <label>
            Team:
            <select value={team} onChange={e => setTeam(e.target.value)}>
              {teams.map(code => (
                <option key={code} value={code}>{code}</option>
              ))}
            </select>
          </label>
    
          {/* Foot selector */}
          <label>
            Foot:
            <select value={foot} onChange={e => setFoot(e.target.value)}>
              <option value="L">Left</option>
              <option value="R">Right</option>
            </select>
          </label>

          <label>
              Penalty Number (1–12):
              <input
              className="penalty-number"
              type="number"
              min="1"
              max="12"
              value={penaltyNumber}
              onChange={e => setPenaltyNumber(+e.target.value)}
              />
          </label>
      
          {/* Elimination selector */}
          <label>
            Elimination Kick?
            <select
              value={elimination}
              onChange={e => setElimination(+e.target.value)}
            >
              <option value={0}>No</option>
              <option value={1}>Yes</option>
            </select>
          </label>
    
          <button type="submit">Start Match</button>
        </form>
        </div>
    );
  }