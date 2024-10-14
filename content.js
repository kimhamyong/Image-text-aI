// 영어 alt 텍스트 반환 함수
function getEnglishAltText() {
  return "This is an image";
}

// 한국어 alt 텍스트 반환 함수
function getKoreanAltText() {
  return "이미지입니다";
}

// 중국어 alt 텍스트 반환 함수
function getChineseAltText() {
  return "这是一张图片";
}

// 이미지에 alt 텍스트 추가 (처음 활성화 시)
function addAltTextToImages(language) {
  const images = document.querySelectorAll("img");

  images.forEach((img) => {
    const altText = img.getAttribute("alt");
    if (altText === null || altText === "") {
      let altValue;
      if (language === "en") {
        altValue = getEnglishAltText();
      } else if (language === "ko") {
        altValue = getKoreanAltText();
      } else if (language === "zh") {
        altValue = getChineseAltText();
      }
      img.setAttribute("alt", altValue);
      img.setAttribute("data-alt-added", "true");
      console.log(`Alt text added to image: ${img.src}`);
    }
  });
}

// 언어가 변경되었을 때, alt 텍스트 업데이트
function updateAltTextForLanguage(language) {
  const images = document.querySelectorAll('img[data-alt-added="true"]');

  images.forEach((img) => {
    let altValue;
    if (language === "en") {
      altValue = getEnglishAltText();
    } else if (language === "ko") {
      altValue = getKoreanAltText();
    } else if (language === "zh") {
      altValue = getChineseAltText();
    }
    img.setAttribute("alt", altValue);
    console.log(`Alt text updated to '${altValue}' for image: ${img.src}`);
  });
}

// 확장 프로그램이 비활성화되었을 때, alt 속성 제거
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
  let currentLanguage = result.language || "ko";

  if (isEnabled) {
    addAltTextToImages(currentLanguage);
  } else {
    removeAltTextFromImages();
  }

  let observer = observeForNewImages(isEnabled, currentLanguage);

  // 언어 변경 또는 확장 프로그램 상태 변경 메시지 수신
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "toggleExtension") {
      observer.disconnect();  // 기존 observer 해제
      observer = observeForNewImages(message.isEnabled, currentLanguage);  // 새로운 observer 재할당

      if (message.isEnabled) {
        addAltTextToImages(currentLanguage);
      } else {
        removeAltTextFromImages();
      }
    } else if (message.action === "changeLanguage") {
      currentLanguage = message.language || "ko";
      chrome.storage.local.get(["extensionEnabled"], function (res) {
        if (res.extensionEnabled) {
          updateAltTextForLanguage(currentLanguage);  // 활성화 상태일 때만 즉시 alt 속성 업데이트
        }
      });
    }
  });
});
