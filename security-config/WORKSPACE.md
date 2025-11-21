# Security Configuration Workspace

This directory contains local security configuration files and is **NOT committed to GitHub**.

## Directory Structure

```
security-config/
├── middleware/              # Security middleware
│   └── security-middleware.ts
├── schemas/                 # Validation schemas
│   └── validation-schemas.ts
├── config/                  # Security tool configs
│   └── owasp-dependency-check.json
├── scripts/                 # Security scripts
├── security-reports/        # Generated security reports
├── package.json             # Dependencies
├── .env                     # Environment variables (NEVER COMMIT)
├── .env.example             # Template for .env
├── README.md                # Usage documentation
└── SECURITY.md              # Security guidelines
```

## Important Notes

1. **This directory is in .gitignore** - Files here will never be committed
2. **The .env file contains secrets** - Keep it secure
3. **Use for local development and testing** - Deploy separately in production
4. **Security reports are generated here** - Review regularly

## Usage

Install dependencies:
```bash
cd ~/ai_game_theory_simulation/security-config
npm install
```

Run security tests:
```bash
npm run test:security
```

Generate secrets:
```bash
openssl rand -base64 32
```

## Integration with Main Project

To use security middleware in the main project:

```typescript
// In your main project
import { securityMiddleware } from '../security-config/middleware/security-middleware';

app.use(securityMiddleware);
```

Note: Update import paths as needed for your project structure.
