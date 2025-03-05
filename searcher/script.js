// Cargar datos de libros desde el archivo JSON
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    const books = data;

    // Referencias a elementos del DOM
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const suggestionsList = document.getElementById('suggestions');
    const bookList = document.getElementById('bookList');
    const bookDetails = document.getElementById('bookDetails');

    // Función para mostrar sugerencias
    function showSuggestions(query) {
      const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.editorial.toLowerCase().includes(query.toLowerCase())
      );
      suggestionsList.innerHTML = ''; // Limpiar lista

      if (filteredBooks.length > 0) {
        filteredBooks.forEach(book => {
          const li = document.createElement('li');
          li.textContent = `${book.title} (${book.author}, ${book.editorial})`;
          li.addEventListener('click', () => {
            searchInput.value = book.title; // Seleccionar sugerencia
            suggestionsList.innerHTML = ''; // Ocultar sugerencias
            searchBooks(book.title); // Buscar el libro seleccionado
          });
          suggestionsList.appendChild(li);
        });
      } else {
        suggestionsList.innerHTML = '<li class="list-group-item list-group-item-danger">No se encontraron sugerencias.</li>';
      }
    }

    // Función para buscar libros
    function searchBooks(query) {
      const results = books.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.editorial.toLowerCase().includes(query.toLowerCase())
      );

      bookList.innerHTML = ''; // Limpiar lista

      if (results.length > 0) {
        results.forEach(book => {
          const li = document.createElement('li');
          li.className = 'list-group-item list-group-item-action list-group-item-primary';

          // Mostrar título, autor y editorial en los resultados
          li.textContent = `${book.title} (${book.author}, ${book.editorial})`;

          // Agregar evento clic para ver detalles
          li.addEventListener('click', () => showBookDetails(book));

          // Agrupar libros por autor o editorial si hay coincidencias múltiples
          if (query.toLowerCase() === book.author.toLowerCase() || query.toLowerCase() === book.editorial.toLowerCase()) {
            li.classList.add('text-primary'); // Resaltar coincidencias por autor/editorial
          }

          bookList.appendChild(li);
        });
      } else {
        bookList.innerHTML = '<li class="list-group-item list-group-item-danger">No se encontraron libros.</li>';
      }
    }

    // Función para mostrar detalles del libro
    function showBookDetails(book) {
      bookDetails.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Autor:</strong> ${book.author}</p>
        <p><strong>Editorial:</strong> ${book.editorial}</p>
        <p><strong>Precio:</strong> $${book.price.toFixed(2)}</p>
        <p><strong>ISBN:</strong> ${book.isbn}</p>
        <p><strong>Dimensiones:</strong> ${book.dimensions}</p>
        <p><strong>Páginas:</strong> ${book.pages}</p>
        <p><strong>Código:</strong> ${book.code}</p>
      `;
    }

    // Evento al escribir en el input
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        showSuggestions(query);
      } else {
        suggestionsList.innerHTML = '';
      }
    });

    // Evento al hacer clic en el botón de búsqueda
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchBooks(query);
        suggestionsList.innerHTML = ''; // Ocultar sugerencias
      }
    });
  })
  .catch(error => console.error('Error al cargar los datos:', error));