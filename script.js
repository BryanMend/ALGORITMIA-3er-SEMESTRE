function esMayorDeEdad(edad) {
    if (edad <= 17) {
      return "Menor de edad";
    } else {
      return "Mayor de edad";
    }
  }
  
  function verificarEdad() {
    const edadInput = document.getElementById("edad");
    const resultadoParrafo = document.getElementById("resultado");
    const edad = parseInt(edadInput.value); // Convertir a entero
  
    if (isNaN(edad)) {
      resultadoParrafo.textContent = "Por favor, introduce una edad válida (un número).";
      return; // Salir de la función si la entrada no es válida
    }
  
    const resultado = esMayorDeEdad(edad);
    resultadoParrafo.textContent = "Eres " + resultado;
  }