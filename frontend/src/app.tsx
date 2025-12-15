import { useState } from 'react';
import './app.css';

/* Import Bootstrap's plugins to enable functionality */
import { Dropdown } from 'bootstrap'; // eslint-disable-line @typescript-eslint/no-unused-vars

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>AuroraHome</h1>
      <div className='card'>
        <button
          onClick={() => {
            setCount(count => count + 1);
          }}
        >
          count is {count}
        </button>
      </div>
    </>
  );
}

export default App;
