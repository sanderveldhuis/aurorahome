/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import './app.css';
import Dashboard from './components/Dashboard.tsx';
import MessagePopup from './components/MessagePopup.tsx';
import Navbar from './navbar.tsx';
import NavMenu from './navmenu.tsx';
import Profile from './profile.tsx';
import MessagePopupProvider from './providers/MessagePopupProvider.tsx';
import WindowProvider from './providers/WindowProvider.tsx';
import Settings from './settings.tsx';
import UserMenu from './usermenu.tsx';

function App() {
  return (
    <>
      <WindowProvider>
        <MessagePopupProvider>
          <MessagePopup />
          <Navbar />
          <UserMenu />
          <div className='container-fluid'>
            <div className='container-row row'>
              <NavMenu />
              <main className='container-col col h-100 overflow-y-auto'>
                <Dashboard />
                <Settings />
                <Profile />
              </main>
            </div>
          </div>
        </MessagePopupProvider>
      </WindowProvider>
    </>
  );
}

export default App;
