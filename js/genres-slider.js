document.addEventListener( 'DOMContentLoaded', function () {
  new Splide( '#genresSplide', {
    type      : 'loop',
    perPage   : 4,      // по умолчанию
    perMove   : 1,
    gap       : '20px',
    pagination: false,
    breakpoints: {
      1200: {
        perPage: 4,
      },
      992: {
        perPage: 3,
      },
      768: {
        perPage: 2,
      },
      480: {
        perPage: 1,
      }
    },
  } ).mount();
} );
