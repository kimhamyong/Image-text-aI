// background.js
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "toggleExtension") {
    const isEnabled = message.isEnabled;

    chrome.storage.local.set({ extensionEnabled: isEnabled }, function () {
      // 모든 탭에 확장 프로그램 상태 변경 메시지 전달
      chrome.tabs.query({}, function (tabs) {
        for (let tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { action: "toggleExtension", isEnabled: isEnabled });
        }
      });
    });

    if (!isEnabled) {
      console.log("Extension disabled.");
    }
  } else if (message.action === "changeLanguage") {
    const language = message.language;

    chrome.storage.local.set({ language: language }, function () {
      // 모든 탭에 언어 변경 메시지 전달
      chrome.tabs.query({}, function (tabs) {
        for (let tab of tabs) {
          chrome.tabs.sendMessage(tab.id, { action: "changeLanguage", language: language });
        }
      });
    });
  }
});
