require('dotenv').config();
const express = require('express');
const diagramRoutes = require('./routes/diagram');

const app = express();
app.use(express.json());

app.use('/api/diagram', diagramRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
