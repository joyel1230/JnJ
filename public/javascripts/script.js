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