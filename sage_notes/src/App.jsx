import React, { useState, useEffect } from 'react';
import './App.css';
import orangeAura from './assets/aura/orange.jpg';
import pinkAura from './assets/aura/pink.jpg';
import greenAura from './assets/aura/green.jpg';
import peachAura from './assets/aura/peach.jpg';
import purpleAura from './assets/aura/purple.jpg';
import violetAura from './assets/aura/violet.jpg';

// Motivational quotes array
const motivationalQuotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The only limit to our realization of tomorrow is our doubts of today. - Franklin D. Roosevelt",
  "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
  "The expert in anything was once a beginner. - Helen Hayes",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The journey of a thousand miles begins with one step. - Lao Tzu",
  "Believe you can and you're halfway there. - Theodore Roosevelt"
];

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [timerType, setTimerType] = useState('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customTime, setCustomTime] = useState(25);
  const [quote, setQuote] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedAura, setSelectedAura] = useState('pink');

  // Persist selected aura across reloads
  useEffect(() => {
    try {
      const savedAura = localStorage.getItem('selectedAura');
      if (savedAura) setSelectedAura(savedAura);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('selectedAura', selectedAura);
    } catch {}
  }, [selectedAura]);
  
  // Popup states
  const [openPopups, setOpenPopups] = useState(new Set());
  const [popupPositions, setPopupPositions] = useState({
    timer: { x: 100, y: 100 },
    todo: { x: 200, y: 150 },
    notes: { x: 300, y: 200 },
    quote: { x: 150, y: 250 },
    aura: { x: 400, y: 100 }
  });
  const [dragging, setDragging] = useState({ isDragging: false, popup: null, offset: { x: 0, y: 0 } });

  // Set random quote on component mount
  useEffect(() => {
    const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    setQuote(randomQuote);
  }, []);

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      alert('Time is up!');
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Mouse event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging.isDragging && dragging.popup) {
        setPopupPositions(prev => ({
          ...prev,
          [dragging.popup]: {
            x: e.clientX - dragging.offset.x,
            y: e.clientY - dragging.offset.y
          }
        }));
      }
    };

    const handleMouseUp = () => {
      setDragging({ isDragging: false, popup: null, offset: { x: 0, y: 0 } });
    };

    if (dragging.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Add todo
  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo('');
    }
  };

  // Toggle todo completion
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Delete todo
  const deleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  // Timer functions
  const startTimer = () => {
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customTime * 60);
  };

  const setTimer = (minutes) => {
    setCustomTime(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Popup functions
  const getDefaultPosition = (popupName) => {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
    const positionsByPopup = {
      timer: { x: Math.round(vw * 0.06), y: Math.round(vh * 0.10) },          // top-left
      todo: { x: Math.round(vw * 0.72), y: Math.round(vh * 0.10) },           // top-right
      notes: { x: Math.round(vw * 0.06), y: Math.round(vh * 0.58) },          // bottom-left
      quote: { x: Math.round(vw * 0.72), y: Math.round(vh * 0.58) },          // bottom-right
      aura: { x: Math.round(vw * 0.38), y: Math.round(vh * 0.18) },           // top-center-ish
    };
    return positionsByPopup[popupName] || { x: Math.round(vw * 0.4), y: Math.round(vh * 0.2) };
  };

  const openPopup = (popupName) => {
    // Add to open set
    setOpenPopups(prev => new Set([...prev, popupName]));
    // If opening Motivation, pick a fresh random quote
    if (popupName === 'quote') {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setQuote(randomQuote);
    }
    // On initial open, place in a distinct area
    if (!openPopups.has(popupName)) {
      const { x, y } = getDefaultPosition(popupName);
      setPopupPositions(prev => ({
        ...prev,
        [popupName]: { x, y },
      }));
    }
  };

  const closePopup = (popupName) => {
    setOpenPopups(prev => {
      const next = new Set(prev);
      next.delete(popupName);
      return next;
    });
  };

  const handleMouseDown = (e, popupName) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDragging({
      isDragging: true,
      popup: popupName,
      offset: {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    });
  };

  // Get current aura background
  const getAuraBackground = () => {
    switch (selectedAura) {
      case 'orange':
        return orangeAura;
      case 'pink':
        return pinkAura;
      case 'green':
        return greenAura;
      case 'peach':
        return peachAura;
      case 'purple':
        return purpleAura;
      case 'violet':
        return violetAura;
      default:
        return pinkAura;
    }
  };

  return (
    <div className="app" style={{ backgroundImage: `url(${getAuraBackground()})` }}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <h1>Sage Notes</h1>
          </div>
          <nav className="navigation">
            <button onClick={() => openPopup('timer')}>Timer</button>
            <button onClick={() => openPopup('todo')}>Todo List</button>
            <button onClick={() => openPopup('notes')}>Notes</button>
            <button onClick={() => openPopup('quote')}>Motivation</button>
            <button onClick={() => openPopup('aura')}>Aura</button>
          </nav>
          <div className="contact-info" />
        </div>
      </header>



      {/* Timer Popup */}
      {openPopups.has('timer') && (
        <div 
          className="popup timer-popup"
          style={{
            left: popupPositions.timer.x,
            top: popupPositions.timer.y
          }}
        >
          <div 
            className="popup-header"
            onMouseDown={(e) => handleMouseDown(e, 'timer')}
          >
            <h3>Timer</h3>
            <button className="close-btn" onClick={() => closePopup('timer')}>×</button>
          </div>
          <div className="popup-content">
            <div className="timer-type-selector">
              <button 
                className={`timer-type-btn ${timerType === 'pomodoro' ? 'active' : 'inactive'}`}
                onClick={() => setTimerType('pomodoro')}
              >
                Pomodoro
              </button>
              <button 
                className={`timer-type-btn ${timerType === 'normal' ? 'active' : 'inactive'}`}
                onClick={() => setTimerType('normal')}
              >
                Normal Timer
              </button>
            </div>
            
            <div className="timer-display">
              <div className="time">{formatTime(timeLeft)}</div>
              <div className="timer-buttons">
                {!isRunning ? (
                  <button className="timer-btn start" onClick={startTimer}>
                    Start
                  </button>
                ) : (
                  <button className="timer-btn pause" onClick={pauseTimer}>
                    Pause
                  </button>
                )}
                <button className="timer-btn reset" onClick={resetTimer}>
                  Reset
                </button>
              </div>
            </div>

            <div className="time-presets">
              <button onClick={() => setTimer(15)}>15 min</button>
              <button onClick={() => setTimer(25)}>25 min</button>
              <button onClick={() => setTimer(45)}>45 min</button>
              <button onClick={() => setTimer(60)}>60 min</button>
            </div>

            <div className="custom-time">
              <label>Custom time (minutes):</label>
              <input 
                type="number" 
                value={customTime} 
                onChange={(e) => setTimer(parseInt(e.target.value) || 25)}
                min="1"
                max="120"
              />
            </div>
          </div>
        </div>
      )}

      {/* Todo Popup */}
      {openPopups.has('todo') && (
        <div 
          className="popup todo-popup"
          style={{
            left: popupPositions.todo.x,
            top: popupPositions.todo.y
          }}
        >
          <div 
            className="popup-header"
            onMouseDown={(e) => handleMouseDown(e, 'todo')}
          >
            <h3>Todo List</h3>
            <button className="close-btn" onClick={() => closePopup('todo')}>×</button>
          </div>
          <div className="popup-content">
            <div className="todo-input">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task..."
                onKeyPress={(e) => e.key === 'Enter' && addTodo()}
              />
              <button onClick={addTodo}>Add</button>
            </div>
            <div className="todo-list">
              {todos.map(todo => (
                <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                  />
                  <span className="todo-text">{todo.text}</span>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes Popup */}
      {openPopups.has('notes') && (
        <div 
          className="popup notes-popup"
          style={{
            left: popupPositions.notes.x,
            top: popupPositions.notes.y
          }}
        >
          <div 
            className="popup-header"
            onMouseDown={(e) => handleMouseDown(e, 'notes')}
          >
            <h3>Notes</h3>
            <button className="close-btn" onClick={() => closePopup('notes')}>×</button>
          </div>
          <div className="popup-content">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write your notes here..."
              rows="12"
            />
          </div>
        </div>
      )}

      {/* Quote Popup */}
      {openPopups.has('quote') && (
        <div 
          className="popup quote-popup"
          style={{
            left: popupPositions.quote.x,
            top: popupPositions.quote.y
          }}
        >
          <div 
            className="popup-header"
            onMouseDown={(e) => handleMouseDown(e, 'quote')}
          >
            <h3>Daily Motivation</h3>
            <button className="close-btn" onClick={() => closePopup('quote')}>×</button>
          </div>
          <div className="popup-content">
            <div className="quote-card">
              <p>"{quote}"</p>
            </div>
          </div>
        </div>
      )}

      {/* Aura Popup */}
      {openPopups.has('aura') && (
        <div 
          className="popup aura-popup"
          style={{
            left: popupPositions.aura.x,
            top: popupPositions.aura.y
          }}
        >
          <div 
            className="popup-header"
            onMouseDown={(e) => handleMouseDown(e, 'aura')}
          >
            <h3>Choose Your Aura</h3>
            <button className="close-btn" onClick={() => closePopup('aura')}>×</button>
          </div>
          <div className="popup-content">
            <div className="aura-picker">
              <button 
                className={`aura-btn ${selectedAura === 'pink' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('pink')}
              >
                <div className="aura-preview pink-aura"></div>
                <span>Pink Aura</span>
              </button>
              <button 
                className={`aura-btn ${selectedAura === 'orange' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('orange')}
              >
                <div className="aura-preview orange-aura"></div>
                <span>Orange Aura</span>
              </button>
              <button 
                className={`aura-btn ${selectedAura === 'green' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('green')}
              >
                <div className="aura-preview green-aura"></div>
                <span>Green Aura</span>
              </button>
              <button 
                className={`aura-btn ${selectedAura === 'peach' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('peach')}
              >
                <div className="aura-preview peach-aura"></div>
                <span>Peach Aura</span>
              </button>
              <button 
                className={`aura-btn ${selectedAura === 'purple' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('purple')}
              >
                <div className="aura-preview purple-aura"></div>
                <span>Purple Aura</span>
              </button>
              <button 
                className={`aura-btn ${selectedAura === 'violet' ? 'selected' : ''}`}
                onClick={() => setSelectedAura('violet')}
              >
                <div className="aura-preview violet-aura"></div>
                <span>Violet Aura</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
