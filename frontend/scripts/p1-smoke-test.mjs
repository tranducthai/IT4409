const baseUrl = process.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const password = process.env.P1_TEST_PASSWORD ?? 'Password123!';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { status: response.status, data };
}

async function login(email) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
}

function printCheck(label, result) {
  const payload = typeof result.data === 'object' ? JSON.stringify(result.data) : String(result.data ?? '');
  console.log(`${label}: ${result.status} ${payload}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

(async () => {
  let tempUserId = null;
  const teacher = await login('demo.teacher.linh@7study.local');
  const student = await login('demo.student.anh@7study.local');

  assert(teacher.status >= 200 && teacher.status < 300, 'Teacher login failed');
  assert(student.status >= 200 && student.status < 300, 'Student login failed');

  const teacherClasses = await request('/class-members/me/teacher-classes', {
    headers: { Authorization: `Bearer ${teacher.data.access_token}` },
  });
  const studentClasses = await request('/class-members/me/student-classes', {
    headers: { Authorization: `Bearer ${student.data.access_token}` },
  });

  assert(Array.isArray(teacherClasses.data), 'Teacher class list is not an array');
  assert(Array.isArray(studentClasses.data), 'Student class list is not an array');
  assert(teacherClasses.data.length > 0, 'Teacher has no classes');
  assert(studentClasses.data.length > 0, 'Student has no classes');

  const allowedClass = studentClasses.data[0];
  const lessonContents = await request(`/lesson-contents/class/${allowedClass.id}`, {
    headers: { Authorization: `Bearer ${student.data.access_token}` },
  });

  assert(lessonContents.status === 200, 'Scoped lesson contents request failed');
  assert(Array.isArray(lessonContents.data), 'Scoped lesson contents response is not an array');

  const tempUserEmail = `temp.student.p1.${Date.now()}@example.com`;
  const tempRegister = await request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Temp P1 Student',
      email: tempUserEmail,
      password,
      role: 'STUDENT',
    }),
  });

  assert(tempRegister.status === 201, 'Temporary student registration failed');

  tempUserId = tempRegister.data.user.id;
  const tempStudentToken = tempRegister.data.access_token;
  const forbiddenLessonContents = await request(`/lesson-contents/class/${allowedClass.id}`, {
    headers: { Authorization: `Bearer ${tempStudentToken}` },
  });

  assert(forbiddenLessonContents.status === 403, 'Expected lesson-content access to be denied for a non-member student');

  const studentDirectAdd = await request('/class-members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tempStudentToken}`,
    },
    body: JSON.stringify({
      class_id: allowedClass.id,
      user_id: tempRegister.data.user.id,
      role: 'STUDENT',
      status: 'ACTIVE',
    }),
  });

  assert(studentDirectAdd.status === 403, 'Expected student direct-add to be denied');

  const teacherDirectAdd = await request('/class-members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${teacher.data.access_token}`,
    },
    body: JSON.stringify({
      class_id: allowedClass.id,
      user_id: tempRegister.data.user.id,
      role: 'STUDENT',
      status: 'ACTIVE',
    }),
  });

  assert(teacherDirectAdd.status === 201, 'Expected teacher direct-add to succeed');

  printCheck('TEACHER_CLASSES', teacherClasses);
  printCheck('STUDENT_CLASSES', studentClasses);
  printCheck('LESSON_CONTENTS_ALLOWED', lessonContents);
  printCheck('LESSON_CONTENTS_FORBIDDEN', forbiddenLessonContents);
  printCheck('STUDENT_DIRECT_ADD', studentDirectAdd);
  printCheck('TEACHER_DIRECT_ADD', teacherDirectAdd);
  console.log('P1 smoke test passed');
})().catch((error) => {
  console.error('P1 smoke test failed');
  console.error(error?.message ?? error);
  process.exit(1);
}).finally(async () => {
  try {
    if (!tempUserId) {
      return;
    }

    const admin = await login('demo.admin@7study.local');
    if (admin.status < 200 || admin.status >= 300) {
      return;
    }

    await request(`/users/${tempUserId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${admin.data.access_token}` },
    });
  } catch {
    // Best-effort cleanup only.
  }
});
