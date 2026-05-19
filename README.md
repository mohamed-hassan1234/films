# StreamWave

StreamWave is a full-stack MERN streaming platform inspired by modern streaming UX without using Netflix branding, copy, images, videos, or copyrighted content. It includes public marketing, authentication, profile switching, browsing, search, details pages, watch progress, watchlist, video playback, and an admin dashboard for managing content and users.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: local MongoDB
- Auth: JWT and bcrypt
- Uploads: Multer for posters, banners, thumbnails, and videos
- API: REST

## Setup

1. Make sure MongoDB is running locally. MongoDB Compass can connect to:

```bash
mongodb://127.0.0.1:27017/streamwave
```

2. Create environment files:

```bash
cd server
copy .env.example .env
cd ../client
copy .env.example .env
```

3. Install dependencies:

```bash
cd server
npm install

cd ../client
npm install
```

4. Seed demo data:

```bash
cd server
npm run seed
```

Demo accounts:

- Admin: `admin@streamwave.test` / `password123`
- User: `user@streamwave.test` / `password123`

5. Run the apps:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

Open `http://localhost:5173`.

If another local app is already using port `5000` or `5173`, this project also works with the current local setup:

- API: `https://flim.atmaengi.com/api`
- Client: `http://localhost:5174`

For CORS, `server/.env` supports multiple comma-separated frontend origins in `CLIENT_URL`.

## API Documentation

Base URL: `https://flim.atmaengi.com/api`

Send protected requests with:

```http
Authorization: Bearer <jwt>
```

### Auth

- `POST /auth/register` - `{ name, email, password }`
- `POST /auth/login` - `{ email, password }`
- `GET /auth/me` - current user and profiles

### Profiles

- `GET /profiles`
- `POST /profiles` - `{ name, avatar, isKids }`
- `PUT /profiles/:id`
- `DELETE /profiles/:id`

### Movies

- `GET /movies?search=&genre=&year=&featured=&trending=&limit=`
- `GET /movies/:id`
- `POST /movies/admin` - admin, multipart form with `poster`, `banner`, `thumbnail`, `video`
- `PUT /movies/admin/:id` - admin, multipart form
- `DELETE /movies/admin/:id` - admin

Movie fields include `title`, `description`, `genres`, `cast`, `duration`, `releaseYear`, `rating`, `maturityLevel`, `featured`, `trending`, and `trendingRank`.

### Series

- `GET /series?search=&genre=&featured=&trending=&limit=`
- `GET /series/:id`
- `POST /series/admin` - admin, multipart form
- `PUT /series/admin/:id` - admin, multipart form
- `DELETE /series/admin/:id` - admin
- `POST /series/admin/:id/seasons` - admin, `{ seasonNumber, title }`
- `POST /series/admin/:id/episodes` - admin, multipart form with `thumbnail`, `video`

### Genres

- `GET /genres`
- `POST /genres/admin` - admin
- `PUT /genres/admin/:id` - admin
- `DELETE /genres/admin/:id` - admin

### Watchlist

- `GET /watchlist`
- `POST /watchlist/:contentId` - `{ contentType: "Movie" | "Series", profile }`
- `DELETE /watchlist/:contentId`

### Watch History

- `POST /history/progress` - `{ contentId, contentType, profile, progress, duration }`
- `GET /history/continue-watching`

### Admin

- `GET /admin/stats`
- `GET /admin/users`
- `PUT /admin/users/:id`
- `DELETE /admin/users/:id`
- `GET /admin/reports`

## Project Structure

```text
client/
  src/
    admin/
    components/
    context/
    pages/
    services/
    utils/
server/
  config/
  controllers/
  middleware/
  models/
  routes/
  uploads/
  utils/
  server.js
```

## Notes

- Uploaded media is served from `server/uploads`.
- Seeded posters and banners use neutral placeholder media with original fictional titles.
- Replace `JWT_SECRET` in production-style testing with a long random value.
