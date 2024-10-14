// 이미지에 alt 속성이 없거나 빈 문자열일 때만 "이미지입니다" 추가
function addAltTextToImages() {
    const images = document.querySelectorAll("img");
  
    images.forEach((img) => {
      const altText = img.getAttribute("alt");
      // alt 속성이 없을 경우에만 alt 속성 추가
      if (altText === null) {
        img.setAttribute("alt", "이미지입니다");
        console.log(`Alt text added to image: ${img.src}`);
      } else {
        console.log(`Image already has alt text: ${altText}`);
      }
    });
  }
  
  // 확장 프로그램이 활성화되었는지 확인 후 실행
  chrome.storage.local.get(["extensionEnabled"], function (result) {
    if (result.extensionEnabled) {
      addAltTextToImages();
    } else {
      console.log("Extension is disabled.");
    }
  });
  
  // 페이지 로드 완료 시 실행
  window.addEventListener('load', () => {
    chrome.storage.local.get(["extensionEnabled"], function (result) {
      if (result.extensionEnabled) {
        addAltTextToImages();
      }
    });
  });
  