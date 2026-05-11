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
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Filler,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type TooltipItem
} from 'chart.js';
import { api } from 'glidelite/frontend';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  isApiWeatherResponse,
  type WeatherDataDaily
} from '../../../../shared/apiWeather';
import useInterval from '../../hooks/useInterval';
import { useMessageAlert } from '../../hooks/useMessageAlert';

/**
 * Register all components for ChartJS.
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

/**
 * The rain level labels.
 */
const rainLevels = [
  { max: 2, label: 'Licht' },
  { max: 10, label: 'Matig' },
  { max: 25, label: 'Zwaar' }
];

/**
 * Set daily weather forecast to the window.
 * @param data the daily weather data
 */
function setDailyForecast(data?: WeatherDataDaily[]): void {
  const daily = document.getElementById('weather-widget-daily');
  if (daily) {
    const content = data ? data.map(item => {
      return [
        `<div class="col">`,
        `   <div>${new Date(item.timestamp * 1000).toLocaleDateString(navigator.languages[0] || navigator.language, { weekday: 'short' })}</div>`,
        `   <img style="margin: -1.25rem" class="img-fluid" src="${item.icon}">`,
        `   <div>${String(Math.round(item.max))}° <span class="text-disabled">${String(Math.round(item.min))}°</span></div>`,
        '</div>'
      ].join('');
    }).join('') : '';
    if (content !== daily.innerHTML) {
      daily.innerHTML = content;
    }
  }
}

/**
 * The weather widget component showing actual weather data.
 */
function WeatherWidget() {
  // Use the Message Alert context
  const messageAlert = useMessageAlert();

  // States for this component
  const [loaded, setLoaded] = useState(false);
  const [chartData, setChartData] = useState<ChartData<'line'>>({ datasets: [] });

  // Chart options
  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    scales: {
      y: {
        ticks: {
          callback: (value: number | string) => {
            for (const level of rainLevels) {
              if (value === level.max) {
                return level.label;
              }
            }
            return null;
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          autoSkipPadding: 50
        }
      }
    },
    plugins: {
      tooltip: {
        titleAlign: 'center',
        bodyAlign: 'center',
        displayColors: false,
        callbacks: {
          label: (item: TooltipItem<'line'>) => {
            if (item.datasetIndex === 0) {
              return `${item.formattedValue} mm/h`;
            }
            return '';
          }
        }
      }
    }
  };

  useInterval(() => {
    api.get({ path: '/weather', responseType: 'json', timeout: 1800 })
      .then(payload => {
        // Validate response payload
        if (!isApiWeatherResponse(payload)) {
          throw new Error();
        }

        // Construct and update chart data
        const data: ChartData<'line'> = {
          labels: [],
          datasets: [{
            fill: true,
            data: [],
            borderWidth: 0,
            pointRadius: 0,
            pointHoverRadius: 0,
            backgroundColor: 'rgba(53, 162, 235, 0.4)'
          }]
        };
        rainLevels.forEach(() => {
          data.datasets.push({
            fill: false,
            data: [],
            borderWidth: 1,
            pointRadius: 0,
            pointHoverRadius: 0,
            borderColor: 'rgba(210, 252, 240, 0.2)'
          });
        });
        let maxPrecipitation = 0;
        for (const minute of payload.minutely ?? []) {
          data.labels?.push(new Date(minute.timestamp * 1000).toLocaleTimeString(navigator.languages[0] || navigator.language).replace(/:00$/, ''));
          data.datasets[0].data.push(minute.precipitation);
          data.datasets[1].data.push(rainLevels[0].max);
          maxPrecipitation = Math.max(maxPrecipitation, minute.precipitation);
        }
        for (let i = 1; i < rainLevels.length; i++) {
          (payload.minutely ?? []).forEach(() => {
            if (maxPrecipitation > rainLevels[i - 1].max) {
              data.datasets[i + 1].data.push(rainLevels[i].max);
            }
          });
        }
        setChartData(data);

        // Display daily forecast
        setDailyForecast(payload.daily);

        // Display alerts
        if (payload.alerts) {
          for (const alert of payload.alerts) {
            if (Date.now() < (alert.end * 1000)) {
              messageAlert.showWarning(`<strong>${alert.event}</strong><br/>${alert.description}`);
            }
          }
        }

        setLoaded(true);
      }).catch(() => {
        setLoaded(false);
      });
  }, 2000);

  return (
    <>
      <div className='card placeholder-glow'>
        <div className={`card-body ${loaded ? '' : 'placeholder'}`}>
          <div id='weather-widget' className='carousel slide'>
            <div className='carousel-indicators'>
              <button type='button' data-bs-target='#weather-widget' data-bs-slide-to='0' className='active' aria-current='true' aria-label='Slide 1'></button>
              <button type='button' data-bs-target='#weather-widget' data-bs-slide-to='1' aria-label='Slide 2'></button>
              <button type='button' data-bs-target='#weather-widget' data-bs-slide-to='2' aria-label='Slide 3'></button>
            </div>
            <div className='carousel-inner' style={{ height: '120px' }}>
              <div className='carousel-item active'>
                <div className='row text-center' id='weather-widget-daily' />
              </div>
              <div className='carousel-item' style={{ height: '120px' }}>
                <Line className={loaded ? '' : 'd-none'} options={chartOptions} data={chartData} />
              </div>
              <div className='carousel-item'>
                TODO
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default WeatherWidget;
