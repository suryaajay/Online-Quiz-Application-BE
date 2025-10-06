// src/components/TakeQuiz.js
import React, { useEffect, useState } from "react";
import API from "../api";

export default function TakeQuiz({ quiz, goBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimitSeconds || 0);

  useEffect(()=>{
    const username = localStorage.getItem("username");
    const headers = username ? { "X-User": username } : {};
    setLoading(true);
    API.get(`/participant/quizzes/${quiz.id}/questions`, { headers })
      .then(res => setQuestions(res.data || []))
      .catch(err => { console.error(err); alert("Could not load questions"); })
      .finally(()=>setLoading(false));
  }, [quiz]);

  useEffect(()=>{
    if (!quiz.timeLimitSeconds) return;
    setTimeLeft(quiz.timeLimitSeconds);
    const t = setInterval(()=>{
      setTimeLeft(prev=>{
        if (prev <= 1) { clearInterval(t); submit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return ()=>clearInterval(t);
  }, [quiz]);

  const choose = (qId, opt) => setAnswers(prev=> ({...prev, [qId]: opt}));

  const submit = async () => {
    try {
      setSubmitting(true);
      const username = localStorage.getItem("username");
      const headers = {"Content-Type":"application/json"};
      if (username) headers["X-User"] = username;
      const res = await API.post(`/participant/quizzes/${quiz.id}/submit`, answers, { headers });
      alert(`You scored ${res.data.score} / ${res.data.total}`);
      goBack();
    } catch (err) {
      console.error(err);
      alert("Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading questions...</div>;

  return (
    <div className="quiz-large">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
        <div className="meta">Time left: {timeLeft ? `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}` : "—"}</div>
        <div className="meta">Quiz: {quiz.title}</div>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className="question">
          <p>Q{idx+1}. {q.text}</p>
          <div className="meta">{q.marks || 1} pts</div>

          <div style={{marginTop:8}}>
            {["A","B","C","D"].map(opt=>{
              const label = q["option"+opt];
              if (!label) return null;
              return (
                <label key={opt} className="option">
                  <input type="radio" name={String(q.id)} checked={answers[q.id]===opt} onChange={()=>choose(q.id,opt)} />
                  <div>{opt}. {label}</div>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <div className="footer-row">
        <button className="btn" onClick={submit} disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</button>
        <button className="btn ghost right" onClick={goBack}>Back</button>
      </div>
    </div>
  );
}
