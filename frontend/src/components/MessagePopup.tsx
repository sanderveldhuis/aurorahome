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

import {
  useEffect,
  useRef,
  useState
} from 'react';
import './MessagePopup.scss';
import { Modal } from 'bootstrap';
import useInterval from '../hooks/useInterval';
import { useMessagePopup } from '../hooks/useMessagePopup';

/**
 * The Message Popup component showing messages in a Modal.
 */
function MessagePopup() {
  // Use the Message Popup context
  const context = useMessagePopup();

  // States for this component
  const [state, setState] = useState<'success' | 'error'>('success');
  const [message, setMessage] = useState('');
  const [progressRunning, setProgressRunning] = useState(false);
  const progress = useRef(0);

  // Create the Modal reference after rendering otherwise the getElementById does not find the element
  const modal = useRef<Modal>(null);
  useEffect(() => {
    const element = document.getElementById('message-popup');
    if (element) {
      modal.current ??= new Modal(element);
    }
  }, []);

  // Closes the Modal and stops the interval hook
  const closeModal = () => {
    setProgressRunning(false);
    context.showSuccess('');
    context.showError('');
    modal.current?.hide();
  };

  // Updates progress and closes the Modal
  useInterval(
    () => {
      if (progress.current < 0) {
        closeModal();
      }
      else {
        const element = document.getElementById('message-popup-progress');
        if (element) {
          progress.current -= 0.25;
          element.style.width = `${String(progress.current)}%`;
        }
      }
    },
    10,
    progressRunning
  );

  // Show the Modal based on changes in the context
  useEffect(() => {
    if (modal.current) {
      if (context.success !== '') {
        (() => {
          setState('success');
          setMessage(context.success);
          setProgressRunning(true);
        })();
        progress.current = 100;
        modal.current.show();
      }
      else if (context.error !== '') {
        (() => {
          setState('error');
          setMessage(context.error);
          setProgressRunning(true);
        })();
        progress.current = 100;
        modal.current.show();
      }
    }
  }, [context]);

  return (
    <>
      <div className={`message-popup message-popup-${state} modal fade`} id='message-popup' data-bs-backdrop='static' data-bs-keyboard='false'>
        <div className='modal-dialog modal-dialog-centered align-items-end'>
          <div className='modal-content'>
            <div className='modal-body d-flex'>
              <svg width='24' height='24' viewBox='0 0 16 16'>
                {state === 'success' && <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z' />}
                {state === 'error' && <path d='M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z' />}
              </svg>
              <h1 className='modal-title me-auto ms-2 fs-6'>{message}</h1>
              <button
                type='button'
                className='btn-close btn-close-white ms-4'
                data-bs-dismiss='modal'
                onClick={closeModal}
              />
            </div>
            <div className='modal-body pt-0'>
              <div className='progress' role='progressbar' style={{ height: '5px' }}>
                <div className={`progress-bar bg-${state}`} style={{ transition: 'none' }} id='message-popup-progress' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MessagePopup;
