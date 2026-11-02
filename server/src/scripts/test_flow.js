import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });

const API = 'http://localhost:5000/api';

async function runTestFlow() {
  console.log('Starting local demo API smoke test...\n');

  // 1. Health check
  const health = await axios.get(`${API}/health`);
  console.log('✅ 1. Health Check:', health.data);

  // 2. Student Login
  const studentLogin = await axios.post(`${API}/auth/login`, {
    email: 'student1@example.test',
    password: 'Student@123'
  });
  const studentToken = studentLogin.data.data.token;
  console.log('✅ 2. Student Logged In:', studentLogin.data.data.user.name);

  // 3. Fetch Events
  const eventsRes = await axios.get(`${API}/events`);
  const events = eventsRes.data.data.items;
  console.log(`✅ 3. Public Events Retrieved: ${events.length} events found`);

  // Pick an upcoming event to register
  const targetEvent = events.find((e) => new Date(e.startsAt) > new Date()) || events[0];
  console.log(`🎯 Testing registration for: "${targetEvent.title}"`);

  // 4. Register for event
  try {
    const regRes = await axios.post(
      `${API}/events/${targetEvent._id}/register`,
      {},
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    console.log('✅ 4. Student Registered. Ticket Code:', regRes.data.data.ticketCode);
  } catch (err) {
    if (err.response?.status === 409 && err.response?.data?.message === 'Already registered') {
      console.log('ℹ️ 4. Student was already registered (Rule R2 conflict check working).');
    } else {
      throw err;
    }
  }

  // 5. Check Student Registrations
  const myRegs = await axios.get(`${API}/registrations/me`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  console.log(`✅ 5. Student Dashboard loaded ${myRegs.data.data.length} registrations`);

  // 6. Admin Login
  const adminLogin = await axios.post(`${API}/auth/login`, {
    email: process.env.ADMIN_EMAIL || 'admin@example.test',
    password: process.env.ADMIN_PASSWORD || 'DemoAdminOnly123'
  });
  const adminToken = adminLogin.data.data.token;
  console.log('✅ 6. Admin Logged In:', adminLogin.data.data.user.name);

  // 7. Admin Stats Check
  const statsRes = await axios.get(`${API}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  console.log('✅ 7. Admin Analytics Dashboard Verified:', statsRes.data.data);

  console.log('\nLocal demo API smoke check completed successfully.\n');
}

runTestFlow().catch((err) => {
  console.error('Test flow error:', err.message);
  process.exit(1);
});
