try {
  chrome.runtime.onMessage.addListener((message) => {
    console.log(message);
  });
} catch (e) {
  console.log(e);
}
