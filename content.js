// content.js

// 언어별 프롬프트 설정
// 언어별 프롬프트 설정
const prompts = {
  "ko": "홍길동(26세, 남성)은 시각장애를 가진 사회초년생이며 사무직에서 근무 중입니다. 그는 스크린 리더기를 통해 디지털 환경을 이용하며, 이미지나 그래픽 자료에 대체 텍스트가 제공되기를 원합니다. 다음 규칙을 참고하여 이미지에 대한 설명을 작성해 주세요:\n\n- 2줄 이내로 자세하게 설명\n- bullet 형식을 피하고 자연스러운 문장으로 작성\n- '이미지 설명:' 또는 '대체 텍스트:'로 시작하지 않고 이미지 자체를 설명\n- 사물 또는 인물의 위치를 명확하게 서술",
  "en": "Hong Gildong, a 26-year-old male with visual impairment, works in an office environment as a novice employee. He uses screen readers to access digital content and prefers alternative text for images or graphics. Please write an image description following these rules:\n\n- Detailed, in no more than 2 sentences\n- Avoid bullet points; write in a natural sentence form\n- Do not start with 'Image description:' or 'Alt text:'; describe the image directly\n- Clearly state the position of objects or people in the image",
  "zh": "洪吉东，26岁，男性，有视力障碍，初入职场，办公室职员，习惯使用屏幕阅读器来浏览数字内容，希望图片或图形包含替代文字。请遵循以下规则生成图像描述：\n\n- 不超过2句详细描述\n- 避免使用项目符号，采用自然句式\n- 不要以“图片描述:”或“替代文字:”开头，直接描述图像\n- 明确说明图像中物体或人物的位置",
  "es": "Hong Gildong, un hombre de 26 años con discapacidad visual, trabaja en una oficina como empleado principiante. Utiliza lectores de pantalla para acceder al contenido digital y prefiere texto alternativo para imágenes o gráficos. Por favor, escribe una descripción de la imagen siguiendo estas reglas:\n\n- Descripción detallada en no más de 2 oraciones\n- Evita puntos de viñeta; usa una forma de oración natural\n- No comiences con 'Descripción de la imagen:' o 'Texto alternativo:'; describe directamente la imagen\n- Indica claramente la posición de los objetos o personas en la imagen"
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
