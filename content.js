function addAltTextToImages() {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    const altText = img.getAttribute("alt");
    // alt 속성이 없을 경우에만 alt 속성 추가
    if (altText === null) {
      img.setAttribute("alt", "이미지입니다");
      img.setAttribute("data-alt-added", "true");  // 추적용 속성 추가
      console.log(`Alt text added to image: ${img.src}`);
    }
  });
}

// 확장 프로그램이 비활성화되었을 때, 이 확장 프로그램이 추가한 alt 속성 제거
function removeAltTextFromImages() {
  const images = document.querySelectorAll('img[data-alt-added="true"]');

  images.forEach((img) => {
    img.removeAttribute("alt");
    img.removeAttribute("data-alt-added");  // 추적용 속성도 제거
    console.log(`Alt text removed from image: ${img.src}`);
  });
}

// MutationObserver로 이미지 변화를 감지하고 alt 속성 추가/제거
function observeForNewImages(isEnabled) {
  const observer = new MutationObserver(() => {
    if (isEnabled) {
      addAltTextToImages();
    } else {
      removeAltTextFromImages();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 상태 변화 시 MutationObserver 해제하는 방법 필요
  return observer;
}

// 확장 프로그램 상태에 따라 alt 속성 추가 또는 제거
chrome.storage.local.get(["extensionEnabled"], function (result) {
  const isEnabled = result.extensionEnabled;

  if (isEnabled) {
    addAltTextToImages();
  } else {
    removeAltTextFromImages();
  }

  // MutationObserver 시작
  const observer = observeForNewImages(isEnabled);

  // 상태가 변경되면 observer를 통해 처리
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "toggleExtension") {
      observer.disconnect(); // 기존 observer 해제
      const newObserver = observeForNewImages(message.isEnabled); // 새 observer 시작

      if (message.isEnabled) {
        addAltTextToImages();
      } else {
        removeAltTextFromImages();
      }
    }
  });
});
