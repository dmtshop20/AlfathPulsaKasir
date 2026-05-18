async function test() {
  try {
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
  
    console.log("Token status:", token ? "Got token" : "No token");
  
    const salesRes = await fetch("http://localhost:3000/api/sales", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("Sales status:", salesRes.status);
    console.log("Sales body:", await salesRes.text());
  } catch(e) {
    console.error(e);
  }
}
test();
