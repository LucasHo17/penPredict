import {React, useState, useRef} from 'react';
import {predictDive} from '../api';
import './GameBoard.css';
import { FaSoundcloud } from "react-icons/fa6";

import { useLocation, useNavigate } from 'react-router-dom';
const columnZones = {
    Left:   [1,4,7],
    Center: [2,5,8],
    Right:  [3,6,9],
  };


export default function GameBoard(){
    const location = useLocation();
    const navigate = useNavigate();
    const [clickedZone, setClickedZone] = useState(null);
    const [keeperDirection, setKeeperDirection] = useState(null);
    const [result, setResult] = useState(null);
    const audioRef = useRef(null); // audio reference


    const { team, foot, penaltyNumber, elimination } = location.state || {};
    if (!team || !foot || penaltyNumber === undefined || elimination === undefined) {
        navigate('/');
      }
    const handleClick = async zone => {
        if (result) return;
        setClickedZone(zone);
       // trigger a quick visual "shoot" pulse (cells will animate via CSS)
       // keeper animation will start when keeperDirection is set below
        try {
            const {diveZones, probabilities} = await predictDive({
                team, 
                foot, 
                zone, 
                penaltyNumber, 
                elimination
            });
            const ran = Math.random();
            const p0 = probabilities[diveZones[0]];
            const p1 = probabilities[diveZones[1]];     
            const p2 = 1 - p0 - p1;   
            let dir;
            const allDirections = ["Left", "Center", "Right"]
            if (ran < p0){
                dir = diveZones[0];
            } else if (ran< p0+p1){
                dir = diveZones[1];
            } else {
                for (const i of allDirections) {
                    if (!diveZones.includes(i)){
                        dir = i;
                    }
                }
            }
            setKeeperDirection(dir);

            const blocked = columnZones[dir];
            setResult(blocked.includes(zone)? "failure":"success");
        } catch (error) {
            console.error('Failed to predict:', error);
            // Handle error appropriately - maybe show an error message to user
            setResult('error');
        }
    }

    const resetGame = () => {
        navigate("/");
    }
    const toggleCrowdSound = () => {
        if (audioRef.current.paused) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
      };
    return (
        <div className="game-page">
            <div className="icon-container">
                <FaSoundcloud 
                className='sound-icon'
                onClick={toggleCrowdSound}
                />
                <audio ref={audioRef} src="/football-crowd.mp3" />
            </div>
            
            <div className = "field-container">
                {/* subtle net overlay behind the goal */}
                <div className="net-overlay" aria-hidden="true" />
                <h2>12-yard Cup</h2>
                <div className = "goal-grid">
                    <div className="crossbar" />
                    {[1,2,3,4,5,6,7,8,9].map(n=>{
                        // check which zone machine predicts
                        const isBlocked = keeperDirection ? columnZones[keeperDirection].includes(n):false;

                        const isClicked = result && n == clickedZone;

                        const classNames = [
                            'cell',
                            isBlocked ? 'cell--blocked':'',
                            isClicked ? (result === 'success' ? 'cell--success':'cell--fall') : ''
                        ].join(' ');

                        return (
                            <div
                                key = {n}
                                className = {classNames}
                                onClick = {() => handleClick(n)}
                            />
                        );
                    })}
                </div>

                {result === 'error' && (
                    <p className="error">Predict failed-try again.</p>
                )}

                {result && result !== 'error' && (
                    <div className="result-overlay">
                        <p>
                        {result === "success"
                            ? '🎉 Goal! You avoided the keeper’s dive.'
                            : 'Blocked'}
                        </p>
                        <button onClick={resetGame}>Play Again</button>
                    </div> 
                )}
            </div>
        </div>
    )
}

