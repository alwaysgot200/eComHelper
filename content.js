function addbutton() {
    if ($("#actbtn").length !== 0) return;    
    console.log("addbutton()");    
    // 获取图片资源URL
    const wechatImg = chrome.runtime.getURL("/img/wechat22.jpg");
    const gzhImg = chrome.runtime.getURL("/img/gzh2.jpg");    
    // 构建HTML模板
    const htmlTemplate = `
      <div id="order_count">
        <button id="showIntpod" style="position: fixed; right: 30px; top: 280px; width: 50px; z-index: 100000; display: none;" 
                class="BTN_outerWrapper_5-72-0 BTN_gray_5-72-0">抢库助手</button>
        <div id="intpod" style="display: none;position: fixed;right: 30px; top: 280px;width:250px;z-index: 100000; padding: 10px; background-color: white; border: 1px solid grey;">
          <div>
            <button id="closepod" class="BTN_outerWrapper_5-72-0 BTN_gray_5-72-0">关闭</button><br /><br />
          </div>
          <div id="actbtn" style="margin-top: 10px;">
            <div style="display:none;">
              <label>
                <input type="checkbox" id="startStocktimer">定时开始
              </label>
              <input type="text" name="shi" style="width: 25px;">:
              <input type="text" name="fen" style="width: 25px;">
              <select id="stocktimer"></select>
            </div>
            <button class="startStock BTN_outerWrapper_5-72-0 BTN_gray_5-72-0 Stshow" type="button">
              <span>批量抢库</span>
            </button>
          </div> 
        </div>
      </div>
    `;    
    // 添加HTML到页面
    $("body").append(htmlTemplate);
    // 拖拽相关变量
    let isDragging = false;
    const dragButton = document.getElementById("showIntpod");
    const savedPosition = JSON.parse(localStorage.getItem("draggableButtonPosition"));
    
    // 初始化按钮位置
    function initButtonPosition() {
      const maxX = document.documentElement.clientWidth - dragButton.offsetWidth;
      const maxY = document.documentElement.clientHeight - dragButton.offsetHeight;
      let top = parseInt(dragButton.style.top, 10);
      let left = parseInt(dragButton.style.left, 10);      
      if (isNaN(top) || top < 0 || top > maxY) top = 280;
      if (isNaN(left) || left < 0 || left > maxX) left = window.innerWidth - 30;      
      dragButton.style.top = `${top}px`;
      dragButton.style.left = `${left}px`;
    }    
    // 恢复保存的位置
    if (savedPosition) {
      dragButton.style.top = savedPosition.top;
      dragButton.style.left = savedPosition.left;
    }
    initButtonPosition();    
    // 按钮事件绑定
    $("#showIntpod").click(() => {
      if (!isDragging) {
        setintpodpostion();
        $("#intpod").show();
        $("#showIntpod").hide();
      }
    });    
    $("#closepod").click(() => {
      $("#intpod").hide(300);
      $("#showIntpod").show(300);
    });    
    if ($("#actbtn").length > 0) {
      setTimeout(() => $("#closepod").click(), 1000);
    }    
    $("#startStocktimer").change(function() {
      startStocktimer = Boolean($(this).prop("checked"));
    });
    
    // 拖拽功能实现
    dragButton.onmousedown = function(e) {
      e.preventDefault();
      isDragging = false;      
      const offsetX = e.clientX - dragButton.getBoundingClientRect().left;
      const offsetY = e.clientY - dragButton.getBoundingClientRect().top;
      
      function moveAt(pageX, pageY) {
        const maxX = document.documentElement.clientWidth - dragButton.offsetWidth;
        const maxY = document.documentElement.clientHeight - dragButton.offsetHeight;
        
        const left = Math.max(0, Math.min(pageX - offsetX, maxX));
        const top = Math.max(0, Math.min(pageY - offsetY, maxY));
        
        dragButton.style.left = `${left}px`;
        dragButton.style.top = `${top}px`;
      }      
      function onMouseMove(e) {
        if (!isDragging) {
          isDragging = true;
        }
        moveAt(e.pageX, e.pageY);
      }      
      function onMouseUp(e) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        
        if (isDragging) {
          const position = {
            top: dragButton.style.top,
            left: dragButton.style.left
          };
          localStorage.setItem("draggableButtonPosition", JSON.stringify(position));              
          // 延迟重置拖拽状态，以便点击事件可以正确判断
          setTimeout(() => {
            isDragging = false;
          }, 10);
        }
      }      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    dragButton.ondragstart = () => false;    
    dragButton.onclick = (e) => {
      if (isDragging) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    }; 
    // 抢库按钮点击事件
    $(".startStock").click(function() {
   
      // 处理选中商品
      if (onlyClickSelected) {
        selectedList.forEach(item => {
          const checkbox = $("table:contains('备货单号')")
            .find(`tr:contains('${item}')`)
            .find('input[type="checkbox"]');
          if (!checkbox.prop("checked")) {
            checkbox.parent().click();
          }
        });
      } else {
        const headerCheckbox = $("th").find("input");
        if (!headerCheckbox.prop("checked")) {
          headerCheckbox[0].click();
        }
      }      
      // 执行抢库操作
      setTimeout(() => {
        const batchAddButton = Jcontains("span", ["批量加入发货台"]).parent("button");
        
        if (batchAddButton.prop("disabled")) {
          alert("没有可操作的备货单");
          return;
        }        
        Jcontains("span", ["批量加入发货台"])[0].click();        
        setTimeout(() => {
          const confirmInterval = setInterval(() => {
            const confirmButton = $("div[data-testid='beast-core-modal']").find("button:contains('确认')");
            
            if (confirmButton.length > 0) {
              clearInterval(confirmInterval);
              confirmButton[0].click();
              
              const checkInterval = setInterval(() => {
                if (confirmButton.length === 0) {
                  clearInterval(checkInterval);                  
                  setTimeout(() => {
                    const modalRows = $("div[data-testid='beast-core-modal']").find("tr");
                    
                    if (modalRows.length > 0) {
                      console.log("等批量操作的结果");
                      
                      if (modalRows.length > 1) {
                        console.log("未查询到收货地址信息");
                        $("div[data-testid='beast-core-modal']")
                          .find("button:contains('知道了')")
                          .click();
                        setTimeout(() => {
                          $(".startStock").click();
                        }, shiyanr());
                      } else {
                        if (isstip) playSound();
                        sendNotification("完成", "多多返回成功指令,验证中");
                        console.log("完成抢的任务。");
                        alert("已完成");
                      }
                    } else {
                      setTimeout(() => {
                        $(".startStock").click();
                      }, shiyanr());
                    }                    
                    const continueButton = $("button:contains('继续加入发货台')");
                    if (continueButton.length > 0) {
                      continueButton.click();
                    }
                  }, 2000);
                }
              }, 1000);
            } else {
              clearInterval(confirmInterval);
            }
          }, shiyanr());
        }, 100);
      }, 200);
    });
  }
  function setintpodpostion(){
    const dragButton = document.getElementById("showIntpod");
    const showIntpodRect = dragButton.getBoundingClientRect();
    const windowWidth = $(window).width();
    const windowHeight = $(window).height();
    // 判断 showIntpod 的位置，调整 intpod 的位置
    let intpodLeft, intpodTop;
    // 确保 intpod 在可见区域内
    if (showIntpodRect.right + 250 > windowWidth) {
      // 如果 intpod 超出右边界，显示在左侧
      intpodLeft = showIntpodRect.left - 250;
    } else {
      // 否则显示在右侧
      intpodLeft = showIntpodRect.right;
    }
    if (showIntpodRect.bottom + 150 > windowHeight) {
      // 如果 intpod 超出下边界，显示在上方
      intpodTop = showIntpodRect.top - 150;
    } else {
      // 否则显示在下方
      intpodTop = showIntpodRect.bottom;
    }
    $("#intpod").css({
      left: intpodLeft + "px",
      top: intpodTop + "px",
    });
  }
  function sleep(delay) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }  
  function Jcontains(selector, textArray) {
    let result = $(selector + ":contains('" + textArray[0] + "')");
    for (let i = 0; i < textArray.length; i++) {
      const element = $(selector + ":contains('" + textArray[i] + "')");
      if (element.length > 0) {
        result = element;
        break;
      }
    }
    return result;
  }  
  function trim(str, removeAllSpaces) {
    let result = str.replace(/(^\s+)|(\s+$)/g, "");
    if (removeAllSpaces) {
      result = result.replace(/\s/g, "");
    }
    return result;
  }  
  function getCookie(name) {
    const pattern = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    const match = document.cookie.match(pattern);
    return match ? unescape(match[2]) : null;
  }  
  function getQueryVariable(variable) {
    const query = window.location.search.substring(1);
    const pairs = query.split("&");
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split("=");
      if (pair[0] === variable) {
        return pair[1];
      }
    }
    return false;
  }  
  function getUrlParam(name) {
    const pattern = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    const match = window.location.search.substr(1).match(pattern);
    return match ? unescape(match[2]) : null;
  }  
  function runatpage(code) {
    const timestamp = new Date().getTime();
    const script = document.createElement("script");
    script.innerHTML = code + `document.getElementById("shippinglischange${timestamp}").remove();`;
    script.setAttribute("id", "shippinglischange" + timestamp);
    document.head.appendChild(script);
  }  
  function playSound() {
    const audioUrl = chrome.runtime.getURL("yiyi.mp3");
    const audio = new Audio(audioUrl);
    audio.play();
  }  
  function sendNotification(title, message) {
    chrome.runtime.sendMessage(
      { action: "sendNotification", title, message },
      () => {}
    );
  }
  
  function shiyanr() {
    return generateRandomNumber(shiyan, shiyan2);
  }
function generateRandomNumber(min, max) {
  if (min >= max) {
    throw new Error("最小值必须小于最大值");
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

let startStocktimer = false;
let selectedList = [];
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // 验证消息类型
  if (request.act !== "AddBtn") {
    sendResponse("没有匹配到要处理的");
    return true;
  }
  // 初始化界面元素
  addbutton();
  addApivButton();
  
  // 根据URL控制抢库按钮显示
  const validUrls = [
    "seller.kuajingmaihuo.com/main/order-manage-urgency",
    "seller.kuajingmaihuo.com/main/order-manage"
  ];
  const isValidUrl = validUrls.some(url => window.location.href.includes(url));
  $(".Stshow")[isValidUrl ? "show" : "hide"]();

  // 处理订单列表页面
  const isOrderListPage = request.detail.url.includes("/oms/bg/venom/api/supplier/purchase/manager/querySubOrderList");
  if (isOrderListPage) {
    setTimeout(() => {
      const checkboxes = $("tr").find('input[type="checkbox"]');
      checkboxes.unbind("change").change(function() {
        const $checkbox = $(this);
        const isHeaderCheckbox = $checkbox.closest("th").length > 0;
        
        // 获取订单号
        const orderNumber = !isHeaderCheckbox ? $checkbox
          .closest("tr")
          .find("div[class^=copy-text_copy]")
          .parent()
          .contents()
          .filter(function() { return this.nodeType === 3; })
          .first()
          .text()
          .trim() : "";

        // 处理选中状态
        if ($checkbox.prop("checked")) {
          if (orderNumber) {
            selectedList.push(orderNumber);
          } else if (isHeaderCheckbox) {
            // 全选时添加所有订单
            $checkbox.closest("table").find("tr").each((_, row) => {
              const number = $(row)
                .find("div[class^=copy-text_copy]")
                .parent()
                .contents()
                .filter(function() { return this.nodeType === 3; })
                .first()
                .text()
                .trim();
              
              if (number) selectedList.push(number);
            });
          }
        } else {
          if (orderNumber) {
            const index = selectedList.indexOf(orderNumber);
            if (index !== -1) selectedList.splice(index, 1);
          } else if (isHeaderCheckbox) {
            selectedList = [];
          }
        }
        
        console.log(selectedList);
      });
    }, 300);
  }
  sendResponse("addbtn");
  return true;
});
 // 空事件监听器
$(window).on("load", () => {}),
// 确保在页面加载时隐藏面板
$(document).ready(() => {
  $("#showIntpod").show(); // 确保面板在初始时隐藏
  $("#intpod").hide(); // 确保面板在初始时隐藏
});

// 格式化日期
(Date.prototype.Format = function(format) {
  // 获取所有日期相关的值
  const year = this.getFullYear();
  const month = this.getMonth() + 1;
  const date = this.getDate();
  const hours = this.getHours();
  const minutes = this.getMinutes();
  const seconds = this.getSeconds();
  const quarter = Math.floor((this.getMonth() + 3) / 3);
  const milliseconds = this.getMilliseconds();

  // 处理年份格式化
  if (format.includes('y')) {
    const yearMatch = format.match(/(y+)/);
    if (yearMatch) {
      const yearStr = year.toString();
      const yearFormat = yearMatch[1];
      format = format.replace(yearFormat, yearStr.slice(-yearFormat.length));
    }
  }

  // 处理其他时间格式化
  const patterns = {
    'M+': month,
    'd+': date,
    'h+': hours,
    'm+': minutes,
    's+': seconds,
    'q+': quarter,
    'S': milliseconds
  };

  // 遍历处理每种格式
  Object.entries(patterns).forEach(([pattern, value]) => {
    if (format.includes(pattern[0])) {  // 如果包含该格式
      const match = format.match(new RegExp(pattern));
      if (match) {
        const matchStr = match[0];
        // 如果格式长度为1，直接替换数字
        // 如果格式长度大于1，补零后替换
        const formatted = matchStr.length === 1 
          ? value
          : String(value).padStart(matchStr.length, '0');
        format = format.replace(matchStr, formatted);
      }
    }
  });

  return format;
}),
setInterval(() => {
  if (!startStocktimer || isLooping || isLoopingv2) {
    return;
  }
  const hour = parseInt($("input[name='shi']").val());
  const minute = parseInt($("input[name='fen']").val());
  const currentTime = new Date();

  if (hour === currentTime.getHours() && minute === currentTime.getMinutes()) {
    inw("执行定时任务");
  }
}, 20000);
