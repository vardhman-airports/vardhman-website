// document.addEventListener('DOMContentLoaded', function() {
//   const wrapper = document.getElementById('tickerWrapper');
//   const ticker = document.getElementById('ticker');
//   const loadingIndicator = document.getElementById('loadingIndicator');
//   const stations = ['VIDP', 'VAPO', 'VECC'];

//   // Pause/unpause ticker on click
//   if (wrapper && ticker) {
//     wrapper.addEventListener('click', () => {
//       ticker.classList.toggle('paused');
//     });
//   }

//   // Function to update METAR data
//   async function updateMetarData() {
//     try {
//       loadingIndicator.classList.add('show');
//       ticker.classList.add('updating');
//       const response = await fetch('/api/metar');
//       const data = await response.json();
//       let newContent = '';
//       for (const code in data) {
//         const station = data[code];
//         newContent += `<span style="margin-right: 1.5rem;"><strong>${station.station}</strong>: ${station.raw}</span>`;
//       }
//       ticker.style.opacity = '0.5';
//       setTimeout(() => {
//         ticker.innerHTML = newContent;
//         ticker.style.opacity = '1';
//         ticker.classList.remove('updating');
//         loadingIndicator.classList.remove('show');
//       }, 300);
//     } catch (error) {
//       console.error('Failed to update METAR data:', error);
//       loadingIndicator.classList.remove('show');
//       ticker.classList.remove('updating');
//     }
//   }

//   // Initial and periodic METAR updates
//   window.addEventListener('load', () => {
//     setTimeout(updateMetarData, 1000);
//     setInterval(updateMetarData, 10 * 60 * 1000);
//   });

//   // Optional: Update station status (if you use those elements)
//   stations.forEach(station => {
//     const element = document.getElementById(`${station}-status`);
//     if (element) {
//       element.textContent = 'Loading...';
//       element.className = 'loading';
//     }
//   });

//   fetch('/api/metar')
//     .then(response => {
//       if (!response.ok) throw new Error('Network response was not ok');
//       return response.json();
//     })
//     .then(data => {
//       Object.keys(data).forEach(stationCode => {
//         const station = data[stationCode];
//         const rawElement = document.getElementById(`${stationCode}-raw`);
//         if (rawElement) rawElement.textContent = station.raw;
//         const nameElement = document.getElementById(`${stationCode}-name`);
//         if (nameElement) nameElement.textContent = station.station;
//         const statusElement = document.getElementById(`${stationCode}-status`);
//         if (statusElement) {
//           statusElement.textContent = 'Live Data';
//           statusElement.className = 'live';
//         }
//       });
//     })
//     .catch(error => {
//       console.error('Error fetching METAR data:', error);
//       stations.forEach(station => {
//         const statusElement = document.getElementById(`${station}-status`);
//         if (statusElement) {
//           statusElement.textContent = 'Using cached data';
//           statusElement.className = 'cached';
//         }
//       });
//     });
// });