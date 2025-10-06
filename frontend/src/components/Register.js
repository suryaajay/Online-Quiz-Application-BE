import React, {useState} from 'react';
import API from '../api';

export default function Register(){
  const [u,setU] = useState(''); const [p,setP] = useState('');
  const onSubmit = async e => {
    e.preventDefault();
    try{
      await API.post('/auth/register', { username: u, password: p, role: 'PARTICIPANT' });
      alert('registered');
    }catch(err){ alert('error'); }
  };
  return (<form onSubmit={onSubmit}>
    <h3>Register</h3>
    <input placeholder='username' value={u} onChange={e=>setU(e.target.value)} /><br/>
    <input placeholder='password' type='password' value={p} onChange={e=>setP(e.target.value)} /><br/>
    <button>Register</button>
  </form>);
}
