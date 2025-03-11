// 商家和认证信息
let mallid;
let AntiContent;

// 运行状态标志
let isLooping = false;
let isLoopingv2 = false;

// 配置参数
let shiyan = 1500;
let shiyan2 = 2500;
let _MyInterval = null;
let isstip = false;
let onlyClickSelected = false;
let buttonAdded = false; // 添加标志位
const InValidList=[];

// 添加抢库相关按钮到页面
function addApivButton() {
  // 检查是否已存在抢库按钮，避免重复添加
  if (buttonAdded || $(".apivStock").length > 0) {
    return;
  }
  buttonAdded = true; // 设置标志位
  // 向页面添加功能按钮组
  $.get(chrome.runtime.getURL("templates/buttons.html"), function (html) {
    $("#actbtn").append(html);
  }),
    $(document).on("change", "#stip", function () {
      // 根据复选框状态设置提示音
      if ($("#stip").prop("checked")) {
        isstip = true;
        playSound();
        alert("暴力+100【不支持】声音和通知提示");
      } else {
        isstip = false;
      }
      // 保存设置到chrome存储
      chrome.storage.local.set({ isstip: $("#stip").prop("checked") });
    }),
    // 只抢选中商品开关事件处理
    $(document).on("change", "#onlyClickSelected", function () {
      // 更新选中状态
      onlyClickSelected = $("#onlyClickSelected").prop("checked");
      // 保存设置到chrome存储
      chrome.storage.local.set({ onlyClickSelected: onlyClickSelected });
    }),
    // 清除通知按钮点击事件
    $(document).on("click", ".oneKeyCleanNote", function () {
      // 移除各类弹窗和遮罩
      $('div[class="MDL_iconWrapper_5-114-0"]').click(),
        $('div[data-testid="beast-core-modal-mask"]').remove(),
        $('div[data-testid="beast-core-modal"]').remove(),
        $('div[class*="MDL_mask"]').remove(),
        $('div[class*="MDL_outerWrapper"]').remove();
    });
  // 构建定时器下拉选项
  const $buttons = $("button[cname='c']");
  const options = Array.from($buttons)
    .map((button) => {
      const $button = $(button);
      return `<option value='${$button.attr("e")}'>${$button.text()}</option>`;
    })
    .join("");
  $("#stocktimer").html(options),
    // 清除水印功能
    $(document).on("click", ".cleanmark", function () {
      const $watermark = $("div[style*='z-index: 2147483647']");
      $("head").append($watermark.clone());
      $watermark.eq(1).remove();
    }),
    // 一键拒绝日常价调价功能
    $(document).on("click", ".oneKeyRejectNormalPrice", function () {
      // 点击所有符合条件的第一步按钮"
      var portalElements = $('div[class^="RD_textWrapper"]').filter(
        function () {
          return $(this).text().includes("我不接受") || $(this).text().includes("放弃") || $(this).text().includes("不参与") ;
        }
      );       

      if (portalElements.length > 0) {
        // 使用jQuery正确处理每个元素
        portalElements.each(function () {
          const $portal = $(this);
          const $tr = $portal.closest("tr");
          // 使用filter方法精确匹配包含"日常价格"的<span>
          const hasDailyPrice =
            $tr.find("span").filter(function () {
              return $(this).text().trim() === "日常价格";
            }).length > 0;

          if (hasDailyPrice) {
            $portal.click();
            const selectors = [
              "div[class^='CBX_textWrapper_5']:contains('我已知晓风险，本次不再提醒')",
              "button[class^='BTN_outerWrapper_']:contains('拒绝接受价格调整建议')",
            ];
            selectors.forEach((selector) => {
              if ($(selector).length > 0) $(selector).click();
            });
            // 单独处理"确认"按钮
            // 等待一小段时间后再点击确认按钮，确保弹窗已经出现
            setTimeout(() => {
              // 单独处理"确认"按钮
              $("div[class^='index-module__actions']")
                .find("button[data-testid='beast-core-button']")
                .filter(function () {
                  return $(this).find("span").text().trim() === "确认";
                })
                .click();
            }, 300);
          }
        });
      } 
    }),
    //一键拒绝价格调整功能
    $(document).on("click", ".oneKeyRejectPrice", function () {
      // 点击所有符合条件的按钮
      const selectors = [
        "div.RD_textWrapper_5-114-0.RD_prevRadio_5-114-0:contains('放弃')",
        "div.RD_textWrapper_5-114-0.RD_prevRadio_5-114-0:contains('不参与')",
        "div[class^='RD_textWrapper']:contains('我不接受')",
        "div[class^='CBX_textWrapper_5']:contains('我已知晓风险，本次不再提醒')",
        "button[class^='BTN_outerWrapper_']:contains('拒绝接受价格调整建议')"
      ];
      // 先点击所有主要按钮
      selectors.forEach((selector) => {
        if ($(selector).length > 0) $(selector).click();
      });
      // 等待一小段时间后再点击确认按钮，确保弹窗已经出现
      setTimeout(() => {
        // 单独处理"确认"按钮
        $("div[class^='index-module__actions']")
          .find("button[data-testid='beast-core-button']")
          .filter(function () {
            return $(this).find("span").text().trim() === "确认";
          })
          .click();
      }, 300);
    }),
    // 从chrome存储中读取配置
    chrome.storage.local.get(
      ["shiyan", "shiyan2", "isstip", "onlyClickSelected"],
      function (settings) {
        const inputs = {
          shiyan: { value: settings.shiyan, selector: "input[name=shiyan]" },
          shiyan2: {
            value: settings.shiyan2,
            selector: "input[name=shiyan2]",
          },
          isstip: { value: settings.isstip, selector: "#stip" },
          onlyClickSelected: {
            value: settings.onlyClickSelected,
            selector: "#onlyClickSelected",
          },
        };

        // 等待元素加载完成后再设置值
        const waitForElements = setInterval(() => {
          const allElementsExist = Object.values(inputs).every(
            ({ selector }) => $(selector).length > 0
          );

          if (allElementsExist) {
            clearInterval(waitForElements);
            // 更新全局变量和UI
            Object.entries(inputs).forEach(([key, { value, selector }]) => {
              window[key] = value;
              const $element = $(selector);
              if ($element.length > 0) {
                $element[
                  key.includes("stip") || key.includes("Selected")
                    ? "prop"
                    : "val"
                ](value);
              }
            });
          }
        }, 100); // 每100ms检查一次
        // 设置5秒超时，避免无限等待
        setTimeout(() => clearInterval(waitForElements), 5000);
      }
    ),
    // 时延设置输入框1的变更事件
    $(document).on("change", "input[name=shiyan]", function () {
      const $input = $(this);
      const minValue = parseInt($input.val());
      const maxValue = parseInt($("input[name=shiyan2]").val());

      // 检查是否为有效数字且大于0
      if (isNaN(minValue) || minValue < 1) {
        alert("请输入正确数字");
        return false;
      }

      // 检查最小值是否小于最大值
      if (maxValue < minValue) {
        alert("第一个数字必须小于第二个数字");
        return false;
      }

      // 保存有效的时延设置
      if (minValue > 1 && minValue < maxValue) {
        chrome.storage.local.set({ shiyan: minValue });
        shiyan = minValue;
      }
    }),
    // 时延设置输入框2的变更事件处理
    $(document).on("change", "input[name=shiyan2]", function () {
      const inputValue = $("input[name=shiyan2]").val();
      const shiyan2Value = parseInt(inputValue);
      const shiyanValue = parseInt($("input[name=shiyan]").val());

      // 检查是否为有效数字且大于0
      if (isNaN(shiyan2Value) || shiyan2Value < 1) {
        alert("请输入正确数字");
        return false;
      }

      // 检查是否大于第一个时延值
      if (shiyan2Value < shiyanValue) {
        alert("第一个数字必须小于第二个数字");
        return false;
      }
      // 保存有效的时延设置
      if (shiyan2Value > 1 && shiyanValue < shiyan2Value) {
        // 保存到chrome存储
        chrome.storage.local.set({
          shiyan2: shiyan2Value,
        });
        // 更新全局变量
        shiyan2 = shiyan2Value;
        // 触发shiyan输入框的change事件
        $("input[name=shiyan]").change();
      }
    }),
    // 暴力+100抢库按钮点击事件
    $(document).on("click", ".apivStockv3", function () {
      // 如果定时器正在运行，则停止
      if (_MyInterval) {
        clearInterval(_MyInterval);
        _MyInterval = null;
        $(".apivStockv3").html("<span>暴力<SUP>+100</SUP>抢库</span>");
        return;
      }
      // 创建一个标志变量，用于跟踪页面是否刚刚刷新

      saveCheckStatus();
      _MyInterval = setInterval(async () => {
        restoreCheckStatus();
        await delay(50);
        run();}, shiyanr());
      $(".apivStockv3").html("停止<span>暴力<SUP>+100</SUP>抢库</span>");
    });
}
// 延迟函数，返回Promise
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMallid(callback) {
  chrome.runtime.sendMessage(
    { action: "getMallid" },
    function (mallIdResponse) {
      // 如果没有获取到商家ID，1秒后重试
      if (!mallIdResponse) {
        setTimeout(() => getMallid(callback), 1000);
        return;
      }
      // 保存商家ID并获取用户信息
      mallid = mallIdResponse;
    }
  );
}

function getAntiContent() {
  chrome.runtime.sendMessage({ action: "getAntiContent" }, function (response) {
    if (!response) {
      setTimeout(getAntiContent, 1000);
      return;
    }
    AntiContent = response;
  });
}

//输出消息
function inw(message) {
  const timestamp = new Date().Format("hh:mm:ss");
  const logMessage = `${timestamp}:${message}\r\n\r\n\r\n`;
  const $logArea = $("#insys");
  $logArea.prepend(logMessage);
  $logArea.scrollTop(0);
}

function addintpod() {
  // 如果面板已存在则直接显示
  if ($("#intpod").length > 0) {
    setintpodpostion();
    $("#intpod").show();
    return;
  }
  // 创建面板HTML
  const panelHtml = createPanelHtml();
  // 添加面板到页面
  $("body").append(panelHtml);
  // 绑定按钮事件
  bindButtonEvents();
  // 显示面板
  setintpodpostion();
  $("#intpod").show();
}

// 创建面板HTML
function createPanelHtml() {
  return `
    <div id="intpod" style="display:none;position: fixed;right: 30px; top: 280px;width:250px;z-index: 300;">
      <div class="text-center" style="padding: 15px;width: 440px;height: 292px;background-color: white;border: 1px solid #c1c1c1;" id="order_show">
        <div style="height: 276px; width: 308px;">
          <textarea id="insys" style="width: 444px; height: 260px; display: inline; border: none;"></textarea>
          <button class="stopapiv BTN_outerWrapper_5-72-0 BTN_gray_5-72-0" type="button">
            <span>停止</span>
          </button>
          <button class="closeapiv BTN_outerWrapper_5-72-0 BTN_gray_5-72-0" type="button">
            <span>关闭</span>
          </button>
        </div>
      </div>
    </div>`;
}
// 绑定按钮事件
function bindButtonEvents() {
  // 停止按钮事件
  $(".stopapiv").click(() => {
    isLooping = false;
    isLoopingv2 = false;
  });
  // 关闭按钮事件
  $(".closeapiv").click(() => {
    if (isLooping || isLoopingv2) {
      alert("运行中，请忽关闭");
      return;
    }
    $("#intpod").hide();
  });
}
function run() {
  // 获取所有可加入发货台的链接
  const addToShipButtons = [];
  let portalElements = [];
  const links = document
    .querySelector('tbody[data-testid="beast-core-table-middle-tbody"]')
    .querySelectorAll("a:not([disabled])");
  // 筛选符合条件的按钮
  for (const link of links) {
    if (link.innerText === "加入发货台" ){
      let checkbox;
      let currentRow = link.closest("tr");
      // 向上遍历行，直到找到包含checkbox的行
      let orderId = "";
      const $currentRow = $(currentRow);
      const orderIdElement = $currentRow.find("div:contains('WB')").first();
      if (orderIdElement.length > 0) {
        // 使用正则表达式匹配WB开头的13位数字
        const match = orderIdElement.text().match(/WB\d{13}/);
        if (match) {
          orderId = match[0];
        }
      }
      if(InValidList.includes(orderId))  continue; //orderId对应的“加入发货台” 其实已经是无效的，所以要排除
      while (currentRow) {
        checkbox = currentRow.querySelector("input[type='checkbox']");
        if (checkbox) break; // 找到checkbox则停止遍历
        currentRow = currentRow.previousElementSibling;
      }
      if (onlyClickSelected) {
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
    for (let i = 0; i < addToShipButtons.length; i++) {
      // 点击按钮
      addToShipButtons[i].click(); 
      await delay(50);     
      // 获取弹窗元素
      portalElements = document.querySelectorAll('div[data-testid="beast-core-portal"]');    
      // 只在处理最后一个按钮时处理弹窗
      if (i == addToShipButtons.length - 1) {       
        for (const portal of portalElements) {
          portal.querySelector("button").click(); 
        }
        await delay(100);
      }     
      // 处理各种弹窗情况 - 拆分逻辑使其更清晰
      await handleModals();//处理循环过程中的弹窗     
    }
    await delay(100);
    await handleModals();//处理不点击按钮时的弹窗
  })(); 
  // 处理无可用订单的情况
  if (addToShipButtons.length === 0) {
    alert("没找到可用的加入发货台订单");
    clearInterval(_MyInterval);
    _MyInterval = null;
    $(".apivStockv3").html("<span>暴力<sup>+100</sup>抢库</span>");
  }
}
async function handleModals() {
  // 处理"继续加入发货台"按钮
  const continueButton = $("button:contains('继续加入发货台')");
  if (continueButton.length > 0) {
    continueButton.click();
  }

  // 处理"知道了"按钮和相关逻辑
  const confirmButton = $("div[data-testid='beast-core-modal']").find("button:contains('知道了')");
  if (confirmButton.length > 0) {
    const modalContent = $("div[data-testid='beast-core-modal']");
    if(modalContent.find("div:contains('当前备货单已加入发货台')").length > 0){
      const modalText = modalContent.text();
      const match = modalText.match(/WB\d{13}/);
      if (match && !InValidList.includes(match[0])) {
        InValidList.push(match[0]);
      }
    }
    confirmButton.click();
  }
  await delay(100);
}

function saveCheckStatus(){
  // 创建一个数组存储选中的复选框信息
  const checkboxStates = [];
  
  // 查找所有表格中的复选框
  $('tbody[data-testid="beast-core-table-middle-tbody"] input[type="checkbox"]').each(function() {
    if ($(this).prop("checked")) {
      // 获取复选框所在行的关键信息
      const $row = $(this).closest("tr");
      const rowIndex = $row.index();
      
      // 获取订单号或其他唯一标识符
      let orderId = "";
      const orderIdElement = $row.find("div:contains('WB')").first();
      if (orderIdElement.length > 0) {
        // 使用正则表达式匹配WB开头的13位数字
        const match = orderIdElement.text().match(/WB\d{13}/);
        if (match) {
          orderId = match[0];
        }
      }      
      // 保存复选框信息
      checkboxStates.push({
        rowIndex: rowIndex,
        orderId: orderId
      });
    }
  });  
  // 保存到localStorage
  if(checkboxStates.length>0){
    localStorage.setItem('eComHelperCheckboxStates', JSON.stringify(checkboxStates));
    console.log(`已保存${checkboxStates.length}个选中状态`);
  } 
  return checkboxStates;
}
function restoreCheckStatus(){
  // 从localStorage获取保存的状态
  const savedStates = JSON.parse(localStorage.getItem('eComHelperCheckboxStates') || '[]');
  
  if (savedStates.length === 0) {
    console.log("没有找到保存的复选框状态");
    return false;
  }
  
  let restoredCount = 0;
  
  // 遍历所有保存的状态
  savedStates.forEach(state => {
    // 通过订单号查找对应行
    if (state.orderId) {
      $(`tbody[data-testid="beast-core-table-middle-tbody"] tr`).each(function() {
        if ($(this).text().includes(state.orderId)) {
          $(this).find('input[type="checkbox"]').prop("checked", true).change();
          restoredCount++;
          return false; // 跳出each循环
        }
      });
    }
  });  
  console.log(`已恢复${restoredCount}/${savedStates.length}个复选框状态`);
  return restoredCount > 0;
}
// 初始化系统
getMallid(() => {});
getAntiContent();
