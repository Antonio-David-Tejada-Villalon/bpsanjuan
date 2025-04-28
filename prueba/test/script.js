document.addEventListener('DOMContentLoaded', function () {
  fetch('data.json')
      .then(response => response.json())
      .then(data => {
          // Validación completa de datos
          const books = data.filter(book =>
              book.title.trim() !== "" &&
              book.author && typeof book.author === 'string' &&
              book.editorial && typeof book.editorial === 'string' &&
              typeof book.price === 'number' &&
              book.isbn && typeof book.isbn === 'string' &&
              book.dimensions && typeof book.dimensions === 'string' &&
              typeof book.pages === 'number' &&
              book.code && typeof book.code === 'string' &&
              typeof book.stock === 'number' &&
              book.image && typeof book.image === 'string'
          );

          const searchInput = document.getElementById('searchInput');
          const searchButton = document.getElementById('searchButton');
          const suggestionsList = document.getElementById('suggestions');
          const bookList = document.getElementById('bookList');
          const bookDetails = document.getElementById('bookDetails');
          const editStockForm = document.getElementById('editStockForm');
          const newStockInput = document.getElementById('newStock');
          const updateStockButton = document.getElementById('updateStockButton');
          const errorMessage = document.getElementById('errorMessage');

          let selectedBookCode = null;

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
                  li.textContent = `${book.title} - ${book.author || 'Autor desconocido'} (${book.editorial || 'Editorial desconocida'})`;
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
                  li.textContent = `${book.title} (${book.author || 'Autor desconocido'}, ${book.editorial || 'Editorial desconocida'})`;
                  li.addEventListener('click', () => showDetails(book));
                  bookList.appendChild(li);
              });
          }

          // Mostrar detalles del libro
          function showDetails(book) {
              selectedBookCode = book.code; // Guardar el código del libro seleccionado
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
                                  <p class="card-text"><strong>Autor:</strong> ${book.author || 'No disponible'}</p>
                                  <p class="card-text"><strong>Editorial:</strong> ${book.editorial || 'No disponible'}</p>
                                  <p class="card-text"><strong>Precio:</strong> ${formattedPrice}</p>
                                  <p class="card-text"><strong>ISBN:</strong> ${book.isbn || 'No disponible'}</p>
                                  <p class="card-text"><strong>Dimensiones:</strong> ${book.dimensions || 'No disponible'}</p>
                                  <p class="card-text"><strong>Páginas:</strong> ${book.pages || 'No disponible'}</p>
                                  <p class="card-text"><strong>Código:</strong> ${book.code || 'No disponible'}</p>
                                  <p class="card-text"><strong>Stock:</strong> ${book.stock || 0}</p>
                              </div>
                          </div>
                      </div>
                  </div>
              `;
              editStockForm.style.display = 'block'; // Mostrar el formulario de edición de stock
              newStockInput.value = book.stock || 0; // Precargar el stock actual
              errorMessage.textContent = ''; // Limpiar mensaje de error
          }

          // Actualizar stock
          updateStockButton.addEventListener('click', async () => {
              const newStock = parseInt(newStockInput.value, 10);
              if (isNaN(newStock) || newStock < 0) {
                  errorMessage.textContent = 'Por favor, ingresa un valor válido para el stock.';
                  return;
              }

              try {
                  const response = await fetch(`/api/books/${selectedBookCode}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ stock: newStock }),
                  });

                  if (!response.ok) {
                      const error = await response.json();
                      errorMessage.textContent = `Error al actualizar el stock: ${error.message || 'Ocurrió un error desconocido.'}`;
                      return;
                  }

                  alert('Stock actualizado correctamente.');
                  location.reload(); // Recargar la página para reflejar los cambios
              } catch (error) {
                  console.error('Error:', error);
                  errorMessage.textContent = 'Ocurrió un error al actualizar el stock.';
              }
          });

          // Eventos
          searchInput.addEventListener('input', function () {
              const query = this.value.trim();
              if (query.length > 0) {
                  showSuggestions(query);
              } else {
                  suggestionsList.innerHTML = '';
              }
          });

          searchButton.addEventListener('click', function () {
              const query = searchInput.value.trim();
              if (query.length > 0) {
                  searchBooks(query);
                  suggestionsList.innerHTML = '';
              }
          });
      })
      .catch(error => {
          console.error('Error cargando los datos:', error);
          alert('Hubo un problema cargando los datos. Por favor, inténtalo nuevamente más tarde.');
      });
});