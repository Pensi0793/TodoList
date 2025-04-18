import React, { useState } from 'react';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import TodoList from './components/TodoList';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="App">
      <header className="App-header">
        {token ? (
          <TodoList token={token} setToken={setToken} />
        ) : (
          <>
            {isLogin ? <Login setToken={setToken} /> : <Register setToken={setToken} />}
            <button
              className="App-link"
              onClick={() => setIsLogin(!isLogin)}
            >
              Chuyển sang {isLogin ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </>
        )}
      </header>
    </div>
  );
};

export default App;