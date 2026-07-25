const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/api/admin/login', {
      nim: 'admin',
      password: 'admin123'
    });
    console.log(res.data);
  } catch (err) {
    console.error(err.response.data);
  }
}

test();
