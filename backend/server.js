// app.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());


// Define the API endpoint
app.get('/api/data', (req, res) => {
  // Read the text file and send its contents as response
  fs.readFile('/Users/aj/Documents/GitHub/Capstone-499/backend/data.txt', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
    } else {
      res.json({ text: data });
    }
  });
});


// Start the server
const PORT = 4000; // Update the port number as desired
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
