function addToCart(proId){
    
    $.ajax({
        url:'/add-to-cart/'+proId,
        method: 'get',
        success:(response)=>{
            // console.log(response+'hi');
        }
    })

}

function addToCartW(proId){
    
    $.ajax({
        url:'/add-to-cart/'+proId,
        method: 'get',
        success:(res)=>{
            // console.log(response+'hi');
            window.location.href = '/wishlist';
        }
    })

}
function addToWish(proId) {
   
    $.ajax({
        url:'/add-to-wishlist/'+proId,
        method: 'get',
        success:(response)=>{
            // console.log(response+'hi');
        }
    })
}

function checkCoupon(){
    let code =document.getElementById('code').value
    let total =Number(document.getElementById('subTotal').innerHTML)

    $.ajax({
        url:`/coupon-check?code=${code}&total=${total}`,
        method: 'get',
        success:(res)=>{
            if (res.status) {
                window.location.reload()
           
            } else {
           document.getElementById('cmsg1').innerHTML="&nbsp;coupon error&nbsp;"
        document.getElementById('cmsg').innerHTML = ""

                
            }
           
        }
    })
}