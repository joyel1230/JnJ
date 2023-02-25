

function isValid() {
    let mobile=document.getElementById('mobile').value;
    console.log(mobile);
    let OTP=document.getElementById('OTP').value.trim();
    let pass=document.getElementById('pass').value;
    let rePass=document.getElementById('rePass').value;
    let OTPn=mobile[6]+mobile[7]+mobile[8]+mobile[9];
    if (mobile.length===10 && /^\d+$/.test(mobile)) {
        document.getElementById('sameMob').innerHTML=''
        if (OTP===OTPn) {
            document.getElementById('sameOTP').innerHTML=''
            if (pass.length>=4) {
                document.getElementById('samePass').innerHTML=''
                if (pass===rePass) {
                    return true;
                }else{
                    document.getElementById('sameRe').innerHTML='&nbsp;Password must be same&nbsp;'
                }
            }else{
                document.getElementById('samePass').innerHTML='&nbsp;Minimum 4 digits&nbsp;'
            }
        }else{
            document.getElementById('sameOTP').innerHTML='&nbsp;Wrong OTP&nbsp;'
        }
    }else{
        document.getElementById('sameMob').innerHTML="&nbsp;Type valid number&nbsp;"
    }
    return false;
}