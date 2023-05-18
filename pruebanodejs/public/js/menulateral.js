document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const closeBtn = document.getElementById('close-btn');
  const sideMenu = document.getElementById('side-menu');
  const mainContent = document.getElementById('main-content');

  // Función para abrir el menú lateral
  function openSideMenu() {
    sideMenu.style.width = '300px';
    mainContent.style.marginLeft = '300px';
    hamburgerBtn.style.display = 'none';
  }

  // Función para cerrar el menú lateral
  function closeSideMenu() {
    sideMenu.style.width = '0';
    mainContent.style.marginLeft = '0';
    hamburgerBtn.style.display = 'block';
  }

  // Evento para abrir el menú al hacer clic en el botón hamburguesa
  hamburgerBtn.addEventListener('click', openSideMenu);

  // Evento para cerrar el menú al hacer clic en el botón cerrar
  closeBtn.addEventListener('click', closeSideMenu);

  // Evento para actualizar el ancho del menú lateral cuando cambia el tamaño de la ventana
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) { // Ajusta aquí el ancho de la ventana a partir del cual quieres que se actualice el menú
      sideMenu.style.width = '300px';
      mainContent.style.marginLeft = '300px';
    } else {
      sideMenu.style.width = '0';
      mainContent.style.marginLeft = '0';
      hamburgerBtn.style.display = 'block';
    }
  });
});
