let itemQty = document.getElementsByClassName('itemQty')
    let itemTotal = document.getElementsByClassName('itemTotal')
    let subTotal = document.getElementById('subTotal')
    let discount = document.getElementById('discount').innerHTML
    let total = document.getElementById('total')
    let sum = 0
    for (let i = 0; i < itemQty.length; i++) {
        let qty = Number(itemQty[i].innerHTML)
        let price = Number(itemTotal[i].innerHTML)
        itemTotal[i].innerHTML = qty * price;
        sum += (qty * price)
    }
    subTotal.innerHTML = sum
    total.innerHTML = sum - Number(discount)
    let dis = Number(discount)
    if (dis > 0) {
        document.getElementById('cmsg').innerHTML = "&nbsp;coupon added&nbsp;"
    }

    let p1 = document.getElementById('pro1')
    let p2 = document.getElementById('pro2')
    let p3 = document.getElementById('pro3')
    p1.style.display = 'none'
    p2.style.display = 'none'
    p3.style.display = 'none'
    function cash() {
        p2.style.display = 'none'
        p3.style.display = 'none'
        p1.style.display = 'block'

    }
    function pay() {
        p1.style.display = 'none'
        p3.style.display = 'none'
        p2.style.display = 'block'
    }
    function paypal() {
        p1.style.display = 'none'
        p2.style.display = 'none'
        p3.style.display = 'block'
    }
    function cashOrder() {
        let discount = Number(document.getElementById('discount').innerHTML)
        let total = Number(document.getElementById('total').innerHTML)
        let pro1 = document.getElementById('pro1')
        let addNO = Number(document.getElementById('addNo').innerHTML)
        let url = `/cash-order?discount=${discount}&total=${total}&addr=${addNO}`
        pro1.setAttribute("href", encodeURI(url))
    }
    function payOrder() {
        let discount = Number(document.getElementById('discount').innerHTML)
        let total = Number(document.getElementById('total').innerHTML)
        let addNO = Number(document.getElementById('addNo').innerHTML)
        $.ajax({

            url: `/pay-order?discount=${discount}&total=${total}&addr=${addNO}`,
            method: 'get',
            success: (response) => {
                if (response.status) {
                    window.location.href = '/add-address';
                }else{
                razorPay(response.order)
                }
            }
        })


    }
    function razorPay(order) {

        var options = {
            "key": "rzp_test_uddjdf2OJtzLq3", // Enter the Key ID generated from the Dashboard
            "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
            "currency": "INR",
            "name": "JnJ", //your business name
            "description": "Test Transaction",
            "image": "https://img.myloview.com/stickers/j-j-logo-icon-vector-design-700-189504064.jpg",
            "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
            "handler": function (response) {
                // alert(response.razorpay_payment_id);
                // alert(response.razorpay_order_id);
                // alert(response.razorpay_signature);
                verifyPay(response, order)
            },
            "prefill": {
                "name": "Gaurav Kumar", //your customer's name
                "email": "gaurav.kumar@example.com",
                "contact": "9000090000"
            },
            "notes": {
                "address": "Razorpay Corporate Office"
            },
            "theme": {
                "color": "#3399cc"
            },

        };
        var rzp1 = new Razorpay(options);
        rzp1.open();

    }
    function verifyPay(payment, order) {

        $.ajax({
            url: '/verify-payment',
            data: {
                payment,
                order
            },
            method: 'post',
            success: (response) => {
                if (response.status) {
                    window.location.href = '/orders';
                } else {
                    window.location.href = '/orders';
                }
            }
        })
    }
    function paypalOrder(){
        let discount = Number(document.getElementById('discount').innerHTML)
        let total = Number(document.getElementById('total').innerHTML)
        let pro3 = document.getElementById('pro3')
        let addNO = Number(document.getElementById('addNo').innerHTML)

        let url = `/paypal-order?discount=${discount}&total=${total}&addr=${addNO}`
        pro3.setAttribute("href", encodeURI(url))
    }

    let rad = document.getElementsByClassName('radio')
    rad[0].checked = true

    function changeAdd(ind,name1,mobile1,street1,city1,pincode1){
        document.getElementById('addNo').innerHTML=ind
        let name = document.getElementById('name')
        let mobile = document.getElementById('mobile')
        let street = document.getElementById('street')
        let city = document.getElementById('city')
        let pincode = document.getElementById('pincode')
        name.value = name1
        mobile.value = mobile1
        street.value = street1
        city.value = city1
        pincode.value = pincode1
    }

    function couponInsert(code) {
        console.log(code);
        document.getElementById('code').value = code
    }