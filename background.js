// 확장 프로그램 상태를 받아 content.js 실행 여부 결정
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
        console.log("Extension disabled.");
      }
    }
  });
  
  // 확장 프로그램이 처음 로드될 때 상태를 모든 탭에 반영
  chrome.storage.local.get(["extensionEnabled"], function (result) {
    if (result.extensionEnabled) {
      chrome.tabs.query({}, function (tabs) {
        for (let tab of tabs) {
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
          });
        }
      });
    }
  });
  