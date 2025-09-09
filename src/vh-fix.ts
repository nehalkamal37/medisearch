// src/vh-fix.ts
export function setVhUnit() {
  const set = () => document.documentElement.style.setProperty("--vh", `${window.innerHeight/100}px`);
  set(); window.addEventListener("resize", set);
}
