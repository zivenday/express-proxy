sessionStorage.setItem("loc"," ");
var loc;
if(!!sessionStorage.getItem("loc")){
    loc = sessionStorage.getItem("loc");
}
else{
    //没有存到session的话，默认使用服务器ip
	loc = "http://10.16.29.101:8080";
}

//------------- sessionStorage关于账号 -------------------
//"type"			账号类型
//"useraccount"		登录账号
//"name"			账户name     (type为2 or 3)
//"mid"				厂商id		(type为2)

$(document).ready(function(){

	var storage = window.localStorage;
	if( storage["isRememberAccount"]=="yes" && !!storage["rememberAccount"] ){
		$("#inputUsername").val(storage["rememberAccount"]);
		$("#input_remember_account").attr("checked");
	}

	$("#btn-toRegister").click(function(){
		window.location.href = "s-register.html";
	});

	var isOK = false;

	$("#btn-login").click(function(){
		$(".p-error").html("&nbsp;");
		
		var username = $.trim($("#inputUsername").val());
		var pwd = $.trim($("#inputPassword").val());
		if( !!username && !!pwd){
			//登录
			
			if($("#input_remember_account").is(':checked')){
				//要记住
				storage["isRememberAccount"] = "yes";
				storage["rememberAccount"] = username;
			}
			else{
				storage["isRememberAccount"] = "no";
				storage["rememberAccount"] = "";
			}
			zivenload.start("body");
			$.ajax({
				url: loc+'/recharge/manager/confirmLogin.do',
				type: 'POST',
				data: { account : username, password : pwd },
				dataType: 'json',
				success: function(msg){
					switch(String(msg.msg)){
						case "0":
							$(".p-error").html("&nbsp;");
							switch(String(msg.type)) {
								case "1":
									console.log("身份：管理员");
									break;
								case "2":
									console.log("身份：厂商");
									sessionStorage.setItem("mid",String(msg.mid));	//厂商mid
									sessionStorage.setItem("name",String(msg.name));	//厂商名称
									break;
								case "3":
									console.log("身份：电信");
									sessionStorage.setItem("name",String(msg.name));
									break;
							}
							sessionStorage.setItem("useraccount", username);
							sessionStorage.setItem("type", String(msg.type));

							window.location.href = "index.html";					
							break;
						case "2":
							$(".p-error").html("参数错误");
							break;
						case "5":
							x0pAjaxError(msg);
							break;
						case "6":
							x0pAjaxError(msg);
							break;
					}
				},
				error: function(msg){
					x0pServerError(msg);
				},
				complete:function(){
					zivenload.end();
				}
			});
		}
		else{
			if(!username){
				$(".p-error").html("请输入正确的账号");
			}
			else if(!pwd){
				$(".p-error").html("请填入正确的密码");
			}
		}
	});
});