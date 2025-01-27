const express = require("express");
const axios = require("axios");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const https = require('https');

const app = express();

// Middleware de seguridad
app.use(cors()); // Habilitar CORS para permitir acceso desde cualquier origen
app.use(helmet()); // Añadir encabezados de seguridad

const agent = new https.Agent({  
    rejectUnauthorized: false
  });



// Ruta principal del proxy
app.get("/proxy", async (req, res) => {
    const targetUrl = req.query.url; // URL de la API externa

    if (!targetUrl) {
      return res.status(400).json({ error: "Falta el parámetro 'url'" });
    }
  
    try {
      const bearerToken = req.headers["authorization"]; // Obtener el token del encabezado de la solicitud
  
      if (!bearerToken) {
        return res.status(401).json({ error: "Falta el token de autorización" });
      }

      console.log("URL objetivo:", targetUrl);
  
      const response = await axios({
        method: "GET",
        url: targetUrl,
        headers: {
          Authorization: bearerToken, // Reenviar el token al API externo
        },
        httpsAgent: agent
      });
  
      res.status(response.status).json(response.data);
      console.log("Respuesta exitosa:", response.status, response.data);
    } catch (error) {
      console.error("Error en el proxy:", error.message);
      res.status(500).json({ error: "Error al procesar la solicitud." });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor proxy escuchando en http://localhost:${PORT}`);
});
