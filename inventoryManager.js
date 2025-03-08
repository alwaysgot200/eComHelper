// 商家和认证信息
let mallid;
let AntiContent;

// 运行状态标志
let isLooping = false;
let isLoopingv2 = false;

// 配置参数
let singleOrderLoopv2 = 3;
let shiyan = 1200;
let shiyan2 = 2000;
let _MyInterval = null;
let isstip = false;
let onlyClickSelected = false;
let buttonAdded = false; // 添加标志位

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
          return $(this).text().includes("我不接受");
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
      } else {
        //另一种情况
        var radioElements = $(
          'div.RD_textWrapper_5-114-0.RD_prevRadio_5-114-0:contains("放弃活动")'
        );
        // Using jQuery properly for each radio element
        radioElements.each(function () {
          const $radio = $(this);
          const $tr = $radio.closest("tr");
          // 使用filter方法精确匹配包含"日常价格"的<span>
          const hasNomalPrice =
            $tr.find("span").filter(function () {
              return $(this).text().trim() === "日常价格";
            }).length > 0;
          if (hasNomalPrice) {
            $portal.click();
          }
        });
      }
    }),
    //一键拒绝价格调整功能
    $(document).on("click", ".oneKeyRejectPrice", function () {
      // 点击所有符合条件的按钮
      const selectors = [
        "div.RD_textWrapper_5-114-0.RD_prevRadio_5-114-0:contains('放弃活动')",
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
      // 启动定时器开始抢库
      _MyInterval = setInterval(run, shiyanr());
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

// 初始化系统
getMallid(() => {});
getAntiContent();
