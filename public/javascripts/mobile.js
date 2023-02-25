

function isValid() {
    let val=document.getElementById('mobile').value.trim()
    
    if (val.length===10 && /^\d+$/.test(val)) {
        return true;
    }
    document.getElementById('not').innerHTML="type valid number"
    return false;
}