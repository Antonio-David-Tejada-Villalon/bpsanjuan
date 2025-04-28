const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta del archivo JSON
const DATA_FILE = path.join(__dirname, 'data.json');

// Leer el archivo JSON
function readData() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo el archivo JSON:', error);
        return [];
    }
}

// Escribir en el archivo JSON
function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error escribiendo en el archivo JSON:', error);
    }
}

// Obtener todos los libros
app.get('/api/books', (req, res) => {
    const books = readData();
    if (books.length === 0) {
        return res.status(500).json({ error: 'Error al cargar los datos.' });
    }
    res.json(books);
});

// Actualizar el stock de un libro
app.put('/api/books/:code', (req, res) => {
    const { code } = req.params;
    const { stock } = req.body;

    // Validar entrada
    if (typeof stock !== 'number' || stock < 0) {
        return res.status(400).json({ error: 'El stock debe ser un número positivo.' });
    }

    let books = readData();
    if (books.length === 0) {
        return res.status(500).json({ error: 'Error al cargar los datos.' });
    }

    const bookIndex = books.findIndex(book => book.code === code);
    if (bookIndex === -1) {
        return res.status(404).json({ error: 'Libro no encontrado.' });
    }

    // Actualizar el stock
    books[bookIndex].stock = stock;
    writeData(books);

    res.json({ message: 'Stock actualizado correctamente.', book: books[bookIndex] });
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});