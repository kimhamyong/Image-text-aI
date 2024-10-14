document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
  
    images.forEach(img => {
      if (!img.hasAttribute('alt')) {
        img.setAttribute('alt', '이미지입니다');
      }
    });
  });