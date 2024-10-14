document.addEventListener("DOMContentLoaded", function () {
  const toggleSwitch = document.getElementById("toggleSwitch");
  const koButton = document.getElementById("ko");
  const enButton = document.getElementById("en");

  // 초기 스위치 상태를 스토리지에서 가져옴
  chrome.storage.local.get(["extensionEnabled", "language"], function (result) {
    toggleSwitch.checked = result.extensionEnabled || false;
    const language = result.language || "ko";
    setActiveLanguage(language);
  });

  // 스위치가 변경될 때 상태를 저장하고 background.js에 상태 전송
  toggleSwitch.addEventListener("change", function () {
    const isEnabled = this.checked;
    chrome.storage.local.set({ extensionEnabled: isEnabled }, function () {
      console.log("Extension enabled:", isEnabled);
    });

    // background.js에 상태 전송
    chrome.runtime.sendMessage({ action: "toggleExtension", isEnabled: isEnabled });
  });

  // 언어 버튼 클릭 이벤트
  koButton.addEventListener("click", function () {
    setActiveLanguage("ko");
  });

  enButton.addEventListener("click", function () {
    setActiveLanguage("en");
  });

  function setActiveLanguage(language) {
    if (language === "ko") {
      koButton.classList.add("active");
      enButton.classList.remove("active");
    } else {
      enButton.classList.add("active");
      koButton.classList.remove("active");
    }
    chrome.storage.local.set({ language: language }, function () {
      console.log("Language set to:", language);
    });
  }
});
