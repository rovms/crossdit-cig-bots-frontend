import router from "../router";

export default function authHeader() {
  const lsToken = localStorage.getItem("engineer");
  if (!lsToken) {
    router.push({ name: "Login" });
    return;
  }
  return { Authorization: "Bearer " + lsToken };
}
