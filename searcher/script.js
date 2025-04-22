document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error de red: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Validación completa de datos
        const books = data.filter(book => 
          book.title && 
          book.author &&
          book.editorial &&
          typeof book.price === 'number' &&
          book.isbn &&
          book.dimensions &&
          typeof book.pages === 'number' &&
          book.code &&
          book.image
        ).map(book => ({
          ...book,
          code: String(book.code), // Asegurar que code sea string
          price: Number(book.price) // Asegurar que price sea número
        }));
        
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const suggestionsList = document.getElementById('suggestions');
        const bookList = document.getElementById('bookList');
        const bookDetails = document.getElementById('bookDetails');
  
        // Función para mostrar sugerencias
        function showSuggestions(query) {
          const filtered = books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.editorial.toLowerCase().includes(query.toLowerCase())
          );
          
          suggestionsList.innerHTML = '';
          if (filtered.length === 0) return;
          
          filtered.slice(0,10).forEach(book => { // Limitar a 10 resultados
            const li = document.createElement('li');
            li.textContent = `${book.title} - ${book.author} (${book.editorial})`;
            li.addEventListener('click', () => {
              searchInput.value = book.title;
              searchBooks(book.title);
              suggestionsList.innerHTML = '';
            });
            suggestionsList.appendChild(li);
          });
        }
  
        // Función para buscar libros
        function searchBooks(query) {
          const results = books.filter(book => 
            book.title.toLowerCase().includes(query.toLowerCase()) ||
            book.author.toLowerCase().includes(query.toLowerCase()) ||
            book.editorial.toLowerCase().includes(query.toLowerCase())
          );
          
          bookList.innerHTML = '';
          if (results.length === 0) {
            bookList.innerHTML = '<li class="list-group-item">No se encontraron resultados.</li>';
            return;
          }
          
          results.forEach(book => {
            const li = document.createElement('li');
            li.className = 'list-group-item';
            li.textContent = `${book.title} (${book.author}, ${book.editorial})`;
            li.addEventListener('click', () => showDetails(book));
            bookList.appendChild(li);
          });
        }
  
        // Función para mostrar detalles del libro
        function showDetails(book) {
          const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(book.price);
          bookDetails.innerHTML = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${book.image}" class="img-fluid rounded-start" alt="${book.title}" onerror="this.src='placeholder.jpg';">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${book.title}</h5>
                            <p class="card-text"><strong>Autor:</strong> ${book.author}</p>
                            <p class="card-text"><strong>Editorial:</strong> ${book.editorial}</p>
                            <p class="card-text"><strong>Precio:</strong> ${formattedPrice}</p>
                            <p class="card-text"><strong>ISBN:</strong> ${book.isbn}</p>
                            <p class="card-text"><strong>Dimensiones:</strong> ${book.dimensions}</p>
                            <p class="card-text"><strong>Páginas:</strong> ${book.pages}</p>
                            <p class="card-text"><strong>Código:</strong> ${book.code}</p>
                        </div>
                    </div>
                </div>
            </div>
          `;
        }
  
        // Event listeners
        searchInput.addEventListener('input', function() {
          const query = this.value.trim();
          if (query.length > 2) { // Mostrar sugerencias solo después de 2 caracteres
            showSuggestions(query);
          } else {
            suggestionsList.innerHTML = '';
          }
        });
  
        searchButton.addEventListener('click', function() {
          const query = searchInput.value.trim();
          if (query.length > 0) {
            searchBooks(query);
            suggestionsList.innerHTML = '';
          }
        });
      })
      .catch(error => {
        console.error('Error cargando los datos:', error);
        alert('Hubo un problema cargando los datos. Por favor, intente nuevamente más tarde.');
      });
  });