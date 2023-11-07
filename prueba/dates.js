// // script.js
// document.addEventListener("DOMContentLoaded", () => {
//   cargarPersonasYMostrarCumpleanos();
// });

// async function cargarPersonasYMostrarCumpleanos() {
//   try {
//       const response = await fetch("personas.json");
//       const personas = await response.json();
//       mostrarCumpleanosBanner(personas);
//   } catch (error) {
//       console.error("Error al cargar personas:", error);
//   }
// }

// function mostrarCumpleanosBanner(personas) {
//   const cumpleanosBanner = document.getElementById("cumpleanosBanner");
//   const cumpleanosMensaje = document.getElementById("cumpleanosMensaje");

//   const personasCumpleanosHoy = personas.filter(persona => esCumpleanosHoy(persona.fechaNacimiento));

//   if (personasCumpleanosHoy.length > 0) {
//       cumpleanosMensaje.innerHTML = personasCumpleanosHoy.map(persona => `¡Feliz cumpleaños, ${persona.nombre}!`).join('<br>');
//       cumpleanosBanner.classList.remove("d-none");
//   } else {
//       cumpleanosBanner.classList.add("d-none");
//   }
// }

// function esCumpleanosHoy(fechaNacimientoString) {
//   const fechaNacimiento = new Date(fechaNacimientoString);
//   const hoy = new Date();
//   return fechaNacimiento.getMonth() === hoy.getMonth() && fechaNacimiento.getDate() === hoy.getDate();
// }

// script.js
document.addEventListener("DOMContentLoaded", () => {
  cargarPersonasYMostrarCumpleanos();
});

async function cargarPersonasYMostrarCumpleanos() {
  try {
      const response = await fetch("personas.json");
      const personas = await response.json();
      mostrarCumpleanosBanner(personas);
  } catch (error) {
      console.error("Error al cargar personas:", error);
  }
}

function mostrarCumpleanosBanner(personas) {
  const cumpleanosBanner = document.getElementById("cumpleanosBanner");
  const cumpleanosMensaje = document.getElementById("cumpleanosMensaje");

  const personasCumpleanosHoy = personas.filter(persona => esCumpleanosHoy(persona.fechaNacimiento));

  if (personasCumpleanosHoy.length > 0) {
      const mensajesCumpleanos = personasCumpleanosHoy.map(persona => {
          const edad = calcularEdad(persona.fechaNacimiento);
          return `¡Feliz ${edad} cumpleaños, ${persona.nombre}!`;
      });
      cumpleanosMensaje.innerHTML = mensajesCumpleanos.join('<br>');
      cumpleanosBanner.classList.remove("d-none");
  } else {
      cumpleanosBanner.classList.add("d-none");
  }
}

function esCumpleanosHoy(fechaNacimientoString) {
  const fechaNacimiento = new Date(fechaNacimientoString);
  const hoy = new Date();
  return fechaNacimiento.getMonth() === hoy.getMonth() && fechaNacimiento.getDate() === hoy.getDate();
}

function calcularEdad(fechaNacimientoString) {
  const fechaNacimiento = new Date(fechaNacimientoString);
  const hoy = new Date();

  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
  const mesActual = hoy.getMonth();
  const mesNacimiento = fechaNacimiento.getMonth();

  if (mesActual < mesNacimiento || (mesActual === mesNacimiento && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
  }

  return edad;
}

//Para Modal
document.addEventListener("DOMContentLoaded", function () {
  // Llamada a fetch para cargar personas.json
  fetch('personas.json')
    .then(response => response.json())
    .then(data => {
      // Guardar el JSON en la variable personas
      const personas = data;

      // Lógica para gestionar los cumpleaños y mostrar el modal
      gestionarCumpleanos(personas);
    });


  // Función para obtener la fecha actual en formato "MM/DD"
  function getFormattedDate() {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    return `${month}/${day}`;
  }

  // Función para gestionar los cumpleaños
  function gestionarCumpleanos() {
    // Obtenemos la fecha actual
    const fechaActual = getFormattedDate();

    // Filtramos las personas que cumplen hoy
    const cumpleHoy = personas.filter(persona => persona.fechaNacimiento === fechaActual);

    // Filtramos las personas que cumplirán en la próxima semana
    const cumpleProximaSemana = personas.filter(persona => {
      const diasRestantes = Math.floor((new Date(persona.fechaNacimiento) - new Date()) / (1000 * 60 * 60 * 24));
      return diasRestantes > 0 && diasRestantes <= 7;
    });

    // Mostramos el modal con la información
    if (cumpleHoy.length > 0 || cumpleProximaSemana.length > 0) {
      let modalContent = "";

      if (cumpleHoy.length > 0) {
        modalContent += `<p>Hoy es el cumpleaños de:</p>`;
        cumpleHoy.forEach(persona => {
          modalContent += `<p>${persona.nombre} (${persona.anioNacimiento})</p>`;
        });
      }

      if (cumpleProximaSemana.length > 0) {
        modalContent += `<p>Próximos cumpleaños:</p>`;
        cumpleProximaSemana.forEach(persona => {
          modalContent += `<p>${persona.nombre} (${persona.anioNacimiento}) - Faltan ${Math.floor((new Date(persona.fechaNacimiento) - new Date()) / (1000 * 60 * 60 * 24))} días</p>`;
        });
      }

      document.getElementById("cumpleanosInfo").innerHTML = modalContent;
      new bootstrap.Modal(document.getElementById('cumpleanosModal')).show();
    }
  }

  // Llamamos a la función de gestionar cumpleaños
  gestionarCumpleanos();
});

