document.addEventListener('DOMContentLoaded', function() {
  fetch('data.json')
      .then(response => response.json())
      .then(data => {
          // Filtrar libros sin título vacío
          const books = data.filter(book => book.title.trim() !== "");

          const searchInput = document.getElementById('searchInput');
          const searchButton = document.getElementById('searchButton');
          const suggestionsList = document.getElementById('suggestions');
          const bookList = document.getElementById('bookList');
          const bookDetails = document.getElementById('bookDetails');

          // Mostrar sugerencias mientras escribe
          function showSuggestions(query) {
              const filtered = books.filter(book => 
                  book.title.toLowerCase().includes(query.toLowerCase()) ||
                  book.author.toLowerCase().includes(query.toLowerCase()) ||
                  book.editorial.toLowerCase().includes(query.toLowerCase())
              );
              
              suggestionsList.innerHTML = '';
              if (filtered.length === 0) return;

              filtered.forEach(book => {
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

          // Buscar libros
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

          // Mostrar detalles del libro
          function showDetails(book) {
              const formattedPrice = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(book.price);
              bookDetails.innerHTML = `
                  <div class="card mb-3">
                      <div class="row g-0">
                          <div class="col-md-4">
                              <img src="${book.image}" class="img-fluid rounded-start" alt="${book.title}">
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

          // Eventos
          searchInput.addEventListener('input', function() {
              const query = this.value.trim();
              if (query.length > 0) {
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
      .catch(error => console.error('Error:', error));
});