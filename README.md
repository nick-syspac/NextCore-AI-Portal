# Next.js Web Portal - Installation & Setup

## Prerequisites
- Node.js 18+ and npm

## Quick Start

```bash
cd /home/nick/work/NextCore-AI-Cloud/apps/web-portal

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Run development server
npm run dev
```

The web portal will be available at **http://localhost:3000**

## Environment Configuration

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Features Implemented

### ✅ User Registration (`/register`)
- Full registration form with validation
- Optional invitation token support
- Automatic email verification on registration
- Password confirmation
- Redirects to login after successful registration

### ✅ User Login (`/login`)
- Username/password authentication
- Token-based session management
- Success message after registration
- Redirects to dashboard after login

### ✅ Email Verification (`/verify-email/[token]`)
- Automatic token verification
- Visual feedback (loading, success, error states)
- Auto-redirect to login after success

### ✅ User Dashboard (`/dashboard`)
- Protected route (requires authentication)
- Displays user's tenant memberships
- Role-based UI (owner, admin, member, viewer)
- Logout functionality
- Admin invitation link (for admins/owners)

### ⏳ Coming Soon
- Invitation acceptance page (`/accept-invitation/[token]`)
- Invitation creation form (`/invitations/create`)
- Tenant-specific dashboard (`/dashboard/[tenantSlug]`)
- Profile management
- Password reset flow

## API Integration

The portal connects to your Django backend at `http://localhost:8000`:

- `/api/users/register/` - User registration
- `/api/auth/token/` - Login (get auth token)
- `/api/users/verify-email/` - Email verification
- `/api/users/my-tenants/` - List user's tenants
- `/api/users/profile/` - User profile

## Development

```bash
# Install dependencies
npm install

# Run dev server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Troubleshooting

### Port Already in Use
If port 3000 is already in use:
```bash
# Option 1: Use different port
PORT=3001 npm run dev

# Option 2: Kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

### API Connection Issues
Ensure your Django backend is running:
```bash
cd /home/nick/work/NextCore-AI-Cloud
docker-compose ps  # All services should be "Up"
```

### Module Not Found Errors
Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

## File Structure

```
apps/web-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   ├── globals.css         # Global styles (Tailwind)
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Registration page
│   │   ├── dashboard/
│   │   │   └── page.tsx        # User dashboard
│   │   └── verify-email/
│   │       └── [token]/
│   │           └── page.tsx    # Email verification
│   └── lib/
│       └── api.ts              # API client functions
├── .env.example                # Environment template
├── .env.local                  # Your local config (gitignored)
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── package.json                # Dependencies
```

## Next Steps

1. **Test Registration Flow**
   - Visit http://localhost:3000/register
   - Create an account
   - Check console for verification email
   - Copy token and visit /verify-email/{token}
   - Login at /login

2. **Add Invitation Pages**
   - Create invitation form for admins
   - Build invitation acceptance page
   - Test full invitation flow

3. **Configure Email**
   - Set up SMTP in Django settings
   - Test email delivery
   - Update email templates

4. **Add Docker Support**
   - Add web-portal to docker-compose.yml
   - Configure for production deployment

The backend is fully functional - you can now build out the remaining frontend pages!
