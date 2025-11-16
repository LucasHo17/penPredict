# PenaltyPredictor
An interactive web application that uses machine learning to predict goalkeeper dive directions during penalty kicks. Built with a Random Forest model trained on World Cup shootout data, this application allows users to simulate penalty kicks and see AI-powered predictions of where the goalkeeper will dive.

## Features

- 🎯 **Interactive Penalty Simulation**: Click on any of the 9 goal zones to take a penalty kick
- 🤖 **ML-Powered Predictions**: Get AI predictions of the top 2 most likely goalkeeper dive directions
- ⚽ **Realistic Game Experience**: Visual feedback, crowd sounds, and goal animations
- 📊 **Data-Driven**: Trained on real World Cup shootout data
- 🎮 **Customizable Settings**: Configure team, foot preference, penalty number, and elimination status

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **scikit-learn** - Machine learning library (Random Forest)
- **pandas** - Data manipulation
- **joblib** - Model serialization
- **uvicorn** - ASGI server

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Icons** - Icon library

## Installation

### Prerequisites
- Python 3.12+ (with virtual environment support)
- Node.js 18+ and npm

### Backend Setup

1. Navigate to the backend directory:
cd backend

Create and activate a virtual environment (if not already created):
# Windows
python -m venv ../venv
../venv\Scripts\Activate.ps1

# macOS/Linux
python3 -m venv ../venv
source ../venv/bin/activate3. Install Python dependencies:
pip install -r requirements.txt

### Frontend Setup

1. Navigate to the frontend directory:
cd frontend
Install Node dependencies:
npm install

## Running the Application

### Start the Backend Server

From the `backend` directory (with virtual environment activated):
ash
uvicorn api:app --reload
The API will be available at `http://127.0.0.1:8000`

### Start the Frontend Development Server

From the `frontend` directory (in a separate terminal):

npm run dev
The frontend will typically run on `http://localhost:5173` (or another port if 5173 is occupied)

## Usage
1. **Configure Your Penalty**: 
   - Select a team from the dropdown (31 teams available)
   - Choose your preferred foot (Left or Right)
   - Set the penalty number (1-12)
   - Indicate if it's an elimination kick

2. **Start the Match**: Click "Start Match" to proceed to the game board

3. **Take Your Shot**: Click on any of the 9 zones in the goal to take your penalty kick

4. **See the Result**: 
   - The AI predicts where the goalkeeper will dive
   - If you shot in a zone that matches the keeper's dive direction, your shot is blocked
   - If you shot elsewhere, it's a goal! 🎉
