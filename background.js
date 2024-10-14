// background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "toggleExtension") {
    const isEnabled = message.isEnabled;

    if (isEnabled) {
      // 모든 열린 탭에 content.js를 실행하여 이미지 alt 속성을 추가
      chrome.tabs.query({}, function (tabs) {
        for (let tab of tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          });
        }
      });
    } else {
      // 확장 프로그램이 비활성화될 때 alt 속성 제거 로직 실행
      chrome.tabs.query({}, function (tabs) {
        for (let tab of tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: removeAltTextFromImages
          });
        }
      });
      console.log("Extension disabled.");
    }
  } else if (message.action === "changeLanguage") {
    const language = message.language;

    // 확장 프로그램이 활성화된 경우에만
    chrome.storage.local.get(["extensionEnabled"], function (result) {
      if (result.extensionEnabled) {
        // 모든 탭에 메시지를 보내서 언어 변경 처리
        chrome.tabs.query({}, function (tabs) {
          for (let tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "changeLanguage", language: language });
          }
        });
      }
    });
  }
});

// 확장 프로그램이 비활성화될 때 alt 속성을 제거하는 함수
function removeAltTextFromImages() {
  const images = document.querySelectorAll('img[data-alt-added="true"]');

  images.forEach((img) => {
    img.removeAttribute("alt");
    img.removeAttribute("data-alt-added"); // 추적용 속성 제거
    console.log(`Alt text removed from image: ${img.src}`);
  });
}
