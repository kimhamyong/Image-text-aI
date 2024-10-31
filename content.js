// content.js

// 언어별 프롬프트 설정
const prompts = {
  "ko": "해당 이미지에 대한 설명해줘.",
  "en": "Please describe this image.",
  "zh": "请描述这张图片。",
  "es": "Por favor, describe esta imagen."
};

 // API 키 가져오기
 const apiKey = "${GEMINI_API_KEY}";;

// 이미지에 alt 텍스트 추가 함수
async function addAltTextToImages(language) {
  const images = document.querySelectorAll("img");

  for (let img of images) {
    const altText = img.getAttribute("alt");
    if (altText === null || altText === "") {
      try {
        let description = await getAltTextFromGeminiAPI(img, language);
        img.setAttribute("alt", description);
        img.setAttribute("data-alt-added", "true");
        console.log(`Alt text added to image: ${img.src}`);
      } catch (error) {
        console.error(`Failed to get alt text for image: ${img.src}`, error);
      }
    }
  }
}

// Gemini API를 통해 이미지 설명 가져오기
async function getAltTextFromGeminiAPI(img, language) {
  // 이미지 데이터를 base64로 변환
  const base64Data = await getBase64Image(img);

  // 언어에 맞는 프롬프트 선택
  const promptText = prompts[language] || prompts["ko"];

  // 요청 바디 구성
  const requestBody = {
    "contents": [
      {
        "parts": [
          { "text": promptText },
          {
            "inlineData": {
              "mimeType": "image/jpeg",
              "data": base64Data
            }
          }
        ]
      }
    ]
  };

  // Gemini API 호출
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  const data = await response.json();

  // API 응답을 출력하여 구조 확인 (디버깅용)
  console.log('API Response:', data);

  // 이미지 설명 추출
  if (
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0] &&
    data.candidates[0].content.parts[0].text
  ) {
    return data.candidates[0].content.parts[0].text.trim();
  } else {
    throw new Error("Invalid response from Gemini API: " + JSON.stringify(data));
  }
}

// 이미지 데이터를 base64로 변환하는 함수 (이미지 크기 및 품질 조정 포함)
function getBase64Image(img, maxWidth = 500, maxHeight = 500, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const imgElement = new Image();
    imgElement.crossOrigin = "Anonymous";
    imgElement.src = img.src;

    imgElement.onload = function () {
      let canvas = document.createElement("canvas");
      let width = imgElement.width;
      let height = imgElement.height;

      // 이미지의 비율을 유지하면서 크기를 조정
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        if (width > height) {
          width = maxWidth;
          height = Math.round(maxWidth / aspectRatio);
        } else {
          height = maxHeight;
          width = Math.round(maxHeight * aspectRatio);
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(imgElement, 0, 0, width, height);

      const dataURL = canvas.toDataURL("image/jpeg", quality);
      const base64Data = dataURL.replace(/^data:image\/(png|jpeg);base64,/, "");
      resolve(base64Data);
    };

    imgElement.onerror = function () {
      reject("Failed to load image for base64 conversion");
    };
  });
}

// 언어 변경 시 alt 텍스트 업데이트 함수
async function updateAltTextForLanguage(language) {
  const images = document.querySelectorAll('img[data-alt-added="true"]');

  for (let img of images) {
    try {
      let description = await getAltTextFromGeminiAPI(img, language);
      img.setAttribute("alt", description);
      console.log(`Alt text updated to '${description}' for image: ${img.src}`);
    } catch (error) {
      console.error(`Failed to update alt text for image: ${img.src}`, error);
    }
  }
}

// 확장 프로그램 비활성화 시 alt 속성 제거
function removeAltTextFromImages() {
  const images = document.querySelectorAll('img[data-alt-added="true"]');

  images.forEach((img) => {
    img.removeAttribute("alt");
    img.removeAttribute("data-alt-added"); // 추적용 속성 제거
    console.log(`Alt text removed from image: ${img.src}`);
  });
}

// MutationObserver 설정
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

  return observer;
}

// 초기화 함수
chrome.storage.local.get(["extensionEnabled", "language"], function (result) {
  const isEnabled = result.extensionEnabled;
  let currentLanguage = result.language || "ko";

  if (isEnabled) {
    addAltTextToImages(currentLanguage);
  } else {
    removeAltTextFromImages();
  }

  let observer = observeForNewImages(isEnabled, currentLanguage);

  // 메시지 수신 대기
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "toggleExtension") {
      observer.disconnect();
      observer = observeForNewImages(message.isEnabled, currentLanguage);

      if (message.isEnabled) {
        addAltTextToImages(currentLanguage);
      } else {
        removeAltTextFromImages();
      }
    } else if (message.action === "changeLanguage") {
      currentLanguage = message.language || "ko";
      chrome.storage.local.get(["extensionEnabled"], function (res) {
        if (res.extensionEnabled) {
          updateAltTextForLanguage(currentLanguage);
        }
      });
    }
  });
});

// API 키를 안전하게 가져오는 함수 (사용자가 설정한 API 키를 가져옵니다)
async function getAPIKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get("apiKey", function (result) {
      if (result.apiKey) {
        resolve(result.apiKey);
      } else {
        reject("API 키가 설정되지 않았습니다.");
      }
    });
  });
}
