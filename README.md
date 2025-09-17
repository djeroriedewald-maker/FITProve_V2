# FITProve v2

A modern fitness/workout Progressive Web App (PWA) focused on tracking workouts and personal achievements.


## 🚀 Features

- **PWA Support:** Install as a native app, works offline
- **Workout Library:** Version-controlled workout database
- **Session Management:** Start, log, and complete workout sessions
- **Achievements:** Track progress with badges (incl. progressiebar)
- **Smart Prefill:** Quick log entry based on previous sessions

## 🏅 Badges & Progressie

Badges worden opgeslagen in de `badges` tabel. Sommige badges hebben een progressiebar. Dit werkt als volgt:

- **Badges zonder progressiebar:**
   - Hebben `criteria = NULL`.
   - Worden direct toegekend bij het behalen van de actie.
- **Badges met progressiebar:**
   - Hebben een JSON string in de kolom `criteria`, bijvoorbeeld: `{ "target": 5, "type": "likes_given" }`.
   - De frontend toont een progressiebar als er een badge_progress record is met een target > 0.
   - De backend moet bijhouden hoeveel progressie de gebruiker heeft voor deze badge.

**Voorbeeld badge met progressie:**

```sql
INSERT INTO badges (id, name, ..., criteria) VALUES (
   gen_random_uuid(), 'Motivator', 'Geef 5 likes', ..., '{"target":5,"type":"likes_given"}'
);
```

**Let op:**
- Voeg alleen een progressie-criteria toe aan badges waar een voortgangsbalk logisch is (zoals streaks, aantal volgers, aantal likes, etc).
- De frontend toont alleen een progressiebar als er een target in criteria staat én er een badge_progress record is voor de gebruiker.

## 🛠 Tech Stack

- **Frontend:** Vite + React + TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (coming soon)
- **Backend:** Supabase (coming soon)
- **Testing:** Vitest + Testing Library
- **PWA:** Vite PWA Plugin
- **CI/CD:** GitHub Actions

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/fitprove_v2.git
   cd fitprove_v2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Update .env with your Supabase credentials
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## 🏗 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - Check TypeScript types
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run format` - Format code with Prettier
- `npm run preview` - Preview production build locally

## 📱 PWA Support

FITProve v2 is designed as a Progressive Web App, offering:
- Offline functionality
- Installation on devices
- Background sync for workout logs
- Push notifications (coming soon)

## 🔐 Security

- All API calls use Supabase RLS policies
- No sensitive data stored in client bundles
- Secure authentication flow with Supabase Auth

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch
```

## 📝 Development Guidelines

- Follow TypeScript strict mode guidelines
- Write tests for critical features
- Use Conventional Commits
- Keep PR's focused and atomic
- Document new features and API changes

## 📚 Documentation

More detailed documentation will be available in the `/docs` directory (coming soon).

## 📄 License

MIT