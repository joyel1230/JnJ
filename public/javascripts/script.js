function addToCart(proId) {
  document.querySelector(".notification").style.display = "flex";
  let not = +document.querySelector(".notification").innerHTML;
  if (not == "") {
    document.querySelector(".notification").innerHTML = 1;
  } else {
    document.querySelector(".notification").innerHTML = not + 1;
  }
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (response) => {
      if (response.user) {
        document.querySelector(".notification").innerHTML = response.cart ?? "";
      } else {
        window.location.href = "/login";
      }
    },
  });
}

function addToCartW(proId) {
  document.querySelector(".notification").style.display = "flex";
  let not = +document.querySelector(".notification").innerHTML;
  if (not == "") {
    document.querySelector(".notification").innerHTML = 1;
  } else {
    document.querySelector(".notification").innerHTML = not + 1;
  }
  $.ajax({
    url: "/add-to-cart/" + proId,
    method: "get",
    success: (res) => {
      // console.log(response+'hi');
      window.location.href = "/wishlist";
      document.querySelector(".notification").innerHTML = res.cart ?? "";
    },
  });
}
function addToWish(proId) {
  $.ajax({
    url: "/add-to-wishlist/" + proId,
    method: "get",
    success: (response) => {
      // console.log(response+'hi');
    },
  });
}

function checkCoupon() {
  let code = document.getElementById("code").value;
  let total = Number(document.getElementById("subTotal").innerHTML);

  $.ajax({
    url: `/coupon-check?code=${code}&total=${total}`,
    method: "get",
    success: (res) => {
      if (res.status) {
        window.location.reload();
      } else {
        document.getElementById("cmsg1").innerHTML = "&nbsp;coupon error&nbsp;";
        document.getElementById("cmsg").innerHTML = "";
      }
    },
  });
}
function selectBanner(id, index) {
  let check = document.getElementsByClassName("checked");
  for (let i = 0; i < check.length; i++) {
    check[i].checked = false;
  }
  check[index].checked = true;
  $.ajax({
    url: `/admin/select-banner?id=${id}`,
    method: "get",
    success: (resp) => {},
  });
}
