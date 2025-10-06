import React, { useState, useEffect } from 'react';
import API from '../api';
import TakeQuiz from './TakeQuiz';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [taking, setTaking] = useState(null);

  useEffect(() => {
    API.get('/participant/quizzes').then(r => setQuizzes(r.data));
  }, []);

  if (taking) {
    return <TakeQuiz quiz={taking} goBack={()=>setTaking(null)} />;
  }

  return (
    <div>
      <h2>Participant dashboard</h2>
      <ul>
        {quizzes.map(q =>
          <li key={q.id}>
            {q.title} <button onClick={()=>setTaking(q)}>Take</button>
          </li>
        )}
      </ul>
    </div>
  );
}
