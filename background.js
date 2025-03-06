// 发送通知
function sendNotification(title, message) {
  const options = {
    type: "basic",
    iconUrl: "img/icon128.png",
    title,
    message
  };
  chrome.notifications.create("notificationId", options);
}
// 全局变量
let mallid = "";
let AntiContent = "";

// 仅在webRequest API可用时执行
if (chrome.webRequest) {
  // 监听请求完成事件
  chrome.webRequest.onCompleted.addListener(
    function(details) {
      setTimeout(() => {
        if (details.tabId !== -1) {
          chrome.tabs.sendMessage(
            details.tabId,
            { detail: details, act: "AddBtn" },
            () => chrome.runtime.lastError
          );
        }
      }, 500);
    },
    { urls: ["<all_urls>"] }
  );

  // 监听请求发送前事件
  chrome.webRequest.onBeforeSendHeaders.addListener(
    function(details) {
      const headers = details.requestHeaders;
      console.log("Request Headers:");
      headers.forEach(header => {
        if (header.name === "mallid") mallid = header.value;
        if (header.name === "Anti-Content") AntiContent = header.value;
      });
      return { requestHeaders: headers };
    },
    { urls: ["<all_urls>"] },
    ["requestHeaders"]
  );
}

// 扩展安装时初始化存储
async function initializeStorage() {
  try {
    const data = await chrome.storage.local.get([
      "shiyan", 
      "isstip", 
      "shiyan2", 
      "onlyClickSelected"
    ]);

    const defaults = {
      shiyan: 1000,
      shiyan2: 1500,
      isstip: false,
      onlyClickSelected: false
    };

    const updates = {};
    for (const [key, value] of Object.entries(defaults)) {
      if (data[key] == null) {
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length > 0) {
      await chrome.storage.local.set(updates);
      console.log('Storage initialized with:', updates);
    } else {
      console.log('Storage already initialized');
    }
  } catch (error) {
    console.error('Storage initialization failed:', error);
  }
}
// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(initializeStorage);
// 消息监听器
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // 处理不同类型的消息
  switch (request.action) {
    case "sendNotification":
      sendNotification(request.title, request.msg);
      break;       

    case "getcookies":
      chrome.cookies.getAll(request.data, sendResponse);
      break;

    case "getMallid":
      sendResponse(mallid);
      break;

    case "getAntiContent":
      sendResponse(AntiContent);
      break;
  }
  return true;
});

