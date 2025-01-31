// background.js: Service Worker for the PhysX extension

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setOptions({
    enabled: true,
    path: "sidepanel.html"
  });
});

chrome.action.onClicked.addListener(async () => {
  try {
    await chrome.sidePanel.open();
  } catch (error) {
    console.error("Side panel failed to open:", error);
  }
});
