// src/components/Login.js
import React, { useState } from "react";
import API from "../api";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("PARTICIPANT");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      if (isRegister) {
        await API.post("/auth/register", { username, password, email, role });
        alert("Registered — check your email (if configured). Please sign in now.");
        setIsRegister(false);
      } else {
        const res = await API.post("/auth/login", { username, password });
        localStorage.setItem("username", username);
        localStorage.setItem("token", res.data.token || "");
        onLogin(res.data.token, res.data.role, username);
      }
    } catch (err) {
      console.error(err);
      alert("Action failed: " + (err?.response?.data?.error || err?.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="centered-form">
      <form onSubmit={submit}>
        <h2 className="h1">{isRegister ? "Register" : "Sign in"}</h2>

        <div style={{marginBottom:12}}>
          <input className="input" value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required />
        </div>

        {isRegister && (
          <>
            <div style={{marginBottom:12}}>
              <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" required />
            </div>

            <div style={{marginBottom:12}}>
              <select className="input" value={role} onChange={e=>setRole(e.target.value)}>
                <option value="PARTICIPANT">Participant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </>
        )}

        <div style={{marginBottom:14}}>
          <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required />
        </div>

        <div style={{display:"flex", justifyContent:"center", gap:10}}>
          <button className="btn" type="submit" disabled={loading}>
            {loading ? (isRegister ? "Registering..." : "Signing...") : (isRegister ? "Register" : "Sign in")}
          </button>
        </div>
      </form>

      <div style={{textAlign:"center", marginTop:14}}>
        {isRegister ? (
          <div className="meta">Already have account? <button className="btn ghost" onClick={()=>setIsRegister(false)}>Sign in</button></div>
        ) : (
          <div className="meta">New user? <button className="btn ghost" onClick={()=>setIsRegister(true)}>Register</button></div>
        )}
      </div>
    </div>
  );
}
