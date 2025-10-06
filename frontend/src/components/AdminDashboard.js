// src/components/AdminDashboard.js
import React, { useState } from "react";
import API from "../api";

export default function AdminDashboard() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [quizId, setQuizId] = useState(null);

  const createQuiz = async () => {
    try {
      const res = await API.post("/admin/quizzes", {
        title,
        description: desc,
      });
      setQuizId(res.data.id);
      alert("Quiz created id=" + res.data.id);
    } catch (e) {
      console.error(e);
      alert("Create failed");
    }
  };

  const addQuestion = async (q) => {
    try {
      await API.post(`/admin/quizzes/${quizId}/questions`, q);
      alert("Question added");
    } catch (e) {
      console.error(e);
      alert("Add question failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Admin</h2>
      <div className="mb-4">
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="p-2 border rounded mr-2" />
        <input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="p-2 border rounded mr-2" />
        <button onClick={createQuiz} className="px-3 py-2 bg-blue-600 text-white rounded">Create</button>
      </div>
      {quizId && <div>Created quiz id: {quizId}</div>}
      {/* You can add a simple UI here for adding questions; for brevity, I'm not building full form */}
    </div>
  );
}
