// Received message from wallet selector
window.addEventListener("message", (event) => {
  // We only accept messages from ourselves
  if (event.source != window) {
    return;
  }

  if (event.data.type && (event.data.type == "nw") && event.data.dest == "ext") {
    // Sending message to narwallets extension
    return chrome.runtime.sendMessage(event.data, function (response) {
      // Send response to wallet-selector
      window.postMessage(
        {
          type: "nw",
          dest: "page",
          result: response
        }
      )
    });
  } 
}, true);
