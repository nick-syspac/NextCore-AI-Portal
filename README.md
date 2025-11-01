# NextCore AI Portal# Next.js Web Portal - Installation & Setup



Modern Next.js web portal for the NextCore AI RTO SaaS platform.## Prerequisites

- Node.js 18+ and npm

## 🚀 Quick Start

## Quick Start

### Prerequisites

```bash

- Node.js 18+ cd /home/nick/work/NextCore-AI-Cloud/apps/web-portal

- npm or yarn

- NextCore AI Backend running (default: http://localhost:8000)# Install dependencies

npm install

### Installation

# Copy environment file

```bashcp .env.example .env.local

# Install dependencies

npm install# Run development server

npm run dev

# Copy environment file```

cp .env.example .env.local

The web portal will be available at **http://localhost:3000**

# Configure API endpoint

# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8000## Environment Configuration



# Start development serverEdit `.env.local`:

npm run dev```bash

```NEXT_PUBLIC_API_URL=http://localhost:8000

NEXT_PUBLIC_SITE_URL=http://localhost:3000

Visit [http://localhost:3000](http://localhost:3000)```



## 📁 Project Structure## Features Implemented



```### ✅ User Registration (`/register`)

├── src/- Full registration form with validation

│   ├── app/                    # Next.js App Router pages- Optional invitation token support

│   │   ├── dashboard/          # Multi-tenant dashboard- Automatic email verification on registration

│   │   ├── layout.tsx          # Root layout with providers- Password confirmation

│   │   └── page.tsx            # Landing page- Redirects to login after successful registration

│   ├── components/             # Reusable React components

│   │   └── providers.tsx       # React Query provider### ✅ User Login (`/login`)

│   └── lib/                    # Utilities and hooks- Username/password authentication

│       ├── api-client.ts       # Axios API client- Token-based session management

│       └── hooks/              # Custom React hooks- Success message after registration

│           ├── useEligibility.ts- Redirects to dashboard after login

│           ├── useCIR.ts

│           └── ...### ✅ Email Verification (`/verify-email/[token]`)

├── public/                     # Static assets- Automatic token verification

├── package.json- Visual feedback (loading, success, error states)

├── next.config.mjs- Auto-redirect to login after success

├── tailwind.config.ts

└── tsconfig.json### ✅ User Dashboard (`/dashboard`)

```- Protected route (requires authentication)

- Displays user's tenant memberships

## 🛠️ Development- Role-based UI (owner, admin, member, viewer)

- Logout functionality

### Available Scripts- Admin invitation link (for admins/owners)



```bash### ⏳ Coming Soon

npm run dev      # Start development server- Invitation acceptance page (`/accept-invitation/[token]`)

npm run build    # Build for production- Invitation creation form (`/invitations/create`)

npm run start    # Start production server- Tenant-specific dashboard (`/dashboard/[tenantSlug]`)

npm run lint     # Run ESLint- Profile management

```- Password reset flow



### Tech Stack## API Integration



- **Framework**: Next.js 14 with App RouterThe portal connects to your Django backend at `http://localhost:8000`:

- **Language**: TypeScript 5

- **Styling**: Tailwind CSS 3- `/api/users/register/` - User registration

- **State Management**: React Query (@tanstack/react-query)- `/api/auth/token/` - Login (get auth token)

- **HTTP Client**: Axios- `/api/users/verify-email/` - Email verification

- **Icons**: Lucide React- `/api/users/my-tenants/` - List user's tenants

- **Rich Text**: Quill / React Quill- `/api/users/profile/` - User profile



## 🔧 Configuration## Development



### Environment Variables```bash

# Install dependencies

Create a `.env.local` file:npm install



```env# Run dev server (hot reload)

# API Configurationnpm run dev

NEXT_PUBLIC_API_URL=http://localhost:8000

# Build for production

# Optional: Analytics, Auth, etc.npm run build

```

# Start production server

### API Integrationnpm start



The portal connects to the NextCore AI Backend API. Configure the base URL in your environment:# Run linter

npm run lint

```typescript```

// The API client automatically uses NEXT_PUBLIC_API_URL

// See lib/api-client.ts for implementation details## Troubleshooting

```

### Port Already in Use

## 🏗️ FeaturesIf port 3000 is already in use:

```bash

### Implemented# Option 1: Use different port

PORT=3001 npm run dev

- ✅ Multi-tenant dashboard routing

- ✅ React Query integration with data caching# Option 2: Kill process using port 3000

- ✅ Axios API client with auth interceptors  lsof -ti:3000 | xargs kill -9

- ✅ Funding eligibility checker UI with edit modal```

- ✅ Continuous Improvement Register (CIR)

- ✅ Rich text editor integration (Quill)### API Connection Issues

- ✅ Responsive Tailwind UI componentsEnsure your Django backend is running:

- ✅ User authentication flow (login, register, verify email)```bash

cd /home/nick/work/NextCore-AI-Cloud

### In Progressdocker-compose ps  # All services should be "Up"

```

- 🚧 Eligibility wizard (multi-step form)

- 🚧 Admin console for rulesets### Module Not Found Errors

- 🚧 Assessment builder UIReinstall dependencies:

- 🚧 Training and assessment system```bash

rm -rf node_modules package-lock.json

## 🔗 Related Repositoriesnpm install

```

- **Backend**: [NextCore-AI-Backend](https://github.com/nick-syspac/NextCore-AI-Backend) - Django REST API

## File Structure

## 📚 Documentation

```

### Key Componentsapps/web-portal/

├── src/

- **Providers**: React Query setup and auth context│   ├── app/

- **API Client**: Axios instance with token auth and tenant routing│   │   ├── layout.tsx          # Root layout

- **Hooks**: Custom React Query hooks for data fetching│   │   ├── page.tsx            # Landing page

│   │   ├── globals.css         # Global styles (Tailwind)

### Backend API Endpoints│   │   ├── login/

│   │   │   └── page.tsx        # Login page

The portal consumes these backend endpoints:│   │   ├── register/

│   │   │   └── page.tsx        # Registration page

- `/api/auth/token/` - Authentication│   │   ├── dashboard/

- `/api/tenants/{slug}/funding-eligibility/` - Eligibility data│   │   │   └── page.tsx        # User dashboard

- `/api/tenants/{slug}/cir/` - Continuous Improvement Register│   │   └── verify-email/

- `/api/users/` - User management│   │       └── [token]/

│   │           └── page.tsx    # Email verification

For full API documentation, see the [Backend Repository](https://github.com/nick-syspac/NextCore-AI-Backend).│   └── lib/

│       └── api.ts              # API client functions

## 🤝 Contributing├── .env.example                # Environment template

├── .env.local                  # Your local config (gitignored)

1. Fork the repository├── next.config.mjs             # Next.js configuration

2. Create a feature branch (`git checkout -b feature/amazing-feature`)├── tailwind.config.ts          # Tailwind CSS config

3. Commit your changes using conventional commits:├── tsconfig.json               # TypeScript config

   - `feat:` for new features└── package.json                # Dependencies

   - `fix:` for bug fixes```

   - `docs:` for documentation

   - `style:` for formatting## Next Steps

   - `refactor:` for refactoring

   - `test:` for tests1. **Test Registration Flow**

   - `chore:` for maintenance   - Visit http://localhost:3000/register

4. Push to the branch (`git push origin feature/amazing-feature`)   - Create an account

5. Open a Pull Request   - Check console for verification email

   - Copy token and visit /verify-email/{token}

## 📄 License   - Login at /login



MIT License - see [LICENSE](LICENSE) file for details.2. **Add Invitation Pages**

   - Create invitation form for admins

## 🆘 Support   - Build invitation acceptance page

   - Test full invitation flow

- 📧 Email: support@nextcollege.edu.au

- 🔒 Security: security@nextcollege.edu.au3. **Configure Email**

   - Set up SMTP in Django settings

---   - Test email delivery

   - Update email templates

**Built with ❤️ for RTO organizations**

4. **Add Docker Support**
   - Add web-portal to docker-compose.yml
   - Configure for production deployment

The backend is fully functional - you can now build out the remaining frontend pages!
