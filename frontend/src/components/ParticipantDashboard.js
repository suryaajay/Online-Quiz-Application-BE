// src/components/ParticipantDashboard.js
import React, { useEffect, useState } from "react";
import API from "../api";

export default function ParticipantDashboard({ onTake }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    setLoading(true);
    API.get("/participant/quizzes")
      .then(res => setQuizzes(res.data || []))
      .catch(err => { console.error(err); alert("Could not load quizzes"); })
      .finally(()=>setLoading(false));
  }, []);

  return (
    <div>
      {loading && <div className="meta">Loading quizzes...</div>}
      {!loading && quizzes.length === 0 && <div className="meta">No quizzes available</div>}

      <div className="grid" style={{marginTop:12}}>
        {quizzes.map(q => (
          <div key={q.id} className="quiz-card">
            <h3 className="quiz-title">{q.title}</h3>
            <p className="quiz-desc">{q.description || "No description"}</p>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
              <div className="meta">{q.timeLimitSeconds ? `${Math.floor(q.timeLimitSeconds/60)} min` : ""}</div>
              <button className="btn" onClick={()=>onTake(q)}>Take</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
