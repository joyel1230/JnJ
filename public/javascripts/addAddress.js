function isValid() {
  let mob = document.getElementById("mobile").value.trim();
  let street = document.getElementById("street").value.trim();
  let city = document.getElementById("city").value.trim();
  let state = document.getElementById("state").value.trim();
  let country = document.getElementById("country").value.trim();
  let pincode = document.getElementById("pincode").value.trim();

  if (mob.length === 10 && /^\d+$/.test(mob)) {
    document.getElementById("mobileS").innerHTML = "";
    if (true) {
      document.getElementById("streetS1").innerHTML = "";
      if (/^[a-zA-Z]+$/.test(city)) {
        document.getElementById("streetS2").innerHTML = "";
        if (/^[a-zA-Z]+$/.test(state)) {
          document.getElementById("streetS3").innerHTML = "";
          if (/^[a-zA-Z]+$/.test(country)) {
            document.getElementById("streetS4").innerHTML = "";
            if (pincode.length === 6 && /^\d+$/.test(pincode)) {
              return true;
            } else {
              document.getElementById("pinS").innerHTML = "Invalid";
            }
          } else {
            document.getElementById("streetS4").innerHTML = "Invalid";
          }
        } else {
          document.getElementById("streetS3").innerHTML = "Invalid";
        }
      } else {
        document.getElementById("streetS2").innerHTML = "Invalid";
      }
    } else {
      document.getElementById("streetS1").innerHTML = "Invalid";
    }
  } else {
    document.getElementById("mobileS").innerHTML = "Invalid";
  }
  return false;
}
