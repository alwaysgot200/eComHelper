function run() {
  // 获取所有可加入发货台的链接
  const addToShipButtons = [];
  let portalElements = [];
  const links = document
    .querySelector('tbody[data-testid="beast-core-table-middle-tbody"]')
    .querySelectorAll("a:not([disabled])");
  // 筛选符合条件的按钮
  for (const link of links) {
    if (link.innerText === "加入发货台" && link.attr("disabled") !== "disabled") {
      if (onlyClickSelected) {
        let checkbox;
        let currentRow = link.closest("tr");
        // 向上遍历行，直到找到包含checkbox的行
        while (currentRow) {
          checkbox = currentRow.querySelector("input[type='checkbox']");
          if (checkbox) break; // 找到checkbox则停止遍历
          currentRow = currentRow.previousElementSibling;
        }
        if (checkbox && checkbox.checked) {
          addToShipButtons.push(link);
        }
      } else {
        addToShipButtons.push(link);
      }
    }
  }
  // 执行加入发货台操作
    (async function processButtons() {
    //const checkboxStates = saveCheckboxStates(); // 保存初始checkbox状态
    for (let i = 0; i < addToShipButtons.length; i++) {
      // 点击按钮
      addToShipButtons[i].click();
      // 获取弹窗元素
      portalElements = document.querySelectorAll('div[data-testid="beast-core-portal"]');    
      // 只在处理最后一个按钮时处理弹窗
      if (i == addToShipButtons.length - 1) {
        for (let j = 0; j < portalElements.length; j++) {
          //await sleep(shiyanr());
          portalElements[j].querySelector("button").click();
        }
      }     
      // 处理各种弹窗情况 - 拆分逻辑使其更清晰
      const continueButton = $("button:contains('继续加入发货台')");
      if (continueButton.length > 0) {
        continueButton.click();
      }      
      const confirmButton = $("div[data-testid='beast-core-modal']").find("button:contains('知道了')");
      if (confirmButton.length > 0) {
        confirmButton.click();
      }
    }
  })();
  // 处理无可用订单的情况
  if (addToShipButtons.length === 0) {
    alert("没找到可用的加入发货台订单");
    clearInterval(_MyInterval);
    _MyInterval = null;
    $(".apivStockv3").html("<span>暴力<sup>+100</sup>抢库</span>");
  }
}
(function () {
  "use strict";
  window.onload = function () {};
})();
// 延迟函数
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}