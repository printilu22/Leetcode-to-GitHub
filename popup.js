document.getElementById('sync').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getProblemDetails' }, (response) => {
        chrome.runtime.sendMessage({ action: 'syncToGitHub', details: response });
      });
    });
  });
  