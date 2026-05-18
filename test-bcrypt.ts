import bcrypt from 'bcryptjs';
async function test() {
  try {
    const hash = await bcrypt.hash('admin', 10);
    const result = await bcrypt.compare(undefined as any, hash);
    console.log("Result:", result);
  } catch(e) {
    console.log("Error:", e);
  }
}
test();
