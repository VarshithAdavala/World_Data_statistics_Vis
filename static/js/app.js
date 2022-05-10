const el0 = document.querySelector(".vector-circle0");
const el1 = document.querySelector(".vector-circle1");
const el2 = document.querySelector(".vector-circle2");
var body = document.getElementById("body");

body.addEventListener("mousemove", (e) => {
  el0.style.marginLeft = e.offsetX/40 + "px";
  el0.style.marginTop = e.offsetY/40 + "px";
  el1.style.marginLeft = e.offsetX/40 + "px";
  el1.style.marginTop = e.offsetY/40 + "px";
  el2.style.marginLeft = e.offsetX/40 + "px";
  el2.style.marginTop = e.offsetY/40 + "px";
});