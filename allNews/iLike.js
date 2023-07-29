// Función para obtener el valor de una cookie por su nombre
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
  
  // Función para establecer una cookie
  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
  }
  
  // Función para obtener los datos de "Me gusta" almacenados en la cookie
  function getLikes() {
    const likesCookie = getCookie('likes');
    return likesCookie ? JSON.parse(likesCookie) : { count: 0, hasLiked: false };
  }
  
  // Función para guardar los datos de "Me gusta" en la cookie
  function saveLikes(likes) {
    setCookie('likes', JSON.stringify(likes));
  }
  
  // Función para actualizar el botón de "Me gusta"
  function updateLikeButton() {
    const likes = getLikes();
    const likeButton = document.getElementById('likeButton');
    const likeCount = document.getElementById('likeCount');
    likeCount.textContent = likes.count;
    likeButton.innerHTML = `<i class="bi ${likes.hasLiked ? 'bi-heart-fill' : 'bi-heart'}"></i> <span id="likeCount">${likes.count}</span> Me gusta`;
  }
  
  // Función para manejar el clic en el botón de "Me gusta"
  function handleLikeButtonClick() {
    const likes = getLikes();
    if (likes.hasLiked) {
      likes.count--;
      likes.hasLiked = false;
    } else {
      likes.count++;
      likes.hasLiked = true;
    }
    saveLikes(likes);
    updateLikeButton();
  }
  
  // Agregar el evento click al botón de "Me gusta"
  document.getElementById('likeButton').addEventListener('click', handleLikeButtonClick);
  
  // Actualizar el botón de "Me gusta" al cargar la página
  updateLikeButton();
  