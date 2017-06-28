sessionStorage.setItem("loc"," ");
var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
    loc = "http://10.16.29.101:8080";
}

$(document).ready(function() {

    $("#inputAccountName").blur(function(){
        //writeInfo("#inputAccountName", );
        isAccountValid();
    });
    $("#inputPassword1").blur(function(){
        writeInfo("#inputPassword1", isPasswordValid());
    });
    $("#inputPassword2").blur(function(){
        writeInfo("#inputPassword2", isPassword2Valid( $.trim($("#inputPassword1").val()) ));
    });
    $("#inputCorporateName").blur(function(){
        writeInfo("#inputCorporateName", isCorporateNameValid());
    });
    $("#inputCorporateAddress").blur(function(){
        writeInfo("#inputCorporateAddress", isCorporateAddressValid());
    });
    $("select").change(function(){
        writeInfo("#inputCorporateAddress", isSelectAddressValid());
    });
    $("#inputContactPerson").blur(function(){
        writeInfo("#inputContactPerson", isContactPersonValid());
    });
    $("#inputPhoneNumber").blur(function(){
        writeInfo("#inputPhoneNumber", isphoneNumberValid());
    });

    //点击“登录”button
    $("#btn-register").click(function(){
 
        var accountName =  $.trim( $("#inputAccountName").val() );
        var password1 = $.trim( $("#inputPassword1").val() );
        var password2 = $.trim( $("#inputPassword2").val() );
        var corporateName =  $.trim( $("#inputCorporateName").val() );
        var corporateAddress =  $("select[name='province3']").val() + $("select[name='city3']").val() + $("select[name='area3']").val() +$.trim( $("#inputCorporateAddress").val() );
        var contactPerson =  $.trim( $("#inputContactPerson").val() );
        var phoneNumber =  $.trim( $("#inputPhoneNumber").val() );

        if( $("#register-form-1").find(".error").length == 0 && !!accountName && !!password1 && !!password2 && !!corporateName && !!corporateAddress && !!contactPerson && !!phoneNumber ){
            //没有错误提示 且 不为空
            var json_mInfo = {
                name: corporateName,
                address: corporateAddress,
                contacts: contactPerson,
                contactsPhone: phoneNumber
            };
            var json_aInfo = {
                account: accountName,
                password: password1
            };
            registerManufacturer(json_mInfo, json_aInfo)
        }
        else{
            isAccountValid();
            writeInfo("#inputPassword1", isPasswordValid());
            writeInfo("#inputPassword2", isPassword2Valid( $.trim($("#inputPassword1").val()) ));
            writeInfo("#inputCorporateName", isCorporateNameValid());
            writeInfo("#inputCorporateAddress", isCorporateAddressValid());
            writeInfo("#inputCorporateAddress", isSelectAddressValid());
            writeInfo("#inputContactPerson", isContactPersonValid());
            writeInfo("#inputPhoneNumber", isphoneNumberValid());

            x0pERROR("未正确填写完注册信息");

        }
    });

});

//------------------------------ajax封装--------------------------
//验证账号是否存在
function confirmAccount(accountName, confirmResult){
    $.ajax({
        url: loc+'/recharge/manager/confirmAccount.do',
        type: 'POST',
        data: { account : accountName},
        dataType: 'json',
        success: function(msg){
            console.log(msg);
            switch( String(msg.msg) ){
                case "0":
                    confirmResult("该账号可用");
                    break;
                case "1":
                    confirmResult("该账号已被注册");
                    break;
                case "2": default:
                    console.log("confirmAccout.do + success() + "+msg.code);
                    confirmResult("参数错误");
                    break;
            }
        },
        error: function(msg){
            console.log("confirmAccout.do + error() + ");
            confirmResult("账号检验出错，请检查网络连接");
        }
    });
}
//注册
function registerManufacturer(json_mInfo, json_aInfo){
    zivenload.start("body");
    $.ajax({
        url: loc+'/recharge/manager/registerManufacturer.do',
        type: 'POST',
        data: {
            manufacturerInfo : JSON.stringify(json_mInfo),
            accountInfo : JSON.stringify(json_aInfo)
        },
        dataType: 'JSON',
        success: function(msg){
            switch(String(msg.msg)){
                case "0":
                    //成功
                    //x0pSuccess('register');
                    x0p('注册成功', '即将跳转至登录页面', 'ok',function(data) {
                        if(data == 'ok'){
                            window.location.href = "login.html" ;
                        }
                    });
                    break;
                case "1":case "2": defalut:
                    x0pAjaxError(msg);
                    break;
                case "3":
                    writeInfo("#inputAccountName", "该账号已被注册");
                    break;
            }
        },
        error: function(msg){
            x0pServerError(msg);
        },
        complete: function(){
            zivenload.end();
        }
    });
}

//------------------------------dom操作--------------------------
//输出验证信息
function writeInfo(domElementString, result){
    
    $(domElementString+"+p").html("");
    $(domElementString+"+p").removeClass();

    if( result.indexOf("检查") >= 0 ){
        $(domElementString+"+p").addClass("error");
        $(domElementString+"+p").html(result);
        x0pERROR(result);
    }
    else if(result != "正确" && result !="该账号可用"){
        $(domElementString+"+p").addClass("error");
        $(domElementString+"+p").html(result);
    }
    else{
        $(domElementString+"+p").addClass("valid");
        $(domElementString+"+p").html(result);
    }
}

//------------------------------每个输入框的验证--------------------------
//验证“账号”输入框
function isAccountValid(){
    var reg_for_account = /^[a-zA-Z][a-zA-Z]*[0-9]+[a-zA-Z]*/;
    var account = $.trim($("#inputAccountName").val());
    var tip = "";
    if(!account){
        //输入为空
        tip = "未输入账号";
    }
    else if(account.length<6 || account.length>16){
        tip = "账号长度为6～16";
    }
    else if( !reg_for_account.test(account) || !!/[^a-zA-Z0-9]+/.test(account)){
        tip = "账号由字母、数字组成，首字符不能为数字";
    }
    else{
        confirmAccount(account, function(res){
            tip= res;
            writeInfo("#inputAccountName", tip);
        })
    }
    writeInfo("#inputAccountName", tip);
}
//验证“密码”输入框
function isPasswordValid(){
    var pass = $.trim($("#inputPassword1").val());
    if(!pass){
        return "未输入密码";
    }
    else if( pass.length<6 || pass.length>16 ){
        return "密码长度为6～16";
    }
    else {
        return "正确";
    }
}
function isPassword2Valid(pass1){
    var pass = $.trim($("#inputPassword2").val());
    if(!pass){
        return "未输入密码";
    }
    else if( pass.length<6 || pass.length>16 ){
        return "密码长度为6～16";
    }
    else if( pass != pass1){
        return "两次输入的密码不一致";
    }
    else{
        return "正确";
    }
}
function isCorporateNameValid(){
    var corporateName = $.trim($("#inputCorporateName").val());
    if(!corporateName){
        return "未输入公司名称";
    }
    else {
        return "正确";
    }
}
function isCorporateAddressValid(){
    //还要验证三个select框
    var corporateAddress = $.trim($("#inputCorporateAddress").val());
    var province = $("select[name='province3']").val();
    var city = $("select[name='city3']").val();
    var area = $("select[name='area3']").val();
    if(!corporateAddress){
        return "未输入公司详细地址";
    }
    if( !province || !city || !area){
        return "未选择公司所在的省市区";
    }
    else {
        return "正确";
    }
}
function isSelectAddressValid(){
    var corporateAddress = $.trim($("#inputCorporateAddress").val());
    var province = $("select[name='province3']").val();
    var city = $("select[name='city3']").val();
    var area = $("select[name='area3']").val();
    if(!province || !city || !area){
        return "未选择公司所在的省市区";
    }
    else if(!corporateAddress){
        return "未输入公司详细地址";
    }
    else{
        return "正确";
    }
}
function isContactPersonValid(){
    var contactPerson = $.trim($("#inputContactPerson").val());
    if(!contactPerson){
        return "未输入联系人";
    }
    else {
        return "正确";
    }
}
function isphoneNumberValid(){
    var phoneNumber = $.trim($("#inputPhoneNumber").val());
    var reg_for_phoneNumber = /^1[34578]\d{9}$/;
    if(!phoneNumber){
        return "未输入联系电话";
    }
    else if( !reg_for_phoneNumber.test(phoneNumber) ){
        return "请填写正确的手机号";
    }
    else {
        return "正确";
    }
}