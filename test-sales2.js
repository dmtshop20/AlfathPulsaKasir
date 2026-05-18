async function test() {
  try {
    const loginRes = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "admin123" })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
  
    const p2 = await fetch("http://localhost:3000/api/sales?branchId=", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log("sales: ", p2.status, await p2.text().catch(()=>""));
    
  } catch(e) {
    console.error(e);
  }
}
test();
