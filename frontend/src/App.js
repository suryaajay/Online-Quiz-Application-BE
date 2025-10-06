// src/App.js
import React, { useState } from "react";
import "./index.css";
import Login from "./components/Login";
import ParticipantDashboard from "./components/ParticipantDashboard";
import TakeQuiz from "./components/TakeQuiz";

function App() {
  const [user, setUser] = useState(localStorage.getItem("username") || null);
  const [takingQuiz, setTakingQuiz] = useState(null);

  const onLogin = (token, role, username) => {
    setUser(username);
    localStorage.setItem("username", username);
    if (token) localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("username");
    localStorage.removeItem("token");
  };

  return (
    <div className="app-shell">
      <div className="container">
        {!user && <Login onLogin={onLogin} />}

        {user && !takingQuiz && (
          <>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <h1 className="h1">Participant dashboard</h1>
              <div style={{display:"flex", gap:12, alignItems:"center"}}>
                <div className="meta">Signed in as <strong>{user}</strong></div>
                <button className="btn ghost" onClick={logout}>Logout</button>
              </div>
            </div>
            <ParticipantDashboard onTake={(q)=>setTakingQuiz(q)} />
          </>
        )}

        {user && takingQuiz && (
          <>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <h1 className="h1">{takingQuiz.title}</h1>
              <div className="meta">Time: {takingQuiz.timeLimitSeconds ? `${Math.floor(takingQuiz.timeLimitSeconds/60)} min` : "—"}</div>
            </div>
            <TakeQuiz quiz={takingQuiz} goBack={()=>setTakingQuiz(null)} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
