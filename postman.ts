/**
 * =====================================================
 *  POSTMAN - COLECCIÓN DE PRUEBAS
 *  Base URL: http://localhost:4000/api
 * =====================================================
 *
 * ORDEN RECOMENDADO DE CREACIÓN:
 *  1. Roles
 *  2. Companies
 *  3. Departments
 *  4. Agents
 *  5. People
 *  6. Users
 *  7. Companions
 *  8. Visit Types
 *  9. Visits
 * 10. Visit Companions
 * =====================================================
 */

// ─────────────────────────────────────────────
// 1. ROLES  →  /api/roles
// ─────────────────────────────────────────────

const ROLES = {

  /** POST /api/roles */
  create: {
    name: "Administrador",
  },

  /** PATCH /api/roles/:id */
  update: {
    name: "Supervisor",
  },

  // GET  /api/roles          — sin body
  // GET  /api/roles/:id      — sin body
};


// ─────────────────────────────────────────────
// 2. COMPANIES  →  /api/companies
// ─────────────────────────────────────────────

const COMPANIES = {

  /** POST /api/companies */
  create: {
    name: "Acme S.A.",
  },

  /** PATCH /api/companies/:id */
  update: {
    name: "Acme International S.A.",
  },

  // GET  /api/companies       — sin body
  // GET  /api/companies/:id   — sin body
};


// ─────────────────────────────────────────────
// 3. DEPARTMENTS  →  /api/departments
// ─────────────────────────────────────────────

const DEPARTMENTS = {

  /** POST /api/departments */
  create: {
    name: "Seguridad",
    code: "SEG-01",
  },

  /** PATCH /api/departments/:id */
  update: {
    name: "Seguridad Industrial",
    code: "SEG-02",
  },

  // GET    /api/departments       — sin body
  // GET    /api/departments/:id   — sin body
  // DELETE /api/departments/:id   — sin body
};


// ─────────────────────────────────────────────
// 4. AGENTS  →  /api/agents
// ─────────────────────────────────────────────

const AGENTS = {

  /** POST /api/agents */
  create: {
    name: "Carlos Ramírez",
  },

  /** PATCH /api/agents/:id */
  update: {
    name: "Carlos R. Martínez",
  },

  // GET  /api/agents       — sin body
  // GET  /api/agents/:id   — sin body
};


// ─────────────────────────────────────────────
// 5. PEOPLE  →  /api/people
// ─────────────────────────────────────────────

const PEOPLE = {

  /** POST /api/people  (sin foto) */
  createBasic: {
    name: "Juan Pérez",
    document_number: "12345678",
    company_id: 1,
  },

  /** POST /api/people  (con foto y licencia) */
  createFull: {
    name: "María López",
    document_number: "87654321",
    company_id: 1,
    document_photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    license_number: "LIC-2024-001",
    license_photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  },

  /** PATCH /api/people/:id */
  update: {
    name: "Juan Pablo Pérez",
    company_id: 2,
  },

  // GET    /api/people       — sin body
  // GET    /api/people/:id   — sin body
  // DELETE /api/people/:id   — sin body
};


// ─────────────────────────────────────────────
// 6. USERS  →  /api/users
// ─────────────────────────────────────────────

const USERS = {

  /** POST /api/users
   *  Requiere: role_id y department_id existentes
   */
  create: {
    name: "Pedro González",
    username: "admin",
    password: "Password123!",
    role_id: 1,
    department_id: 1,
  },

  /** PATCH /api/users/:id */
  update: {
    name: "Pedro A. González",
    department_id: 2,
  },

  /** PATCH /api/users/:id  (cambiar contraseña) */
  updatePassword: {
    password: "NuevaPassword456!",
  },

  // GET  /api/users       — sin body
  // GET  /api/users/:id   — sin body
};


// ─────────────────────────────────────────────
// 7. COMPANIONS  →  /api/companions
// ─────────────────────────────────────────────

const COMPANIONS = {

  /** POST /api/companions  (básico) */
  createBasic: {
    full_name: "Luis Torres",
    document_number: "11223344",
  },

  /** POST /api/companions  (con licencia) */
  createFull: {
    full_name: "Ana Ruiz",
    document_number: "44332211",
    document_photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    license_number: "LIC-COMP-2024",
    license_photo: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  },

  /** PATCH /api/companions/:id */
  update: {
    full_name: "Luis Eduardo Torres",
    license_number: "LIC-COMP-2025",
  },

  // GET    /api/companions       — sin body
  // GET    /api/companions/:id   — sin body
  // DELETE /api/companions/:id   — sin body
};


// ─────────────────────────────────────────────
// 8. VISIT TYPES  →  /api/visit-types
// ─────────────────────────────────────────────

const VISIT_TYPES = {

  /** POST /api/visit-types */
  createVisita: {
    name: "Visita General",
  },

  /** POST /api/visit-types */
  createContratista: {
    name: "Contratista",
  },

  /** POST /api/visit-types */
  createProveedor: {
    name: "Proveedor",
  },

  /** PATCH /api/visit-types/:id */
  update: {
    name: "Visita Técnica",
  },

  // GET    /api/visit-types       — sin body
  // GET    /api/visit-types/:id   — sin body
  // DELETE /api/visit-types/:id   — sin body
};


// ─────────────────────────────────────────────
// 9. VISITS  →  /api/visits
// ─────────────────────────────────────────────

const VISITS = {

  /** POST /api/visits  (sin acompañante)
   *  Requiere: visit_status_id, visit_type_id, person_id,
   *            department_id y agent_id existentes
   */
  createSinAcompanante: {
    date: "2026-02-24",
    entry_time: "08:30:00",
    visit_status_id: 1,
    visit_type_id: 1,
    person_id: 1,
    department_id: 1,
    destination: "Oficina de Compras - Piso 3",
    responsible_person: "Roberto Silva",
    badge_number: "BADGE-001",
    has_companion: false,
    agent_id: 1,
  },

  /** POST /api/visits  (con acompañante) */
  createConAcompanante: {
    date: "2026-02-24",
    entry_time: "09:00:00",
    visit_status_id: 1,
    visit_type_id: 2,
    person_id: 2,
    department_id: 1,
    destination: "Sala de Reuniones B",
    responsible_person: "Laura Castro",
    badge_number: "BADGE-002",
    has_companion: true,
    agent_id: 1,
  },

  /** PATCH /api/visits/:id  (registrar salida) */
  registerExit: {
    exit_time: "17:00:00",
    visit_status_id: 2,
  },

  /** PATCH /api/visits/:id  (actualización completa) */
  updateFull: {
    date: "2026-02-25",
    entry_time: "10:00:00",
    exit_time: "15:00:00",
    visit_status_id: 2,
    visit_type_id: 1,
    person_id: 1,
    department_id: 2,
    destination: "Almacén Central",
    responsible_person: "Diego Morales",
    badge_number: "BADGE-003",
    has_companion: false,
    agent_id: 1,
  },

  // GET  /api/visits       — sin body
  // GET  /api/visits/:id   — sin body
};


// ─────────────────────────────────────────────
// 10. VISIT COMPANIONS  →  /api/visit-companions
// ─────────────────────────────────────────────

const VISIT_COMPANIONS = {

  /** POST /api/visit-companions
   *  Vincula un acompañante a una visita existente
   *  Requiere: visit_id y companion_id existentes
   */
  create: {
    visit_id: 1,
    companion_id: 1,
  },

  /** POST /api/visit-companions  (segundo acompañante) */
  createSecond: {
    visit_id: 1,
    companion_id: 2,
  },

  // GET    /api/visit-companions       — sin body
  // GET    /api/visit-companions/:id   — sin body
  // DELETE /api/visit-companions/:id   — sin body
};


// ─────────────────────────────────────────────
// EXPORT  (para uso en scripts de prueba si se necesita)
// ─────────────────────────────────────────────

export {
  ROLES,
  COMPANIES,
  DEPARTMENTS,
  AGENTS,
  PEOPLE,
  USERS,
  COMPANIONS,
  VISIT_TYPES,
  VISITS,
  VISIT_COMPANIONS,
};

/**
 * =====================================================
 *  REFERENCIA RÁPIDA DE ENDPOINTS
 * ─────────────────────────────────────────────────────
 *  BASE URL: http://localhost:4000/api
 * ─────────────────────────────────────────────────────
 *
 *  ROLES
 *    POST   /api/roles
 *    GET    /api/roles
 *    GET    /api/roles/:id
 *    PATCH  /api/roles/:id
 *
 *  COMPANIES
 *    POST   /api/companies
 *    GET    /api/companies
 *    GET    /api/companies/:id
 *    PATCH  /api/companies/:id
 *
 *  DEPARTMENTS
 *    POST   /api/departments
 *    GET    /api/departments
 *    GET    /api/departments/:id
 *    PATCH  /api/departments/:id
 *    DELETE /api/departments/:id
 *
 *  AGENTS
 *    POST   /api/agents
 *    GET    /api/agents
 *    GET    /api/agents/:id
 *    PATCH  /api/agents/:id
 *
 *  PEOPLE
 *    POST   /api/people
 *    GET    /api/people
 *    GET    /api/people/:id
 *    PATCH  /api/people/:id
 *    DELETE /api/people/:id
 *
 *  USERS
 *    POST   /api/users
 *    GET    /api/users
 *    GET    /api/users/:id
 *    PATCH  /api/users/:id
 *
 *  COMPANIONS
 *    POST   /api/companions
 *    GET    /api/companions
 *    GET    /api/companions/:id
 *    PATCH  /api/companions/:id
 *    DELETE /api/companions/:id
 *
 *  VISIT TYPES
 *    POST   /api/visit-types
 *    GET    /api/visit-types
 *    GET    /api/visit-types/:id
 *    PATCH  /api/visit-types/:id
 *    DELETE /api/visit-types/:id
 *
 *  VISITS
 *    POST   /api/visits
 *    GET    /api/visits
 *    GET    /api/visits/:id
 *    PATCH  /api/visits/:id
 *
 *  VISIT COMPANIONS
 *    POST   /api/visit-companions
 *    GET    /api/visit-companions
 *    GET    /api/visit-companions/:id
 *    DELETE /api/visit-companions/:id
 *
 * =====================================================
 */
