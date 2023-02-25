

function isValid() {
    let mobile=document.getElementById('mobile').value.trim();
    let OTP=document.getElementById('OTP').value.trim();
    let pass=document.getElementById('pass').value;
    let rePass=document.getElementById('rePass').value;
    let OTPn=mobile[6]+mobile[7]+mobile[8]+mobile[9];
    if (mobile.length===10 && /^\d+$/.test(mobile)) {
        if (OTP===OTPn) {
            document.getElementById('sameOTP').innerHTML=''
            if (pass.length>=4) {
                document.getElementById('samePass').innerHTML=''
                if (pass===rePass) {
                    return true;
                }else{
                    document.getElementById('sameRe').innerHTML='password must be same'
                }
            }else{
                document.getElementById('samePass').innerHTML='minimum 4 digits'
            }
        }else{
            document.getElementById('sameOTP').innerHTML='wrong OTP'
        }
    }else{
        document.getElementById('sameMOb').innerHTML="type valid number"
    }
    return false;
}