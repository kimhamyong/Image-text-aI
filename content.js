function addAltTextToImages(language) {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    const altText = img.getAttribute("alt");
    if (altText === null || altText === "") {
      const altValue = language === "en" ? "This is an image" : "이미지입니다";
      img.setAttribute("alt", altValue);
      img.setAttribute("data-alt-added", "true");
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
function observeForNewImages(isEnabled, language) {
  const observer = new MutationObserver(() => {
    if (isEnabled) {
      addAltTextToImages(language);
    } else {
      removeAltTextFromImages();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return observer; // 상태 변화 시 MutationObserver 해제
}

// 확장 프로그램 상태에 따라 alt 속성 추가 또는 제거
chrome.storage.local.get(["extensionEnabled", "language"], function (result) {
  const isEnabled = result.extensionEnabled;
  const language = result.language || "ko";

  if (isEnabled) {
    addAltTextToImages(language);
  } else {
    removeAltTextFromImages();
  }

  const observer = observeForNewImages(isEnabled, language);

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "toggleExtension") {
      observer.disconnect();
      const newObserver = observeForNewImages(message.isEnabled, language);

      if (message.isEnabled) {
        addAltTextToImages(language);
      } else {
        removeAltTextFromImages();
      }
    } else if (message.action === "changeLanguage") {
      const newLanguage = message.language || "ko";
      addAltTextToImages(newLanguage); // 새로운 언어 적용
    }
  });
});
