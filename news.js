document.addEventListener('DOMContentLoaded', function () {
  const itemsPerPage = 5; // Cantidad de noticias por página
  let currentPage = 1; // Página actual
  let newsData = []; // Variable para almacenar los datos de las noticias

  // Contenedor para la lista de noticias
  const newsList = document.getElementById('news-list');

  // Contenedor para la paginación
  const pagination = document.getElementById('pagination');

  // Función para mostrar las noticias de la página actual
  function showCurrentPageNews() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const newsToShow = newsData.slice(startIndex, endIndex);

    newsList.innerHTML = ''; // Limpiamos el contenido anterior

    newsToShow.forEach(news => {
      showNews(news);
    });

    showPagination();
  }

  // Función para mostrar la paginación
  function showPagination() {
    const totalPages = Math.ceil(newsData.length / itemsPerPage);

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      paginationHTML += `<li class="page-item ${currentPage === i ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }

    pagination.innerHTML = paginationHTML;
  }

  // Evento para cambiar de página
  pagination.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target.tagName === 'A') {
      currentPage = parseInt(event.target.dataset.page, 10);
      showCurrentPageNews();
    }
  });

  // Función para cargar las noticias desde data.json
  function loadNews() {
    fetch('data.json')
      .then(response => response.json())
      .then(data => {
        newsData = data;
        showCurrentPageNews(); // Mostrar las noticias de la página 1 inicialmente
      })
      .catch(error => {
        console.error('Error al cargar las noticias:', error);
      });
  }

  // Función para mostrar las noticias
  function showNews(news) {
    const article = document.createElement('article');
    article.classList.add('card', 'mb-4'); // Clases de Bootstrap para crear una card y agregar márgenes

    // Comprobar si el campo 'thumbnail' está definido y no está vacío
    if (news.thumbnail && news.thumbnail.trim() !== '') {
      const thumbnailImg = document.createElement('img');
      thumbnailImg.src = news.thumbnail;
      thumbnailImg.alt = news.title;
      thumbnailImg.classList.add('card-img-top');
      article.appendChild(thumbnailImg);
    }

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    cardBody.innerHTML = `
      <h2 class="card-title">${news.title}</h2>
      <p class="card-text">${news.content}</p>
      <a href="${news.link}" class="stretched-link"></a> <!-- Enlace a la noticia completa -->
    `;

    article.appendChild(cardBody);

    // Añadir el atributo 'id' a cada artículo
    article.setAttribute('id', `news-${news.id}`);

    newsList.appendChild(article);
  }

  // Cargar las noticias al cargar la página
  loadNews();

  // Evento para capturar la entrada del usuario en el formulario de búsqueda
  const searchForm = document.getElementById('search-form');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = searchForm.querySelector('input').value;
    searchNews(searchTerm);
  });

  // Función para realizar la búsqueda
  function searchNews(keyword) {
    const filteredNews = newsData.filter(news => {
      // Buscar coincidencias en el título y el contenido
      return news.title.toLowerCase().includes(keyword.toLowerCase()) ||
             news.content.toLowerCase().includes(keyword.toLowerCase());
    });

    // Mostrar solo las noticias filtradas
    newsList.innerHTML = ''; // Limpiamos el contenido anterior

    filteredNews.forEach(news => {
      showNews(news);
    });

    // Actualizar la paginación
    currentPage = 1;
    showPagination();
  }
});
