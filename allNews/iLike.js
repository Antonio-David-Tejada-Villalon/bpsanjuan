/*Likes*/
const like = document.getElementById('like')
const countLike = document.getElementById('count-like')

//Dislikes
const dislike = document.getElementById('dislike')
const countDislike = document.getElementById('count-dislike')

//Creando evento para hacer click en like

like.addEventListener('click', function(){
  if (countLike.textContent <= 0) {
    countLike.textContent++
    saveLikeToLocal()
    deleteDislikeToLocal()
    displayDislikeItem()
  } else {
    countLike.textContent--
    deleteLikeToLocal()
  }
})

//Mostrar el valor guardado en LocalStorage
function displayLikeItem(){
  let likeItem = localStorage.getItem("myLike")
  countLike.textContent = likeItem
}

//llamando a la funcion
displayLikeItem()

//Creando evento para hacer click en dislike

dislike.addEventListener('click', function(){
  if (countDislike.textContent <= 0) {
    countDislike.textContent++
    saveDislikeToLocal()
    deleteLikeToLocal()
    displayLikeItem()
  } else {
    countDislike.textContent--
    deleteDislikeToLocal()
  }
})

//Guardando Like en LocalStorage
function saveLikeToLocal () {
  localStorage.setItem('myLike', countLike.textContent)
}

//Eliminando Like en LocalStorage
function deleteLikeToLocal(){
  localStorage.removeItem('myLike')
}

//Guardando Dislike en LocalStorage
function saveDislikeToLocal () {
  localStorage.setItem('myDislike', countDislike.textContent)
}

//Eliminando Disike en LocalStorage
function deleteDislikeToLocal(){
  localStorage.removeItem('myDislike')
}

//Si cambio de Dislike a Like

//Mostrar el valor guardado en LocalStorage
function displayDislikeItem(){
  let dislikeItem = localStorage.getItem("myDislike")
  countDislike.textContent = dislikeItem
}

//Llamando a la funcion
displayDislikeItem()