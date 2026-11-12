# K-Burger TIC

REST API (Node.js + Express + Sequelize + PostgreSQL + JWT + bcryptjs) y frontend (React + Vite + Tailwind CSS).

## 1) Backend (`/backend`)
```bash
cd backend
cp .env.example .env      # completar credenciales de PostgreSQL y JWT_SECRET
npm install
npm run seed              # recrea tablas y carga 10 platos, 3 usuarios y 4 pedidos
npm run dev               # http://localhost:3000
```
Requiere una base vacía creada en PostgreSQL (por defecto `kburger_tic`).

| Rol     | Email                 | Contraseña  |
|---------|-----------------------|-------------|
| Admin   | admin@kburger.tic     | Admin1234   |
| Cliente | cliente@kburger.tic   | Cliente1234 |

## 2) Frontend (`/frontend`)
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm install
npm run dev               # http://localhost:5173
```

## Endpoints
| Método y ruta | Acceso |
|---|---|
| POST /auth/register, POST /auth/login | Público |
| GET /auth/me | Token |
| GET /platos (?tipo=), GET /platos/:id | Público |
| POST /platos, PUT /platos/:id, DELETE /platos/:id | Admin |
| POST /pedidos, GET /pedidos/mis-pedidos | Token |
| GET /pedidos, PUT /pedidos/:id/estado, DELETE /pedidos/:id, GET /pedidos/dashboard | Admin |

Todas las respuestas son JSON con la clave `message`.
