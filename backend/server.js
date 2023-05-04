const express = require('express');
const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Add this line

const dataFilePath = '/Users/ekow_t/Desktop/Capstone-499/backend/data.txt';

// Define the GET API endpoint
app.get('/api/data', (req, res) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
    } else {
      res.json({ text: data });
    }
  });
});

// Define the DELETE API endpoint
app.delete('/api/data/delete', (req, res) => {
  const wordToDelete = req.body.text;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
    } else {
      const wordList = data.split('\n');
      const updatedWordList = wordList.filter((entry) => !entry.startsWith(wordToDelete + ' - '));
      const updatedData = updatedWordList.join('\n');

      fs.writeFile(dataFilePath, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          res.status(500).json({ error: 'Error writing file' });
        } else {
          res.status(200).json({ message: 'Word deleted successfully' });
        }
      });
    }
  });
});

// Define the POST API endpoint for adding words
app.post('/api/data/add', (req, res) => {
  const newWord = req.body.text;
  const newDefinition = req.body.definition;
  const newEntry = `${newWord} - ${newDefinition}\n`;

  fs.appendFile(dataFilePath, newEntry, 'utf8', (err) => {
    if (err) {
      console.error('Error appending to file:', err);
      res.status(500).json({ error: 'Error appending to file' });
    } else {
      res.status(200).json({ message: 'Word added successfully' });
    }
  });
});

// Start the server
const PORT = 4000; // Update the port number as desired
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
