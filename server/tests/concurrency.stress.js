import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Event } from '../src/models/Event.js';
import { Registration } from '../src/models/Registration.js';
import { User } from '../src/models/User.js';
import { registerForEvent } from '../src/modules/registrations/registrations.service.js';

async function runConcurrencyStressTest() {
  console.log('===============================================================');
  console.log(' DSU CAMPUS EVENTS — HIGH CONCURRENCY ATOMIC RESERVATION TEST');
  console.log(' Target: 500 simultaneous requests on 50 available seats');
  console.log('===============================================================\n');

  // 1. Initialize dedicated isolated test database
  console.log('[Setup] Starting isolated test MongoDB engine...');
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  console.log('[Setup] Isolated test database online.');

  try {
    // 2. Provision Organizer & Event
    const organizer = await User.create({
      name: 'Faculty Coordinator',
      email: 'coordinator@dsu.edu.in',
      passwordHash: 'dummy_hash_for_test',
      role: 'organizer',
      department: 'Computer Science'
    });

    const eventCapacity = 50;
    const testEvent = await Event.create({
      title: 'Flagship University Hackathon 2026',
      description: 'Annual campus hackathon with strictly capped team capacity of 50 seats.',
      category: 'Technical',
      venue: 'Sir M. Visvesvaraya Auditorium',
      startsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in future
      endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      capacity: eventCapacity,
      registeredCount: 0,
      status: 'published',
      createdBy: organizer._id,
      organizerClub: 'DSU Developer Student Club'
    });

    // 3. Provision 500 distinct Student accounts in bulk
    const totalContenders = 500;
    console.log(`[Setup] Provisioning ${totalContenders} distinct verified student accounts...`);
    const studentDocs = [];
    for (let i = 1; i <= totalContenders; i++) {
      studentDocs.push({
        name: `DSU Applicant ${i}`,
        email: `student_applicant_${i}_${Date.now()}@dsu.edu.in`,
        passwordHash: 'dummy_hash',
        role: 'student',
        usn: `1DS22CS${String(i).padStart(4, '0')}`,
        rollNumber: `1DS22CS${String(i).padStart(4, '0')}`,
        department: 'School of Engineering'
      });
    }
    const createdStudents = await User.insertMany(studentDocs);
    console.log(`[Setup] Created ${createdStudents.length} student records.`);

    // 4. Concurrently fire 500 simultaneous registration requests
    console.log(`\n[Execution] Sending ${totalContenders} simultaneous registration requests...`);
    const startTime = Date.now();

    const registrationPromises = createdStudents.map((student) =>
      registerForEvent(testEvent._id, student._id)
    );

    const outcomes = await Promise.allSettled(registrationPromises);
    const durationMs = Date.now() - startTime;

    // 5. Analyze Outcomes
    const successful = outcomes.filter((o) => o.status === 'fulfilled');
    const rejected = outcomes.filter((o) => o.status === 'rejected');

    const rejectionReasons = {};
    for (const rej of rejected) {
      const msg = rej.reason?.message || String(rej.reason);
      rejectionReasons[msg] = (rejectionReasons[msg] || 0) + 1;
    }

    // 6. Inspect Database Post-Test State
    const refreshedEvent = await Event.findById(testEvent._id);
    const allDbRegistrations = await Registration.find({
      event: testEvent._id,
      status: 'registered'
    });
    const totalDbRegistrations = allDbRegistrations.length;

    // Check uniqueness of registered students
    const uniqueStudentIds = new Set(allDbRegistrations.map((r) => String(r.student)));

    console.log('\n===============================================================');
    console.log(' CONCURRENCY TEST RESULTS & INTEGRITY METRICS');
    console.log('===============================================================');
    console.log(`• Total Requests Dispatched    : ${totalContenders}`);
    console.log(`• Configured Event Capacity    : ${eventCapacity}`);
    console.log(`• Total Duration               : ${durationMs} ms`);
    console.log(`• Throughput                   : ${Math.round((totalContenders / durationMs) * 1000)} requests/sec`);
    console.log(`• Successful Registrations (HTTP 201) : ${successful.length}`);
    console.log(`• Rejected Registrations (HTTP 409)   : ${rejected.length}`);
    console.log(`• Rejection Breakdown          :`, rejectionReasons);
    console.log(`• Database registeredCount     : ${refreshedEvent.registeredCount}`);
    console.log(`• Total DB Registration Records: ${totalDbRegistrations}`);
    console.log(`• Unique Students Registered   : ${uniqueStudentIds.size}`);
    console.log(`• Overbookings Observed        : ${Math.max(0, refreshedEvent.registeredCount - eventCapacity)}`);
    console.log(`• Duplicate Student Passes     : ${totalDbRegistrations - uniqueStudentIds.size}`);
    console.log('===============================================================\n');

    // 7. Rigorous Verification Assertions
    const errors = [];
    if (successful.length !== eventCapacity) {
      errors.push(`FAIL: Expected exactly ${eventCapacity} successes, got ${successful.length}`);
    }
    if (rejected.length !== (totalContenders - eventCapacity)) {
      errors.push(`FAIL: Expected exactly ${totalContenders - eventCapacity} rejections, got ${rejected.length}`);
    }
    if (refreshedEvent.registeredCount !== eventCapacity) {
      errors.push(`FAIL: Event.registeredCount is ${refreshedEvent.registeredCount}, expected ${eventCapacity}`);
    }
    if (totalDbRegistrations !== eventCapacity) {
      errors.push(`FAIL: Total DB registrations is ${totalDbRegistrations}, expected ${eventCapacity}`);
    }
    if (uniqueStudentIds.size !== eventCapacity) {
      errors.push(`FAIL: Unique student IDs is ${uniqueStudentIds.size}, expected ${eventCapacity}`);
    }

    if (errors.length > 0) {
      console.error('CONCURRENCY TEST FAILED:');
      errors.forEach((e) => console.error(`  ✖ ${e}`));
      process.exit(1);
    } else {
      console.log('✔ VERIFICATION PASSED:');
      console.log('  ✔ Exactly 50 successful registrations.');
      console.log('  ✔ Zero overbookings (registeredCount capped strictly at 50).');
      console.log('  ✔ Zero duplicate registrations (50 unique students).');
      console.log('  ✔ Database seat counts remain 100% correct.');
      console.log('  ✔ Remaining capacity is 0 (accurate).');
      console.log('\nResult: PASSED (Atomic concurrency engine certified).');
      process.exit(0);
    }
  } finally {
    await mongoose.disconnect();
    await mongod.stop();
  }
}

runConcurrencyStressTest().catch((err) => {
  console.error('Fatal concurrency runner error:', err);
  process.exit(1);
});

