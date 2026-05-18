async function test() {
  try {
    const res = await fetch("http://localhost:3000/api/health");
    console.log(res.status, await res.text());

    const r2 = await fetch("http://localhost:3000/api/sales");
    console.log(r2.status, await r2.text());
  } catch (e) {
    console.error(e);
  }
}
test();
