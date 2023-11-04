const express = require('express');

const cors = require('cors');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json()); // Add this line

const dataFilePath = path.join(__dirname, 'data.txt');

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

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
    } else {
      const updatedData = data.length > 0 && !data.endsWith('\n') ? data + '\n' + newEntry : data + newEntry;

      fs.writeFile(dataFilePath, updatedData, 'utf8', (err) => {
        if (err) {
          console.error('Error writing file:', err);
          res.status(500).json({ error: 'Error writing file' });
        } else {
          res.status(200).json({ message: 'Word added successfully' });
        }
      });
    }
  });
});

// Define the PUT API endpoint for updating words
app.put('/api/data/update', (req, res) => {
  const originalWord = req.body.originalWord;
  const updatedWord = req.body.updatedWord;
  const updatedDefinition = req.body.updatedDefinition;

  fs.readFile(dataFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      res.status(500).json({ error: 'Error reading file' });
    } else {
      const wordList = data.split('\n');
      const wordIndex = wordList.findIndex((entry) => entry.startsWith(originalWord + ' - '));

      if (wordIndex !== -1) {
        wordList[wordIndex] = `${updatedWord} - ${updatedDefinition}`;
        const updatedData = wordList.join('\n');

        fs.writeFile(dataFilePath, updatedData, 'utf8', (err) => {
          if (err) {
            console.error('Error writing file:', err);
            res.status(500).json({ error: 'Error writing file' });
          } else {
            res.status(200).json({ message: 'Word updated successfully' });
          }
        });
      } else {
        res.status(404).json({ error: 'Word not found' });
      }
    }
  });
});

// Start the server
const PORT = 4000; // Update the port number as desired
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
