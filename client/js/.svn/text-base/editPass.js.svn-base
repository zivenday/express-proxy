var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
    loc = "http://10.16.29.101:8080";
}

$(document).ready(function() {

	$("#inputPasswordOld").blur(function(){
		writeInfo("#inputPasswordOld", isPasswordOldValid());
	});
	$("#inputPasswordNew1").blur(function(){
		writeInfo("#inputPasswordNew1", isPasswordNew1Valid( $.trim($("#inputPasswordOld").val()) ));
	});
	$("#inputPasswordNew2").blur(function(){
		writeInfo("#inputPasswordNew2", isPasswordNew2Valid( $.trim($("#inputPasswordNew1").val()) ));
	});

	//点击“确认”按钮
	$("#btn-edit-pass").click(function(){
		var oldpass = $.trim( $("#inputPasswordOld").val() );
		var newpass1 = $.trim( $("#inputPasswordNew1").val() );
		var newpass2 = $.trim( $("#inputPasswordNew2").val() );
		if($("#edit-form-1").find(".error").length == 0 && !!oldpass && !!newpass1 && !!newpass2 ){
			updateLoginUserPwd(oldpass, newpass1);
		}
		else{
			alert("请正确填写密码信息！");
		}
	});
});
//-----------------------------登出-----------------------------
function outLogin(){
	
	$.ajax({
		url: loc+'/recharge/manager/outLogin.do',
		data: {},
		type: 'GET',
		dataType:'JSON',
		success: function(msg){
			switch(String(msg.msg)){
				case "0":
					alert("修改成功，请重新登录");
					sessionStorage.clear();
					parent.window.location.href = "login.html";
					break;
				case "10":   //登录超时、未登录
					sessionStorage.clear();
					parent.window.location.href = "login.html";
					break;
			}
		},
		error: function(msg){
			sessionStorage.clear();
			parent.window.location.href = "login.html";
		}
	});
}

//------------------------------ajax封装-------------------------
function updateLoginUserPwd(oldOne, newOne){
	$.ajax({
		url: loc+'/recharge/manager/updateLoginUserPwd.do',
		data: {oldPassword: oldOne, newPassword: newOne},
		type: 'POST',
		dataType:'JSON',
		success: function(msg){
			switch(String(msg.msg)){
				case "0":
					//登出，跳转到登录页面
					outLogin();
					break;
				case "1"://修改失败
					alert("修改密码失败，请稍后重试");
					break;
				case "2"://参数错误、密码错误
					alert("检查旧密码是否输入错误");
					break;
				case "10"://未登录或登录超时
					alert("未登录或登录超时，请重新登录");
					parent.window.location.href = "login.html";
					break;
				default:
					alert("连接超时，请检查网络连接");
					break;
			}
		},
		error: function(msg){
			alert("连接超时，请检查网络连接");
		}
	});
}

//------------------------------dom操作--------------------------
//输出验证信息
function writeInfo(domElementString, result){
    $(domElementString+"+p").remove();
    if(result != "正确"){
        $(domElementString).after("<p class='error'>"+ result +"</p>");
    }
    else{
    	//为正确
       $(domElementString).after("<p class='valid'></p>");
    }
}

//------------------------------每个输入框的验证--------------------------
function isPasswordOldValid(){
	var passold = $.trim($("#inputPasswordOld").val());
	if(!passold){
		return "未输入旧密码"
	}
	else {
		return "正确";
	}
}
function isPasswordNew1Valid(passOld){
	var pass1 = $.trim($("#inputPasswordNew1").val());
	if(!pass1){
		return "未输入新密码"
	}
	else if( pass1.length<6 || pass1.length>16 ){
		return "密码长度为6～16";
	}
	else if( pass1 == passOld){
		return "新密码不能与旧密码相同"
	}
	else {
		return "正确";
	}
}
function isPasswordNew2Valid(pass1){
	var pass = $.trim($("#inputPasswordNew2").val());
	if(!pass){
		return "未再一次输入新密码"
	}
	else if( pass1.length<6 || pass1.length>16 ){
		return "密码长度为6～16";
	}
	else if(pass != pass1){
		return "两次输入的密码不一致";
	}
	else {
		return "正确";
	}
}