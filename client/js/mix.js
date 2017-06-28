//厂商，电信弹出框
var roleChoosedialog = {//加载数据对象
    text: '<div class="role-choose">'
    + '<div class="role-choose__container">'
    +'<div>请选择需要查看的角色类型</div>'
    +'<div class="role-choose__items"><span>厂商</span><span>电信</span></div>'
    + '</div>'
    + '</div>',
    init: function ($elem) {
        $elem.prepend(this.text)
    },
    remove:function(){
         $('.role-choose').remove()
    }
}
//加载框
//加载隐藏于显示
var zivenload = {//加载数据对象
    text: '<div class="loading-container">'
    + '<div class="loading">'
    + '<span></span>'
    + '<span></span>'
    + '<span></span>'
    + '<span></span>'
    + '</div>'
    + '</div>',
    start: function () {
        $(arguments[0]).prepend(this.text)
    },
    end: function () {
        setTimeout(function () { $('.loading-container').remove() }, 390)
    }
}



//管理员角色(厂商/电信)选择模态窗口选择

function initChooseFactureModal($elem,fun, routeType, isShow,isChoose,isAuthority) {
    //初始化模态窗口 routerType:以电信2或者银行1角色,isShow:是否模态窗口显示
    //fun 授权结束后要执行的函数
    //isChoose 是否要有初始选项，1为要
    //isAuthority初始化后是否要进行授权，1为要
    zivenload.start(".wrap-container__box")
    $.ajax({
        type: 'get',
        url: baseUrl + (routeType == 1 ? listManufacturerGeneralRoute : listCTInfoGeneralRoute),
        timeout: 4000,
        success: function (data) {
            !data.msg ? initFactureSelect((routeType == 1 ? data.mList : data.ctList), routeType,isChoose,$elem) : x0pAjaxError('query', data);
            !data.msg && isShow ? $elem.modal('show') : ''//完成初始化,显示模态窗口
            !data.msg && isAuthority? AuthorityAction($elem,fun, routeType) : ''
        },
        error: function (data) {
            x0pServerError(data)
        },
        complete: function () {
            zivenload.end()
        }
    })
}
function initFactureSelect(list, routeType,isChoose,$elem) {//初始化下拉框
    $elem.empty(); //清空
    $.each(list, function (index) {
        routeType == 1 ? $elem.append("<option value='" + this.mid + "' style='border-radius:0'>" + this.mname + "</option>") :
            $elem.append("<option value='" + this.ctId + "' style='border-radius:0'>" + this.ctName + "</option>");
    })
    isChoose?document.getElementById($elem.selector.toString().substring(1,$elem.selector.length)).options[0].selected = true:''

}

// 初始化页面操作授权 字符串10为厂商授权，11为电信授权
function initAdminAuthorityManage(fun, needAuthor) {
    if (needAuthor == '10') {
        initChooseFactureModal($("#chooseFactureSelect"),fun, 1, 0,1,1)
    } else if (needAuthor == '11') {
        initChooseFactureModal($("#chooseFactureSelect"),fun, 2, 0,1,1)
    }
    document.getElementById("chooseFactureSelect").addEventListener("change", function () {

        if (needAuthor == '10') {
            AuthorityAction($("#chooseFactureSelect"),fun, 1)
        } else if (needAuthor == '11') {
            AuthorityAction($("#chooseFactureSelect"),fun, 2)
        }

    })

}
function AuthorityAction($elem,fun, routeType) {//赋予管理员权限
    zivenload.start(".wrap-container__box")
    chooseId = $elem.find("option:selected").val();
    $.ajax({
        type: 'post',
        url: baseUrl + (routeType == 1 ? (giveManufacturerAuthorityRoute + "?mid=") : (giveCTAuthorityRoute + "?ctId=")) + chooseId,
        success: function (data) {
            !data.msg ? fun()//授权结束，初始化页面操作
                : x0pAjaxError('authority', data)
            !data.msg ? $elem.modal('hide') : ''
        },
        error: function (data) {
            x0pServerError(data)
        }, complete: function () {
            zivenload.end()
        }
    })

}