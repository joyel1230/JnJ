function addToCart(proId){
    
    $.ajax({
        url:'/add-to-cart/'+proId,
        method: 'get',
        success:(response)=>{
            console.log(response+'hi');
        }
    })

}
function addToWish(proId) {
    $.ajax({
        url:'/add-to-wishlist/'+proId,
        method: 'get',
        success:(response)=>{
            console.log(response+'hi');
        }
    })
}