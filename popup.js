$(document).ready(() => {
  //----<start>--
  const API_URL = 'https://exad.rangtaobaofei.com/TemuStockHelper/popad.php';
  // 获取并显示广告内容
  $.get(API_URL)
    .done(response => {
      $("#popad").html(response);
    })
    .fail(error => {
      console.error('加载广告内容失败:', error);
    });
}); //----------
