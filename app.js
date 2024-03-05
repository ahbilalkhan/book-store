const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = process.env.NODE_ENV === 'test' ? 4000 : 5001; // Use port 4000 for test environment, and 3000 for all other environments
const { createBookSchema, updateBookSchema, getBookSchema } = require("./validation");
app.use(bodyParser.json());

let books = [];

try {
  fs.readFile('books.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      books = JSON.parse(data);
    }
  });
} catch (err) {
  console.error('Error reading file:', err);
}

function saveBooks() {
  try {
    fs.writeFile('books.json', JSON.stringify(books), (err) => {
      if (err) {
        console.error(err);
      }
    });
  } catch (err) {
    console.error('Error writing file:', err);
  }
}

app.get('/books', (req, res) => {
  res.json(books);
});

app.get('/books/:id', (req, res) => {
  try {
    const { error } = getBookSchema.validate(req.params); // Validate route parameters
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const book = books.find((b) => b.id === req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.error('Error handling GET /books/:id:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/books', (req, res) => {
  try {
    const { error } = createBookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const book = req.body;
    book.addedDate = new Date().toISOString();
    books.push(book);
    saveBooks();
    res.json(book);
  } catch (err) {
    console.error('Error handling POST /books:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.put('/books/:id', (req, res) => {
  try {
    const { error } = updateBookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const bookIndex = books.findIndex((b) => b.id === req.params.id);
    if (bookIndex === -1) {
      res.sendStatus(404);
    } else {
      const updatedBook = { ...books[bookIndex], ...req.body };
      updatedBook.id = req.params.id;
      books[bookIndex] = updatedBook;
      saveBooks();
      res.json(updatedBook);
    }
  } catch (err) {
    console.error('Error handling PUT /books/:id:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/books/:id', (req, res) => {
  try {
    const bookIndex = books.findIndex((b) => b.id === req.params.id);
    if (bookIndex === -1) {
      res.sendStatus(404);
    } else {
      const deletedBook = books.splice(bookIndex, 1)[0];
      saveBooks();
      res.json(deletedBook);
    }
  } catch (err) {
    console.error('Error handling DELETE /books/:id:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/statistics', (req, res) => {
  try {
    const stats = {
      count: books.length,
      averagePrice: books.reduce((total, b) => total + b.price, 0) / books.length,
      authors: [...new Set(books.map((b) => b.author))],
    };
    res.json(stats);
  } catch (err) {
    console.error('Error handling GET /statistics:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Catch-all route
app.use((req, res) => {
  res.status(404).send('Not Found');
});

const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

process.on('SIGINT', () => {
  console.log('Caught interrupt signal, exiting...');
  server.close(() => {
    console.log('Server closed.');
    process.exit();
  });
});

module.exports = app;
