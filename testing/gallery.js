document.addEventListener("DOMContentLoaded", function () {
    // Ruta del archivo JSON con los enlaces a las imágenes
    const jsonURL = "images.json";

    // Obtener la referencia al contenedor de la galería
    const galleryContainer = document.getElementById("imageGallery");

    // Agregar el evento clic a las imágenes
    const images = galleryContainer.querySelectorAll(".card img");
    images.forEach(img => {
        img.addEventListener("click", toggleImageSize);
    });

    // Manejar el evento clic en las imágenes
    function toggleImageSize(event) {
        const img = event.target;
        if (!img.classList.contains("enlarged")) {
            // Si la imagen no está agrandada, agrégale la clase "enlarged"
            img.classList.add("enlarged");
            // Crea un div para la imagen agrandada y añádelo al cuerpo del documento
            const enlargedImage = document.createElement("div");
            enlargedImage.classList.add("enlarged-image");
            const imgClone = img.cloneNode(true);
            enlargedImage.appendChild(imgClone);
            document.body.appendChild(enlargedImage);
        } else {
            // Si la imagen está agrandada, quítale la clase "enlarged" y elimina la imagen agrandada
            img.classList.remove("enlarged");
            const enlargedImage = document.querySelector(".enlarged-image");
            document.body.removeChild(enlargedImage);
        }
    }

    // Realizar una solicitud HTTP para cargar el archivo JSON
    fetch(jsonURL)
        .then(response => response.json())
        .then(data => {
            // Recorrer el JSON y crear elementos de imagen para la galería
            data.forEach(imageURL => {
                const imageElement = document.createElement("div");
                imageElement.classList.add("col-lg-3", "col-md-4", "col-sm-6", "mb-4");
                imageElement.innerHTML = `
                    <div class="card">
                        <img src="${imageURL}" class="card-img-top img-fluid" alt="Imagen">
                    </div>
                `;
                galleryContainer.appendChild(imageElement);
            });

            // Agregar el evento clic a las imágenes
            const images = galleryContainer.querySelectorAll(".card img");
            images.forEach(img => {
                img.addEventListener("click", toggleImageSize);
            });
        })
        .catch(error => console.error("Error al cargar el JSON:", error));
});
