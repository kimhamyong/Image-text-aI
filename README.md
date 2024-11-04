# ImageTextAI - Chrome Extension

**ImageTextAI** is a Chrome extension designed to automatically generate alternative text (alt text) for images on the web. This tool enhances accessibility for visually impaired users by ensuring that visual content is accompanied by meaningful text descriptions, promoting a more inclusive browsing experience for all users.

## 📖 Background and Motivation

With the increasing reliance on digital information, the need for accessible content has become paramount. Visually impaired users often depend on screen readers to navigate online spaces, yet a significant portion of the internet lacks descriptive alt text for images. This omission poses a challenge, as users who rely on screen readers miss out on essential visual information, leading to a digital information gap. ImageTextAI aims to bridge this gap by automatically generating accurate, context-aware alt text.

## 🚀 Key Features

- **Automated Alt Text Generation**: Detects images without alt tags and generates descriptive text using AI.
- **Real-Time Integration**: Seamlessly integrates with Chrome to automatically apply alt text when browsing.
- **Powered by Gemini Flash**: Uses the high-performance Gemini Flash API for efficient, fast, and accurate alt text generation.
- **Screen Reader Compatibility**: Designed to enhance the browsing experience for screen reader users, ensuring all visual content is accessible.
- **Selective Application**: Skips alt generation for images where the alt attribute is intentionally set as empty (`alt=""`), allowing for customization on decorative images.

## 🛠️ Installation

To install ImageTextAI in your Chrome browser, follow these steps:

1. **Clone the Repository**: Download the code from GitHub.
   ```bash
   git clone https://github.com/kimhamyong/ImageTextAI.git
2. **Load the Extension in Chrome**:

   Open Chrome and navigate to chrome://extensions/.
   Enable "Developer Mode" by toggling the switch in the top right.
   Select "Load unpacked" and choose the folder where you cloned this repository.
3. **Activate the Extension**:

   The extension will now be available in your browser. You can pin it for easy access and manage settings as needed.

## 🎉 How It Works

- **Background Scripts**: The background script listens for webpage loads and analyzes images within the page.
- **Content Script**: When an image without alt text is detected, the content script communicates with the Gemini Flash API to generate an appropriate description.
- **Popup and UI Elements**: ImageTextAI includes a simple user interface (UI) that allows users to manage settings, including toggling the extension on or off.
- **Manifest File**: Defines permissions and details about the extension, adhering to Chrome’s extension architecture standards.

## 💡 Why Chrome Extension?
Given that Chrome has one of the highest browser usage rates worldwide, a Chrome extension was chosen for broad accessibility. Chrome extensions also provide the flexibility and direct access to the webpage DOM, making them an ideal choice for real-time alt text generation and seamless user interaction.


## 🧩 Project Structure
```
ImageTextAI/
│
├── manifest.json         # Extension settings and permissions
├── background.js         # Script running in the background, handling API calls
├── popup.html            # HTML file for the extension popup UI
├── popup.js              # JavaScript for popup interactions and UI management
└── content.js            # Script that interacts with web page images to add alt text
```

## 🌟 Expected Benefits

- **Digital Accessibility**: Ensures visually impaired users have access to visual information by bridging gaps in web accessibility.
- **Equal Access**: Promotes equitable access to information, supporting a more inclusive digital environment.
- **ESG and Social Responsibility**: Adheres to ESG principles by fostering a socially responsible, accessible web presence.
- **Enhanced User Experience**: Allows visually impaired users to engage with content more meaningfully through enhanced descriptive support.

## 📝 Usage Instructions
Activate the Extension: Once installed, make sure the extension is active. This can be done from Chrome’s extensions menu.
- **Automatic Alt Text**: As you browse, ImageTextAI will monitor images on each page and automatically add alt text for any image that lacks an alt attribute.
- **Customize Behavior**: To exclude specific images, set their alt attribute as an empty string (alt=""), and ImageTextAI will skip them.

## 🤝 Contributing
Contributions are welcome! If you’re interested in enhancing the features or improving performance:

- **Fork the repository**.
- **Create a new branch** (git checkout -b feature-branch).
- **Commit your changes** (git commit -m 'Add new feature').
- **Push to the branch** (git push origin feature-branch).
- **Open a Pull Request**, and describe the changes made.

## 📬 Contact
For any questions, suggestions, or feedback, please contact the project maintainers.