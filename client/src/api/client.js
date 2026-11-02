import axios from 'axios';
import {
  getLocalEvents,
  saveLocalEvent,
  updateLocalEvent,
  deleteLocalEvent,
  getLocalRegistrations,
  saveLocalRegistration,
  cancelLocalRegistration,
  getEventAttendees,
  markLocalAttendance,
  DEMO_CAMPUS_USERS
} from './demoData.js';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('dsu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error('Failed reading token from localStorage', err);
  }
  return config;
});

// Response interceptor with graceful offline & development fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    const method = (originalRequest?.method || 'get').toLowerCase();

    // Check if network error or connection refused (backend server offline)
    const isNetworkError =
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('Network Error');

    if (isNetworkError) {
      console.info(
        `%c[DSU Events] Backend offline on port 5000. Engaging transparent local demo fallback for: ${method.toUpperCase()} ${url}`,
        'color: #0071E3; font-weight: bold;'
      );

      // 1. GET /events (public event discovery)
      if ((url === '/events' || url.startsWith('/events?')) && method === 'get') {
        const params = originalRequest.params || {};
        let items = getLocalEvents().filter((e) => e.status === 'published');

        if (params.search) {
          const q = params.search.toLowerCase();
          items = items.filter(
            (e) =>
              e.title.toLowerCase().includes(q) ||
              e.description.toLowerCase().includes(q) ||
              e.venue.toLowerCase().includes(q)
          );
        }

        if (params.category && params.category !== 'All') {
          items = items.filter((e) => e.category.toLowerCase() === params.category.toLowerCase());
        }

        if (params.sort === 'popular') {
          items.sort((a, b) => b.registeredCount - a.registeredCount);
        } else if (params.sort === 'latest') {
          items.sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
        } else {
          // soonest
          items.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt));
        }

        const limit = params.limit || 9;
        const page = params.page || 1;
        const skip = (page - 1) * limit;

        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              items: items.slice(skip, skip + limit),
              total: items.length,
              page,
              limit,
              totalPages: Math.max(1, Math.ceil(items.length / limit))
            }
          },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: originalRequest
        });
      }

      // 2. GET /events/:id (event details)
      const eventDetailMatch = url.match(/^\/events\/([a-zA-Z0-9_-]+)$/);
      if (eventDetailMatch && method === 'get') {
        const eventId = eventDetailMatch[1];
        const events = getLocalEvents();
        const event = events.find((e) => e._id === eventId) || events[0];
        const myRegs = getLocalRegistrations();
        const myRegistration = myRegs.find((r) => r.event?._id === event._id && r.status === 'registered');

        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              ...event,
              myRegistration: myRegistration
                ? {
                    _id: myRegistration._id,
                    ticketCode: myRegistration.ticketCode,
                    status: myRegistration.status,
                    attended: myRegistration.attended
                  }
                : null
            }
          },
          status: 200,
          config: originalRequest
        });
      }

      // 3. POST /events (create event)
      if (url === '/events' && method === 'post') {
        const body = JSON.parse(originalRequest.data || '{}');
        const created = saveLocalEvent(body);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Event draft created successfully',
            data: created
          },
          status: 201,
          config: originalRequest
        });
      }

      // 4. PUT /events/:id (update event)
      if (eventDetailMatch && method === 'put') {
        const eventId = eventDetailMatch[1];
        const body = JSON.parse(originalRequest.data || '{}');
        const updated = updateLocalEvent(eventId, body);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Event updated successfully',
            data: updated
          },
          status: 200,
          config: originalRequest
        });
      }

      // 5. DELETE /events/:id (delete event)
      if (eventDetailMatch && method === 'delete') {
        const eventId = eventDetailMatch[1];
        deleteLocalEvent(eventId);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Event deleted successfully'
          },
          status: 200,
          config: originalRequest
        });
      }

      // 6. POST /events/:id/register (event registration)
      const registerMatch = url.match(/^\/events\/([a-zA-Z0-9_-]+)\/register$/);
      if (registerMatch && method === 'post') {
        const eventId = registerMatch[1];
        const newReg = saveLocalRegistration(eventId);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Seat successfully reserved in demo environment',
            data: newReg
          },
          status: 200,
          config: originalRequest
        });
      }

      // 7. DELETE /events/:id/register (cancel registration)
      if (registerMatch && method === 'delete') {
        const eventId = registerMatch[1];
        cancelLocalRegistration(eventId);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Registration cancelled'
          },
          status: 200,
          config: originalRequest
        });
      }

      // 8. GET /events/:id/registrations (attendance roster)
      const attendeesMatch = url.match(/^\/events\/([a-zA-Z0-9_-]+)\/registrations$/);
      if (attendeesMatch && method === 'get') {
        const eventId = attendeesMatch[1];
        const attendees = getEventAttendees(eventId);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: attendees
          },
          status: 200,
          config: originalRequest
        });
      }

      // 9. PATCH /events/:id/registrations/:regId/attendance (mark attendance)
      const attendancePatchMatch = url.match(/^\/events\/([a-zA-Z0-9_-]+)\/registrations\/([a-zA-Z0-9_-]+)\/attendance$/);
      if (attendancePatchMatch && method === 'patch') {
        const eventId = attendancePatchMatch[1];
        const regId = attendancePatchMatch[2];
        markLocalAttendance(eventId, regId);
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            message: 'Attendance recorded'
          },
          status: 200,
          config: originalRequest
        });
      }

      // 10. GET /registrations/me (student passes)
      if (url.includes('/registrations/me')) {
        const passes = getLocalRegistrations();
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: passes
          },
          status: 200,
          config: originalRequest
        });
      }

      // 11. POST /auth/login (mock login for local test access)
      if (url.includes('/auth/login') && method === 'post') {
        const body = JSON.parse(originalRequest.data || '{}');
        const email = (body.email || '').toLowerCase();
        let role = 'student';
        let name = 'Arjun Sharma';

        if (email.includes('admin')) {
          role = 'admin';
          name = 'Dr. Ramesh Kumar (Admin)';
        } else if (email.includes('organizer')) {
          role = 'organizer';
          name = 'Vikram Joshi (Developer Club)';
        } else if (body.name) {
          name = body.name;
        }

        const mockUser = {
          _id: `user-${Date.now()}`,
          name,
          email: body.email || 'student1@example.test',
          role,
          usn: '1DS22CS042',
          department: 'Computer Science & Engineering'
        };

        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              token: `mock-jwt-token-${Date.now()}`,
              user: mockUser
            }
          },
          status: 200,
          config: originalRequest
        });
      }

      // 12. POST /auth/register
      if (url.includes('/auth/register') && method === 'post') {
        const body = JSON.parse(originalRequest.data || '{}');
        const mockUser = {
          _id: `user-${Date.now()}`,
          name: body.name || 'New DSU Student',
          email: body.email,
          role: 'student',
          usn: body.usn || body.rollNumber || '1DS24UG001',
          department: body.department || 'Undergraduate Studies'
        };
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              token: `mock-jwt-token-${Date.now()}`,
              user: mockUser
            }
          },
          status: 200,
          config: originalRequest
        });
      }

      // 13. GET /auth/me
      if (url.includes('/auth/me')) {
        const storedUser = localStorage.getItem('dsu_user');
        const user = storedUser
          ? JSON.parse(storedUser)
          : {
              _id: 'student-demo-id',
              name: 'Arjun Sharma',
              email: 'student1@example.test',
              role: 'student',
              usn: '1DS22CS042',
              department: 'Computer Science & Engineering'
            };
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: user
          },
          status: 200,
          config: originalRequest
        });
      }

      // 14. GET /admin/stats
      if (url.includes('/admin/stats')) {
        const allEvts = getLocalEvents();
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              totalEvents: allEvts.length,
              publishedEvents: allEvts.filter((e) => e.status === 'published').length,
              upcomingEvents: allEvts.length - 1,
              totalRegistrations: allEvts.reduce((sum, e) => sum + (e.registeredCount || 0), 0),
              attendanceRate: 86
            }
          },
          status: 200,
          config: originalRequest
        });
      }

      // 15. GET /events/admin/list
      if (url.includes('/events/admin/list')) {
        const allEvts = getLocalEvents();
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              items: allEvts,
              total: allEvts.length,
              page: 1,
              totalPages: 1
            }
          },
          status: 200,
          config: originalRequest
        });
      }

      // 16. GET /admin/users
      if (url.includes('/admin/users')) {
        return Promise.resolve({
          data: {
            success: true,
            _isDemoFallback: true,
            data: {
              items: DEMO_CAMPUS_USERS,
              total: DEMO_CAMPUS_USERS.length
            }
          },
          status: 200,
          config: originalRequest
        });
      }
    }

    // Default error handling for real HTTP responses (e.g. 401 unauthorized)
    if (error.response?.status === 401) {
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('dsu_token');
        localStorage.removeItem('dsu_user');
      }
    }

    return Promise.reject(error);
  }
);
