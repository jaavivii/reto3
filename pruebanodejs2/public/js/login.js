$(document).ready(function() {
    $("input").focus(function() {
      $(this).addClass("animate__animated animate__pulse");
    });
    $("input").focusout(function() {
      $(this).removeClass("animate__animated animate__pulse");
    });
  
    // Cargar imagen de fondo aleatoria de Unsplash relacionada con el mar o los bosques
    var unsplashURL = "https://source.unsplash.com/random?featured&orientation=landscape&query=sea,forest";
  
    // Asegurarse de que la imagen esté completamente cargada antes de aplicarla como fondo
    var img = new Image();
    img.src = unsplashURL;
    img.onload = function() {
      $("body").css("background-image", "url(" + unsplashURL + ")");
    };
  });