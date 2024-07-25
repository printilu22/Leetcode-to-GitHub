function extractProblemDetails() {
    const problemTitle = document.querySelector('.css-v3d350').innerText;
    const problemDescription = document.querySelector('.content__u3I1').innerText;
    const problemCode = document.querySelector('.CodeMirror-code').innerText;
  
    return { title: problemTitle, description: problemDescription, code: problemCode };
  }
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProblemDetails") {
      const details = extractProblemDetails();
      sendResponse(details);
    }
  });
  