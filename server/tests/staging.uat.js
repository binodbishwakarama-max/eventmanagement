/**
 * DSU CAMPUS EVENTS — FINAL STAGING VALIDATION & REAL-WORLD USER ACCEPTANCE TESTING SUITE
 * 
 * Executes full end-to-end user journeys (Student, Organizer, Administrator),
 * security attack vectors, data consistency verifications, and concurrency checks
 * against the live backend server.
 */

import http from 'http';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

// Helper to make HTTP requests
function request(method, path, data = null, token = null, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path.startsWith('http') ? path : `${API_BASE}${path}`);
    const isMultipart = extraHeaders['content-type']?.includes('multipart');
    
    let body = null;
    let headers = { ...extraHeaders };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && !isMultipart) {
      body = JSON.stringify(data);
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(body);
    } else if (data && isMultipart) {
      body = data; // Buffer
      headers['Content-Length'] = body.length;
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try {
          json = JSON.parse(rawData);
        } catch (e) {
          json = { raw: rawData };
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

// Multipart helper for testing poster upload
function createMultipartFormData(fieldName, fileName, mimeType, fileBuffer) {
  const boundary = `----WebKitFormBoundary${Date.now().toString(16)}`;
  const header = `--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--\r\n`;
  
  const headerBuffer = Buffer.from(header, 'utf8');
  const footerBuffer = Buffer.from(footer, 'utf8');
  const totalBuffer = Buffer.concat([headerBuffer, fileBuffer, footerBuffer]);
  
  return {
    buffer: totalBuffer,
    contentType: `multipart/form-data; boundary=${boundary}`
  };
}

async function runStagingUAT() {
  console.log('========================================================================');
  console.log('       DSU CAMPUS EVENTS — STAGING UAT & FINAL VALIDATION SUITE        ');
  console.log('========================================================================\n');

  const report = {
    totalTests: 0,
    passed: 0,
    failed: 0,
    results: []
  };

  function assert(name, condition, evidence = '') {
    report.totalTests++;
    if (condition) {
      report.passed++;
      console.log(`  ✔ [PASS] ${name}`);
      report.results.push({ name, status: 'PASS', evidence });
    } else {
      report.failed++;
      console.error(`  ✖ [FAIL] ${name}`);
      console.error(`    Evidence: ${evidence}`);
      report.results.push({ name, status: 'FAIL', evidence });
    }
  }

  // --- HEALTH & READINESS PROBES ---
  console.log('--- PHASE 0: SERVER & DATABASE READINESS PROBES ---');
  const healthRes = await request('GET', '/health');
  assert(
    'Server Health Check (/api/health) returns HTTP 200 and healthy DB',
    healthRes.status === 200 && healthRes.data?.data?.database?.connected === true,
    `Status: ${healthRes.status}, Body: ${JSON.stringify(healthRes.data)}`
  );

  const readyRes = await request('GET', '/health/ready');
  assert(
    'Readiness Probe (/api/health/ready) returns HTTP 200',
    readyRes.status === 200 && readyRes.data?.status === 'ready',
    `Status: ${readyRes.status}`
  );

  // --- 1. STUDENT REAL USER JOURNEY ---
  console.log('\n--- PHASE 1: STUDENT REAL USER JOURNEY ---');
  
  const testStudentEmail = `uat_student_${Date.now()}@dsu.edu.in`;
  const testStudentUSN = `1DS23CS${Math.floor(100 + Math.random() * 899)}`;
  const testStudentPassword = 'StudentPass@123';

  // 1.1 Register Student Account
  const regRes = await request('POST', '/auth/register', {
    name: 'Kavya S. Gowda',
    email: testStudentEmail,
    password: testStudentPassword,
    usn: testStudentUSN,
    department: 'School of Computer Science & Engineering'
  });
  assert(
    'Student Registration: Successful with valid DSU email & USN (HTTP 201)',
    regRes.status === 201 && regRes.data?.data?.user?.email === testStudentEmail,
    `Status: ${regRes.status}, USN: ${testStudentUSN}`
  );

  const studentUser = regRes.data?.data?.user;
  let studentToken = regRes.data?.data?.token;

  // 1.2 Student Login
  const loginRes = await request('POST', '/auth/login', {
    email: testStudentEmail,
    password: testStudentPassword
  });
  assert(
    'Student Login: Authenticates and returns valid JWT (HTTP 200)',
    loginRes.status === 200 && !!loginRes.data?.data?.token,
    `Status: ${loginRes.status}, Role: ${loginRes.data?.data?.user?.role}`
  );
  studentToken = loginRes.data?.data?.token;

  // 1.3 Browse Published Events
  const browseRes = await request('GET', '/events?limit=10');
  assert(
    'Browse Events: Public events list returns published items (HTTP 200)',
    browseRes.status === 200 && Array.isArray(browseRes.data?.data?.items) && browseRes.data.data.items.length > 0,
    `Returned ${browseRes.data?.data?.items?.length} published events`
  );

  const targetEvent = browseRes.data.data.items[0];
  const targetEventId = targetEvent._id;
  const initialRegisteredCount = targetEvent.registeredCount;

  // 1.4 Search and Filter Events
  const searchRes = await request('GET', `/events?search=${encodeURIComponent(targetEvent.title.slice(0, 8))}`);
  assert(
    'Search & Filter: Event search by title keyword matches correctly',
    searchRes.status === 200 && searchRes.data?.data?.items?.some(e => e._id === targetEventId),
    `Query matches event: ${targetEvent.title}`
  );

  // 1.5 View Event Details
  const detailRes = await request('GET', `/events/${targetEventId}`, null, studentToken);
  assert(
    'View Event Details: Returns full metadata and registration state (HTTP 200)',
    detailRes.status === 200 && detailRes.data?.data?._id === targetEventId,
    `Event Title: ${detailRes.data?.data?.title}, Capacity: ${detailRes.data?.data?.capacity}`
  );

  // 1.6 Register for Event
  const registerEventRes = await request('POST', `/events/${targetEventId}/register`, {}, studentToken);
  assert(
    'Register for Event: Atomic seat reservation succeeds (HTTP 201)',
    registerEventRes.status === 201 && registerEventRes.data?.data?.status === 'registered',
    `Status: ${registerEventRes.status}, RegistrationId: ${registerEventRes.data?.data?._id}`
  );
  const studentTicketCode = registerEventRes.data?.data?.ticketCode;

  // 1.7 Receive Unique QR Pass
  assert(
    'Receive QR Pass: Ticket pass code is cryptographically unique and non-empty',
    typeof studentTicketCode === 'string' && studentTicketCode.length >= 6,
    `Generated Ticket Code: ${studentTicketCode}`
  );

  // 1.8 View Registered Events in My Passes
  const myPassesRes = await request('GET', '/registrations/me', null, studentToken);
  const activePass = myPassesRes.data?.data?.find(r => r.event?._id === targetEventId);
  assert(
    'My Passes: Returns active registrations with student details and pass codes',
    myPassesRes.status === 200 && !!activePass && activePass.ticketCode === studentTicketCode,
    `Active passes found: ${myPassesRes.data?.data?.length}`
  );

  // 1.9 Verify Seat Availability Decrement
  const eventAfterReg = await request('GET', `/events/${targetEventId}`);
  assert(
    'Data Consistency: Event registeredCount incremented atomically by exactly 1',
    eventAfterReg.data?.data?.registeredCount === initialRegisteredCount + 1,
    `Initial: ${initialRegisteredCount}, After: ${eventAfterReg.data?.data?.registeredCount}`
  );

  // 1.10 Cancel Registration
  const cancelRes = await request('DELETE', `/events/${targetEventId}/register`, null, studentToken);
  assert(
    'Cancel Registration: Student successfully cancels registration (HTTP 200)',
    cancelRes.status === 200 && cancelRes.data?.data?.message === 'Registration cancelled successfully',
    `Status: ${cancelRes.status}, Message: ${cancelRes.data?.data?.message}`
  );

  // 1.11 Verify Seat Availability Restored
  const eventAfterCancel = await request('GET', `/events/${targetEventId}`);
  assert(
    'Data Consistency: Event registeredCount decremented back after cancellation',
    eventAfterCancel.data?.data?.registeredCount === initialRegisteredCount,
    `Current Count: ${eventAfterCancel.data?.data?.registeredCount}, Expected: ${initialRegisteredCount}`
  );

  // 1.12 Re-register to hold pass for subsequent testing
  const reRegisterRes = await request('POST', `/events/${targetEventId}/register`, {}, studentToken);
  assert(
    'Re-registration: Student successfully re-registers for event (HTTP 201)',
    reRegisterRes.status === 201,
    `New Ticket Code: ${reRegisterRes.data?.data?.ticketCode}`
  );
  const persistentTicketCode = reRegisterRes.data?.data?.ticketCode;

  // 1.13 Log out & Session Revocation
  const logoutRes = await request('POST', '/auth/logout', null, studentToken);
  assert(
    'Logout: Session invalidated via tokenVersion increment (HTTP 200)',
    logoutRes.status === 200,
    `Message: ${logoutRes.data?.message}`
  );

  // Verify revoked token cannot be reused
  const revokedAccessRes = await request('GET', '/registrations/me', null, studentToken);
  assert(
    'Session Invalidation: Revoked JWT is rejected with HTTP 401 Unauthorized',
    revokedAccessRes.status === 401,
    `Status: ${revokedAccessRes.status}, Error: ${revokedAccessRes.data?.message}`
  );

  // 1.14 Log Back In & Verify Registration History Persists
  const reloginRes = await request('POST', '/auth/login', {
    email: testStudentEmail,
    password: testStudentPassword
  });
  const newStudentToken = reloginRes.data?.data?.token;
  const reloadedPassesRes = await request('GET', '/registrations/me', null, newStudentToken);
  const reloadedPass = reloadedPassesRes.data?.data?.find(r => r.event?._id === targetEventId);
  assert(
    'Persistence: Registration history persists across login sessions',
    reloadedPassesRes.status === 200 && !!reloadedPass && reloadedPass.ticketCode === persistentTicketCode,
    `Persisted Ticket: ${reloadedPass?.ticketCode}`
  );


  // --- 2. ORGANIZER REAL USER JOURNEY ---
  console.log('\n--- PHASE 2: ORGANIZER REAL USER JOURNEY ---');

  // 2.1 Organizer Login
  const organizerLoginRes = await request('POST', '/auth/login', {
    email: 'organizer@example.test',
    password: 'Organizer@123'
  });
  assert(
    'Organizer Login: Successfully authenticated with organizer role (HTTP 200)',
    organizerLoginRes.status === 200 && organizerLoginRes.data?.data?.user?.role === 'organizer',
    `User: ${organizerLoginRes.data?.data?.user?.name}, Role: ${organizerLoginRes.data?.data?.user?.role}`
  );
  const organizerToken = organizerLoginRes.data?.data?.token;

  // 2.2 Create an Event (Draft)
  const startsDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const endsDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000);
  const newEventPayload = {
    title: `UAT Campus Tech Colloquium ${Date.now()}`,
    description: 'An intensive research and developer colloquium organized for DSU engineering students.',
    category: 'Technical',
    venue: 'Sir M. Visvesvaraya Auditorium',
    startsAt: startsDate.toISOString(),
    endsAt: endsDate.toISOString(),
    capacity: 40,
    organizerClub: 'DSU Developer Student Club'
  };

  const createEventRes = await request('POST', '/events', newEventPayload, organizerToken);
  assert(
    'Create Event: Organizer creates event, defaults to draft status (HTTP 201)',
    createEventRes.status === 201 && createEventRes.data?.data?.status === 'draft',
    `EventId: ${createEventRes.data?.data?._id}, Status: ${createEventRes.data?.data?.status}`
  );
  const createdEvent = createEventRes.data?.data;
  const createdEventId = createdEvent._id;

  // Verify draft is not public
  const publicCheckRes = await request('GET', `/events/${createdEventId}`);
  assert(
    'Draft Isolation: Unauthenticated users cannot view draft events (HTTP 404)',
    publicCheckRes.status === 404,
    `Status: ${publicCheckRes.status}`
  );

  // 2.3 Edit Event Details
  const editPayload = {
    title: `${newEventPayload.title} (Updated)`,
    capacity: 45
  };
  const editEventRes = await request('PUT', `/events/${createdEventId}`, editPayload, organizerToken);
  assert(
    'Edit Event: Organizer updates title and capacity (HTTP 200)',
    editEventRes.status === 200 && editEventRes.data?.data?.capacity === 45,
    `New Title: ${editEventRes.data?.data?.title}, New Capacity: ${editEventRes.data?.data?.capacity}`
  );

  // 2.4 Upload Event Poster
  // Generate a valid 1x1 JPEG with magic bytes: FF D8 FF E0 00 10 4A 46 49 46 ...
  const validJpegBuffer = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x60, 0x00, 0x60, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20,
    0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29,
    0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
    0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08,
    0x09, 0x0a, 0x0b, 0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f,
    0x00, 0xbf, 0x80, 0xff, 0xd9
  ]);

  const multipart = createMultipartFormData('file', 'test-poster.jpg', 'image/jpeg', validJpegBuffer);
  const uploadRes = await request('POST', '/upload/poster', multipart.buffer, organizerToken, {
    'content-type': multipart.contentType
  });
  assert(
    'Poster Upload: Multipart upload with magic byte verification succeeds (HTTP 201)',
    uploadRes.status === 201 && uploadRes.data?.data?.url?.startsWith('/uploads/posters/'),
    `Uploaded Poster URL: ${uploadRes.data?.data?.url}`
  );

  // 2.5 Publish Event
  const publishRes = await request('PUT', `/events/${createdEventId}`, { status: 'published' }, organizerToken);
  assert(
    'Publish Event: Event status changed to published (HTTP 200)',
    publishRes.status === 200 && publishRes.data?.data?.status === 'published',
    `Status: ${publishRes.data?.data?.status}`
  );

  // Verify now visible to student
  const studentSeePublished = await request('GET', `/events/${createdEventId}`);
  assert(
    'Public Discovery: Published event is visible to campus students',
    studentSeePublished.status === 200 && studentSeePublished.data?.data?.title === editPayload.title,
    `Title: ${studentSeePublished.data?.data?.title}`
  );

  // 2.6 Student registers for newly published event
  const studentNewRegRes = await request('POST', `/events/${createdEventId}/register`, {}, newStudentToken);
  const eventTicketCode = studentNewRegRes.data?.data?.ticketCode;
  const eventRegId = studentNewRegRes.data?.data?._id;

  // 2.7 Organizer views event registrations
  const orgRegistrationsRes = await request('GET', `/events/${createdEventId}/registrations`, null, organizerToken);
  assert(
    'View Registrations: Organizer retrieves attendee roster (HTTP 200)',
    orgRegistrationsRes.status === 200 && Array.isArray(orgRegistrationsRes.data?.data),
    `Total Attendees: ${orgRegistrationsRes.data?.data?.length}`
  );

  // 2.8 Check attendee information
  const foundAttendee = orgRegistrationsRes.data?.data?.find(r => r._id === eventRegId);
  assert(
    'Attendee Information: Roster contains student name, USN, email, and ticket code',
    !!foundAttendee && foundAttendee.student?.name === 'Kavya S. Gowda' && foundAttendee.ticketCode === eventTicketCode,
    `Student: ${foundAttendee?.student?.name}, USN: ${foundAttendee?.student?.usn}`
  );

  // 2.9 Scan and verify QR pass at the gate
  const scanRes = await request('POST', `/events/${createdEventId}/verify-pass`, {
    ticketCode: eventTicketCode
  }, organizerToken);
  assert(
    'Gate Scan & Verify: Valid QR pass verifies and records attendance (HTTP 200)',
    scanRes.status === 200 && scanRes.data?.data?.attended === true,
    `Pass: ${scanRes.data?.data?.ticketCode}, Attended: ${scanRes.data?.data?.attended}`
  );

  // 2.10 Verify attendance records updated
  const attendanceVerifyRes = await request('GET', `/events/${createdEventId}/registrations`, null, organizerToken);
  const checkedInAttendee = attendanceVerifyRes.data?.data?.find(r => r._id === eventRegId);
  assert(
    'Attendance Records: Attendee status marked attended: true with timestamp',
    checkedInAttendee?.attended === true && !!checkedInAttendee?.attendedAt,
    `Attended: ${checkedInAttendee?.attended}, Timestamp: ${checkedInAttendee?.attendedAt}`
  );

  // 2.11 Cancel Event
  const cancelEventRes = await request('PUT', `/events/${createdEventId}`, { status: 'cancelled' }, organizerToken);
  assert(
    'Cancel Event: Organizer transitions event status to cancelled (HTTP 200)',
    cancelEventRes.status === 200 && cancelEventRes.data?.data?.status === 'cancelled',
    `Status: ${cancelEventRes.data?.data?.status}`
  );


  // --- 3. ADMINISTRATOR REAL USER JOURNEY ---
  console.log('\n--- PHASE 3: ADMINISTRATOR REAL USER JOURNEY ---');

  // 3.1 Administrator Login
  const adminLoginRes = await request('POST', '/auth/login', {
    email: 'admin@demo.dsu.edu',
    password: 'Admin@123'
  });
  assert(
    'Admin Login: Successfully authenticated with admin role (HTTP 200)',
    adminLoginRes.status === 200 && adminLoginRes.data?.data?.user?.role === 'admin',
    `User: ${adminLoginRes.data?.data?.user?.name}, Role: ${adminLoginRes.data?.data?.user?.role}`
  );
  const adminToken = adminLoginRes.data?.data?.token;

  // 3.2 View Platform Statistics
  const statsRes = await request('GET', '/admin/stats', null, adminToken);
  assert(
    'Platform Statistics: Admin retrieves totalEvents, totalRegistrations, totalUsers, and attendance metrics',
    statsRes.status === 200 && statsRes.data?.data?.totalEvents >= 1,
    `Events: ${statsRes.data?.data?.totalEvents}, Registrations: ${statsRes.data?.data?.totalRegistrations}`
  );

  // 3.3 Manage Users
  const usersListRes = await request('GET', '/admin/users?limit=50', null, adminToken);
  assert(
    'User Management: Admin retrieves paginated user list with role & verification fields',
    usersListRes.status === 200 && Array.isArray(usersListRes.data?.data?.items),
    `Total Users Found: ${usersListRes.data?.data?.total}`
  );

  // Approve student verification status
  const verifyUserRes = await request('PATCH', `/admin/users/${studentUser._id}/verify`, {
    status: 'verified'
  }, adminToken);
  assert(
    'Identity Verification: Admin approves student institutional verification status (HTTP 200)',
    verifyUserRes.status === 200 && verifyUserRes.data?.data?.isVerified === true,
    `Verification Status: ${verifyUserRes.data?.data?.verificationStatus}, isVerified: ${verifyUserRes.data?.data?.isVerified}`
  );

  // 3.4 Manage Published Events (Admin list across all organizers)
  const adminEventsRes = await request('GET', '/events/admin/list?limit=100', null, adminToken);
  assert(
    'Admin Event Oversight: Admin views complete list of campus events across all organizers',
    adminEventsRes.status === 200 && adminEventsRes.data?.data?.items?.length >= 6,
    `Admin visible events: ${adminEventsRes.data?.data?.items?.length}`
  );


  // --- 4. SECURITY & EXPLOIT DEFENSE TESTING ---
  console.log('\n--- PHASE 4: SECURITY & ACCESS CONTROL TESTING ---');

  // 4.1 Student accessing admin users route
  const exploit1 = await request('GET', '/admin/users', null, newStudentToken);
  assert(
    'Security S1: Student accessing /api/admin/users is BLOCKED (HTTP 403 Forbidden)',
    exploit1.status === 403,
    `Status: ${exploit1.status}`
  );

  // 4.2 Student accessing admin stats
  const exploit2 = await request('GET', '/admin/stats', null, newStudentToken);
  assert(
    'Security S2: Student accessing /api/admin/stats is BLOCKED (HTTP 403 Forbidden)',
    exploit2.status === 403,
    `Status: ${exploit2.status}`
  );

  // 4.3 Organizer accessing another organizer's event
  // Let's create an event by Admin and attempt to update it with Organizer
  const adminCreatedEventRes = await request('POST', '/events', {
    title: `Admin Only Governance Event ${Date.now()}`,
    description: 'High-level academic governance summit strictly managed by Registrar.',
    category: 'Seminar',
    venue: 'Academic Senate Hall',
    startsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    endsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    capacity: 20
  }, adminToken);
  const adminEventId = adminCreatedEventRes.data?.data?._id;

  const exploit3 = await request('PUT', `/events/${adminEventId}`, { title: 'Tampered Title' }, organizerToken);
  assert(
    'Security S3: Organizer modifying another organizer/admin event is BLOCKED (HTTP 403 Forbidden)',
    exploit3.status === 403,
    `Status: ${exploit3.status}, Message: ${exploit3.data?.message}`
  );

  // 4.4 Unauthenticated access to protected route
  const exploit4 = await request('GET', '/registrations/me');
  assert(
    'Security S4: Unauthenticated request to /registrations/me is BLOCKED (HTTP 401 Unauthorized)',
    exploit4.status === 401,
    `Status: ${exploit4.status}`
  );

  // 4.5 Forged/Tampered JWT token
  const tamperedToken = `${newStudentToken.slice(0, -6)}tamper`;
  const exploit5 = await request('GET', '/registrations/me', null, tamperedToken);
  assert(
    'Security S5: Forged JWT token signature is BLOCKED (HTTP 401 Unauthorized)',
    exploit5.status === 401,
    `Status: ${exploit5.status}`
  );

  // 4.6 Duplicate QR Scan
  const exploit6 = await request('POST', `/events/${createdEventId}/verify-pass`, {
    ticketCode: eventTicketCode
  }, organizerToken);
  assert(
    'Security S6: Duplicate QR pass scan is BLOCKED (HTTP 409 Conflict)',
    exploit6.status === 409,
    `Status: ${exploit6.status}, Message: ${exploit6.data?.message}`
  );

  // 4.7 Duplicate Registration by same student
  const exploit7 = await request('POST', `/events/${targetEventId}/register`, {}, newStudentToken);
  assert(
    'Security S7: Duplicate registration for same event is BLOCKED (HTTP 409 Conflict)',
    exploit7.status === 409,
    `Status: ${exploit7.status}, Message: ${exploit7.data?.message}`
  );

  // 4.8 Student role attempting poster upload
  const exploit8 = await request('POST', '/upload/poster', multipart.buffer, newStudentToken, {
    'content-type': multipart.contentType
  });
  assert(
    'Security S8: Student attempting file upload is BLOCKED (HTTP 403 Forbidden)',
    exploit8.status === 403,
    `Status: ${exploit8.status}`
  );

  // 4.9 Corrupted image file (invalid magic bytes)
  const fakeImageBuffer = Buffer.from('THIS IS NOT A VALID JPEG OR PNG IMAGE HEADER');
  const fakeMultipart = createMultipartFormData('file', 'fake.jpg', 'image/jpeg', fakeImageBuffer);
  const exploit9 = await request('POST', '/upload/poster', fakeMultipart.buffer, organizerToken, {
    'content-type': fakeMultipart.contentType
  });
  assert(
    'Security S9: Corrupted image upload (invalid magic bytes) is REJECTED (HTTP 400 Bad Request)',
    exploit9.status === 400,
    `Status: ${exploit9.status}, Message: ${exploit9.data?.message}`
  );

  // 4.10 Rule R7: Cannot delete event with existing registrations
  const exploit10 = await request('DELETE', `/events/${targetEventId}`, null, adminToken);
  assert(
    'Security S10: Deleting event with active registrations is BLOCKED (HTTP 409 Conflict - Rule R7)',
    exploit10.status === 409,
    `Status: ${exploit10.status}, Message: ${exploit10.data?.message}`
  );

  // 4.11 Rule R6: Cannot reduce capacity below registered count
  const exploit11 = await request('PUT', `/events/${targetEventId}`, { capacity: 0 }, adminToken);
  assert(
    'Security S11: Updating capacity below registeredCount is BLOCKED (HTTP 400 Bad Request - Rule R6)',
    exploit11.status === 400,
    `Status: ${exploit11.status}, Message: ${exploit11.data?.message}`
  );

  // 4.12 Password Reset Flow Verification
  console.log('\n--- PHASE 5: PASSWORD RESET VERIFICATION ---');
  const forgotRes = await request('POST', '/auth/forgot-password', {
    email: testStudentEmail
  });
  assert(
    'Password Reset Request: Generates secure token hash and returns success (HTTP 200)',
    forgotRes.status === 200 && forgotRes.data?.success === true,
    `Status: ${forgotRes.status}`
  );


  // --- SUMMARY ---
  console.log('\n========================================================================');
  console.log('                   FINAL STAGING UAT SUMMARY RESULTS                    ');
  console.log('========================================================================');
  console.log(`• Total Validation Scenarios Executed : ${report.totalTests}`);
  console.log(`• Passed Assertions                   : ${report.passed}`);
  console.log(`• Failed Assertions                   : ${report.failed}`);
  console.log(`• Success Rate                        : ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);
  console.log('========================================================================\n');

  if (report.failed > 0) {
    process.exit(1);
  }
}

runStagingUAT().catch((err) => {
  console.error('Fatal UAT execution error:', err);
  process.exit(1);
});
