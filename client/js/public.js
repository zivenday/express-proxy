$(function () {
    sessionStorage.getItem("type") != '1' ? $(".loginRole").css("display", "none") : ''
    sessionStorage.getItem("type") != '1' ? $(".teleRole").css("display", "none") : ''
})
// baseUrl = "/recharge/manager/"
// ip=http://10.16.29.101:8080
baseUrl = "http://127.0.0.1:8001/recharge/manager/"
loginHtml="login.html"
//global value by ziven
var listManufacturerGeneralRoute = "listManufacturerGeneral.do"//获取厂商概要路由
var listCTInfoGeneralRoute = "listCTInfoGeneral.do"//获取电信概要路由
var giveCTAuthorityRoute = 'giveCTAuthority.do'//赋予管理员电信权限
var giveManufacturerAuthorityRoute = 'giveManufacturerAuthority.do'//赋予管理员厂商权限
//扩展jquey
$.extend({
    getZivenDate: function (i, format) {
        var today = new Date();
        var ago = new Date((+today) - i * 24 * 3600 * 1000)
        var year = ago.getFullYear();
        var month = ago.getMonth() + 1;
        month.toString().length == 1 ? month = '0' + month : ''
        var date = ago.getDate();
        date.toString().length == 1 ? month = '0' + month : ''
        if (format == "Y/M/D") return year + '/' + month + '/' + date
        if (format == "Y/M") return year + '/' + month
    }
});
//public methods by ziven
function isNullCheck() {// 为空判断 参数为要检查的字符串
    return arguments[0].toString().length ? 1 : 0
}
function checkPhone() {//手机验证 
    if (!(/^1[34578]\d{9}$/.test(arguments[0]))) {
        // alert("手机号码有误，请重填");  
        return false;
    } else {
        return true;
    }
}
function checkNumber() {//纯数字验证
    if (!(/^[0-9]*$/.test(arguments[0]))) {
        return false;
    } else {
        return true
    }


}
function transDate() {//日期格式转换 参数为转换日期字符串
    var str = arguments[0].toString().split("/").join("")
    return str = str.split("-").join("")
}

function checkLogin() {//判断是否登录
    var result = 0
    return sessionStorage.getItem("type") ? result = 1 : result
}
function transPackageName() {//套餐包名转换
    var sub = ''
    sub = arguments[0].toString().split("（数据）").join("").split("非定向").join("")
    return sub.substring(0, sub.indexOf("（"));
}
function x0pERROR() {//错误提示参数为类型，和data
    if (arguments[0] == 'query') { x0p('查询失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'authority') { x0p('授权失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'setting') { x0p('设置失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'active') { x0p('激活失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'change') { x0p('更新失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'recover') { x0p('恢复失败', arguments[1], 'error', false) }
    else if (arguments[0] == 'save') { x0p('保存失败', arguments[1], 'error', false) }
    else { x0p('操作失败', arguments[0], 'error', false) }
}
function x0pServerError(data) {//服务器错误
    console.log(data)
    if(data.status=='403'){
   x0p({ title: '操作失败', icon: 'error',text:trans__CN('Forbidden'), buttons: [{ type: 'error', text: 'ok', }] }, function (button) {
        if (button == 'error') {
            window.open(baseUrl+loginHtml, "_top")
        }
    })
}else{
     x0pERROR(trans__CN(data.statusText))
    }
    
}
function x0pAjaxError() {//返回错误 参数为类型，和data
    arguments.length == 1 ? x0pERROR(trans__CN(arguments[0].code)) : x0pERROR(arguments[0],trans__CN(arguments[1].code))
}
function x0pSuccess() {//返回成功参数 类型 
    var fun = arguments[1];
    if (arguments[0] == 'query') { x0p('查询成功', null, 'ok', false) }
    else if (arguments[0] == 'change') { x0p('修改成功', null, 'ok', false) }
    else if (arguments[0] == 'active') { x0p('激活成功', null, 'ok', false) }
    else if (arguments[0] == 'setting') { x0p('设置成功', null, 'ok', false) }
    else if (arguments[0] == 'recover') { x0p('恢复成功', null, 'ok', false) }
    else if (arguments[0] == 'save') { x0p('保存成功', null, 'ok', false) }
    else if (arguments[0] == 'register') { x0p('注册成功，即将跳转登录页面', null, 'ok', false) }
    else if (arguments[0] == 'request') { x0p('请求成功',null,'ok',function(data){
        if(data == 'ok'){
            fun();
        }
    });}
    else if (arguments.length == 0) { x0p('操作成功', null, 'ok', false) }

}
function x0pSuccessAndReload() {//参数为要执行的function
    var fun = arguments[0]
    var titles=arguments[1]||'操作成功'
    x0p({ title: titles, icon: 'ok', buttons: [{ type: 'ok', text: 'ok', }] }, function (button) {
        if (button == 'ok') {
            fun()
        }
    })
}


function trans__CN() {//后台英文转中文
    var result = arguments[0]

      if(result.indexOf('timeout')!=-1){
          result='网络超时,请重新进行操作！'
      }else if(result.indexOf('param error')!=-1){
        result='填写表格中参数存在错误,请检查填写内容'
      }else if(result.indexOf('api require fail')!=-1){
          result='服务器API请求失败了'
      }
      else if(result.indexOf('not login or login timeout')!=-1){
          result = '没有登录或登录已超时，请重新登录！';
      }
      else if(result.indexOf('Forbidden')!=-1){
           result = '抱歉,您不能进行访问,请按ok按钮重新登录';
      }
      else if(result.indexOf('account is not-existent')!=-1){
          result = "此账号不存在，请重新填写";
      }
      else if(result.indexOf('password error')!=-1){
          result='密码错误，请重新填写'
      }
      else if(result.indexOf('Do not repeat the operation')!=-1){
         result = '正在处理中，请勿重复操作'
      }else if(result.indexOf('fail,please check card status')!=-1){
          result='请检查卡状态'
        }else {
          
      }
    return result
}
// 分页
function returnPagination(name, data, type) {//重构分页name:需要把分页放置的element ,data:后台返回数据，type:类型选项可设置为0;
    $pagination = $(name)
    if (data.msg == 0) {
        var index = data.count ? Math.ceil(data.count / 10) : 1
        var subs = '';
        for (var i = 0; i < index; i++) {
            subs = subs + '<li style="margin:0px 5px 0px 5px"><a onclick="changePage(' + (i + 1) + ',this)">' + (i + 1) + '</a></li>'
        }
        $pagination.children('tr').remove()//删除原来的分页
        $pagination.html(subs)//渲染新分页
        $pagination[0].firstChild.firstChild.style.background = "#f88b00"
        $pagination[0].firstChild.firstChild.style.color = "#fff"

    } else {
        $(name).children('tr').remove()
    }
}
function updatePagination(e) {//分页样式切换更新
    var all = e.parentNode.parentNode.querySelectorAll("a")
    for (var j = 0; j < all.length; j++) {
        all[j].style.background = "#fff"
        all[j].style.color = "#dedede"
    }
    e.style.background = "#f88b00"
    e.style.color = "#fff"
}






