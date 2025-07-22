// import { Router } from "express";
// const router = Router();

// router.get("/", async (req, res) => {
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
//             const data = await query.json(); // entire METAR object
//             console.log(data)
//             results[station] = {
//                 station: stationNames[station],
//                 time: new Date(data.time?.dt).toLocaleString("en-IN", {
//                     dateStyle: "long",
//                     timeStyle: "short",
//                     timeZone: "Asia/Kolkata"
//                 }),
//                 wind: data.wind_direction.repr + " at " + data.wind_speed.repr + " kt",
//                 visibility: data.visibility.repr + " m",
//                 temperature: data.temperature.repr + " °C",
//                 pressure: data.altimeter.value + " hPa",
//                 raw: data.raw
//             }
//         }



//         console.log(results);

//         res.render("METAR.ejs", { metarData: results });
//     } catch (error) {
//         console.error("Error fetching METAR:", error);
//         res.status(500).send("Failed to fetch METAR data.");
//     }
// });

// export default router