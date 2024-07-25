(() => {
    "use strict";
    const welcomeUrl = `chrome-extension://${chrome.runtime.id}/index.html#/welcome`;
  
    chrome.runtime.onInstalled.addListener(() => {
      // Initialization code
    });
  
    function authenticateWithGitHub() {
      chrome.identity.launchWebAuthFlow({
        url: `https://github.com/login/oauth/authorize?client_id=Ov23limyc9MMEP72ATTE&scope=repo`,
        interactive: true
      }, (redirect_url) => {
        if (chrome.runtime.lastError || redirect_url.includes('error')) {
          console.error('Authentication failed');
        } else {
          const code = new URL(redirect_url).searchParams.get('code');
          fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              client_id: 'Ov23limyc9MMEP72ATTE',
              client_secret: '55af56063ce608363ffcb7f94c9ef3a9ad20ff89',
              code: code
            })
          })
          .then(response => response.json())
          .then(data => {
            localStorage.setItem('github_token', data.access_token);
            chrome.storage.local.set({ leethub_token: data.access_token });
          })
          .catch(error => console.error('Error:', error));
        }
      });
    }
  
    chrome.browserAction.onClicked.addListener((tab) => {
      authenticateWithGitHub();
    });
  
    function createOrUpdateRepo(details) {
      const { title, description, code } = details;
      const fileName = `${title.replace(/\s+/g, '_')}.js`;
      const fileContent = `/**
      * ${title}
      *
      * ${description}
      */
  ${code}`;
  
      chrome.storage.local.get(['leethub_token'], (result) => {
        const token = result.leethub_token;
  
        fetch(`https://api.github.com/repos/printilu22/DSA-Codes/contents/${fileName}`, {
          method: 'PUT',
          headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: `Added ${title}`,
            content: btoa(fileContent)
          })
        })
        .then(response => response.json())
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error));
      });
    }
  
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'syncToGitHub') {
        createOrUpdateRepo(request.details);
      }
      if (request && request.closeWebPage) {
        if (request.isSuccess) {
          chrome.storage.local.set({ leethub_username: request.username });
          chrome.tabs.create({ url: welcomeUrl, selected: true });
        } else {
          alert("Something went wrong while trying to authenticate your profile!");
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
              chrome.tabs.remove(tabs[0].id);
            }
          });
        }
      }
      return true;
    });
  })();
  