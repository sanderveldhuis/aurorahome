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

import './App.scss';
import DataTablesCore from 'datatables.net-bs5';
import DataTable from 'datatables.net-react';
import MessagePopup from './components/MessagePopup.tsx';
import NavBar from './components/NavBar.tsx';
import NavMenu from './components/NavMenu.tsx';
import UserMenu from './components/UserMenu.tsx';
import MessagePopupProvider from './providers/MessagePopupProvider.tsx';
import RouterProvider from './providers/RouterProvider.tsx';
import Router from './routes/Router.tsx';

/**
 * The App component showing the full application.
 */
function App() {
  // Use Bootstrap DataTables
  DataTable.use(DataTablesCore);

  return (
    <>
      <RouterProvider>
        <MessagePopupProvider>
          <MessagePopup />
          <NavBar />
          <UserMenu />
          <div className='container-fluid'>
            <div className='container-row row'>
              <NavMenu />
              <main className='container-col col h-100 overflow-y-auto'>
                <Router />
              </main>
            </div>
          </div>
        </MessagePopupProvider>
      </RouterProvider>
    </>
  );
}

export default App;
