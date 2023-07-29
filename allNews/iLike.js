let likes = 0;
let hasLiked = false;

const likeButton = document.getElementById('likeButton');
const likeCount = document.getElementById('likeCount');

// Función para obtener los datos de "Me gusta" almacenados en el LocalStorage
function getLikes() {
  return JSON.parse(localStorage.getItem('likes')) || { count: 0, hasLiked: false };
}

// Función para guardar los datos de "Me gusta" en el LocalStorage
function saveLikes(likes) {
  localStorage.setItem('likes', JSON.stringify(likes));
}

// Función para actualizar el botón de "Me gusta"
function updateLikeButton() {
  const likes = getLikes();
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
likeButton.addEventListener('click', handleLikeButtonClick);

// Actualizar el botón de "Me gusta" al cargar la página
updateLikeButton();
