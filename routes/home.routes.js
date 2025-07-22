import { Router } from "express";
const router = Router();
// , { metarData: pseudoMetarData }
// const pseudoMetarData = {
//     VIDP: {
//         station: "Delhi",
//         raw: "VIDP 301230Z 27008KT 6000 FEW020 SCT100 28/24 Q1013 NOSIG"
//     },
//     VAPO: {
//         station: "Pune",
//         raw: "VAPO 301230Z 28010KT 8000 SCT025 BKN100 26/22 Q1015 NOSIG"
//     },
//     VECC: {
//         station: "Kolkata",
//         raw: "VECC 301230Z 25012KT 7000 FEW015 SCT080 29/26 Q1012 NOSIG"
//     }
// };

// // Function to fetch real METAR data
// async function fetchMetarData() {
//     try {
//         const stationNames = {
//             VIDP: "Delhi",
//             VAPO: "Pune",
//             VECC: "Kolkata"
//         };
//         const stations = ["VIDP", "VAPO", "VECC"];
//         const results = {};

//         for (const station of stations) {
//             const query = await fetch(`https://avwx.rest/api/metar/${station}`, {
//                 headers: {
//                     Authorization: 'Bearer ZUowbtV5s6j3dEmaFAc3c6DEd9pbslXFZ8F5sf_YlVw'
//                 }
//             });
            
//             if (!query.ok) {
//                 throw new Error(`HTTP error! status: ${query.status}`);
//             }
            
//             const data = await query.json();
            
//             results[station] = {
//                 station: stationNames[station],
//                 raw: data.raw || `${station} data unavailable`
//             };
//         }
        
//         return results;
//     } catch (error) {
//         console.error("Error fetching METAR:", error);
//         return pseudoMetarData; // Fallback to pseudo data
//     }
// }

// Main route - returns immediately with pseudo data
router.get('/', (req, res) => {
    res.render('home.ejs');
});

// API endpoint for fetching real METAR data (this was missing!)
// router.get('/api/metar', async (req, res) => {
//     try {
//         const metarData = await fetchMetarData();
//         res.json(metarData);
//     } catch (error) {
//         console.error("API error:", error);
//         res.status(500).json({ 
//             error: "Failed to fetch METAR data",
//             fallback: pseudoMetarData 
//         });
//     }
// });

export default router;

// <!-- METAR Ticker Section -->
//         <!-- <div class="ticker-container" id="tickerWrapper">
//             <div class="ticker-content" id="ticker">
//                 <% // for (const code in metarData) { const data=metarData[code]; %>
//                     <span style="margin-right: 1.5rem;">
//                         <strong>
//                             <%= // data.station %>
//                         </strong>: <%= // data.raw %>
//                     </span>
//                     <% } %>
//             </div>
//             <div class="loading-indicator" id="loadingIndicator"></div>
//         </div> -->