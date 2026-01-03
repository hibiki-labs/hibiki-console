# Hibiki Console

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Quick Start for Developers](#quick-start-for-developers)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Development Lifecycle](#development-lifecycle)
- [Testing](#testing)
- [Build & Deployment Commands](#build--deployment-commands)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### Tech Stack

- **Framework**: Next.js (App Router)
- **UI Library**: Mantine
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Session Management**: iron-session (encrypted cookie-based)
- **Validation**: Zod schemas

### Key Features

- Server-side session management with encrypted cookies
- TypeORM integration for database operations
- Role-based access control (RBAC)
- Dynamic form system
- Password-based authentication
- Responsive UI with Mantine components

---

## Quick Start for Developers

### Prerequisites

- **Node.js**: v22.x or higher (LTS)
- **PostgreSQL**: v12 or higher
- **Bun**: v1.0+ (optional, for faster development) - [Install Bun](https://bun.sh)

### Recommended VS Code Extensions

For the best development experience, install these extensions:

- **[Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)** (`esbenp.prettier-vscode`)
  Automatically formats code using Prettier

- **[ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)** (`dbaeumer.vscode-eslint`)
  Integrates ESLint JavaScript linting into VS Code

- **[PostgreSQL](https://marketplace.visualstudio.com/items?itemName=ms-ossdata.vscode-pgsql)** (`ms-ossdata.vscode-pgsql`)
  Develop PostgreSQL applications with query editor, IntelliSense, and database management

- **[Markdown Preview Mermaid Support](https://marketplace.visualstudio.com/items?itemName=bierner.markdown-mermaid)** (`bierner.markdown-mermaid`)
  Adds Mermaid diagram and flowchart support to VS Code's markdown preview

### 1. Clone and Install

```bash
git clone <repository-url>
cd hibiki-console

# Using npm
npm install

# Or using Bun (faster)
bun install
```

### 2. Database Setup

Create the PostgreSQL database and user:

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Run these commands in psql
CREATE USER hibiki_console WITH PASSWORD 'hibiki_console';
CREATE DATABASE hibiki_console WITH OWNER = hibiki_console ENCODING = 'UTF8' CONNECTION LIMIT = -1;
\q
```

#### Configure pg_hba.conf (if needed)

If you encounter authentication errors like `FATAL: Peer authentication failed`, you need to configure PostgreSQL to allow password authentication:

```bash
# Find pg_hba.conf location
sudo -u postgres psql -c "SHOW hba_file;"

# Edit pg_hba.conf (typical locations)
sudo nano /etc/postgresql/*/main/pg_hba.conf   # Ubuntu/Debian
sudo nano /var/lib/pgsql/data/pg_hba.conf      # RHEL/CentOS/Fedora
```

Add or modify these lines to allow password authentication for the hibiki_console user:

```conf
# TYPE  DATABASE        USER            ADDRESS         METHOD
host    hibiki_console  hibiki_console  127.0.0.1/32    md5
host    hibiki_console  hibiki_console  ::1/128         md5
```

Restart PostgreSQL to apply changes:

```bash
sudo systemctl restart postgresql
```

#### Test Connection

```bash
psql -h 127.0.0.1 -d hibiki_console -U hibiki_console
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
# Generate a secure session password
openssl rand -base64 32
```

Copy the generated password and create `.env.local`:

```env
# Session Configuration
SESSION_COOKIE_NAME=hibiki_console
SESSION_COOKIE_PASSWORD=<paste-your-generated-password-here>
SESSION_MAX_AGE_SECONDS=86400

# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=hibiki_console
DB_USER_NAME=hibiki_console
DB_USER_PASS=hibiki_console

# Authentication Configuration (Optional)
ENABLE_OTP=true  # Set to 'false' to disable OTP/2FA

# RabbitMQ Configurations
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=admin123
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Or using Bun
bun dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## Production Deployment

### Server Requirements

- **OS**: Ubuntu 20.04 LTS or RHEL 8+
- **RAM**: Minimum 2GB, Recommended 4GB+
- **CPU**: 2+ cores
- **Storage**: 10GB+ available space
- **Node.js**: v22.x or higher (LTS) (or **Bun**: v1.0+)
- **PostgreSQL**: v12 or higher
- **Reverse Proxy**: nginx or Apache (recommended)

### Deployment Steps

#### 1. Install Node.js or Bun

**Option A: Node.js**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

**Option B: Bun (faster alternative)**

```bash
curl -fsSL https://bun.sh/install | bash

# Verify installation
bun --version
```

#### 2. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib
```

#### 3. Setup Database

```bash
sudo -u postgres psql

# In psql:
CREATE USER hibiki_console WITH PASSWORD 'your_secure_password';
CREATE DATABASE hibiki_console WITH OWNER = hibiki_console ENCODING = 'UTF8' CONNECTION LIMIT = -1;
\q
```

#### 4. Application Deployment

```bash
# Create application directory
sudo mkdir -p /opt/hibiki
sudo chown $USER:$USER /opt/hibiki
cd /opt/hibiki

# Clone repository
git clone <repository-url> .

# Install dependencies (choose one)
npm ci --omit=dev        # Using npm
bun install --production # Using Bun

# Create production environment file
nano .env.local

# Build application (choose one)
npm run build            # Using npm
bun run build            # Using Bun

# Test the build (choose one)
NODE_ENV=production npm start  # Using npm
NODE_ENV=production bun start  # Using Bun
```

#### 5. Setup as systemd Service

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/hibiki.service
```

Add the following content:

```ini
[Unit]
Description=Hibiki Console
After=network.target postgresql.service

[Service]
Type=simple
User=<your-user>
WorkingDirectory=/opt/hibiki
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
# Or for Bun: ExecStart=/home/<your-user>/.bun/bin/bun start
Restart=on-failure
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=hibiki

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable hibiki
sudo systemctl start hibiki
sudo systemctl status hibiki
```

---

## Environment Configuration

### Session Configuration

| Variable                  | Description                                      | Default          | Required |
| ------------------------- | ------------------------------------------------ | ---------------- | -------- |
| `SESSION_COOKIE_NAME`     | Name of the session cookie                       | `hibiki_console` | Yes      |
| `SESSION_COOKIE_PASSWORD` | Secret key for encrypting cookies (min 32 chars) | -                | Yes      |
| `SESSION_MAX_AGE_SECONDS` | Session expiration time in seconds               | `86400`          | Yes      |

### Database Configuration

| Variable            | Description                 | Default            | Required |
|---------------------|-----------------------------|--------------------|----------|
| DB_HOST             | PostgreSQL host address     | 127.0.0.1          | Yes      |
| DB_PORT             | PostgreSQL port             | 5432               | Yes      |
| DB_NAME             | Database name               | hibiki_console     | Yes      |
| DB_USER_NAME        | Database user               | hibiki_console     | Yes      |
| DB_USER_PASS        | Database password           | -                  | Yes      |
| RABBITMQ_HOST       | RabbitMQ host address       | localhost          | Yes      |
| RABBITMQ_PORT       | RabbitMQ port               | 5672               | Yes      |
| RABBITMQ_USER       | RabbitMQ username           | admin              | Yes      |
| RABBITMQ_PASSWORD   | RabbitMQ password           | admin123           | Yes      |

### Authentication Configuration

| Variable     | Description                                                                 | Default | Required |
| ------------ | --------------------------------------------------------------------------- | ------- | -------- |
| `ENABLE_OTP` | Enable/disable OTP (two-factor authentication). Set to `true` or `false`    | `true`  | No       |

**Note**: When `ENABLE_OTP` is set to `false`, users will be logged in immediately after successful credential validation, bypassing the OTP step.

---

## Development Lifecycle

### Available Scripts

| Script                   | npm                      | Bun                      |
| ------------------------ | ------------------------ | ------------------------ |
| Start development server | `npm run dev`            | `bun dev`                |
| Build for production     | `npm run build`          | `bun run build`          |
| Start production server  | `npm start`              | `bun start`              |
| Run all tests            | `npm test`               | `bun test`               |
| TypeScript type checking | `npm run typecheck`      | `bun run typecheck`      |
| Run ESLint and Stylelint | `npm run lint`           | `bun run lint`           |
| Check code formatting    | `npm run prettier:check` | `bun run prettier:check` |
| Format TypeScript files  | `npm run prettier:write` | `bun run prettier:write` |

---

## Testing

### Running Tests

| Command                | npm                  | Bun                  |
| ---------------------- | -------------------- | -------------------- |
| Run all tests          | `npm test`           | `bun test`           |
| Run Jest tests         | `npm run jest`       | `bun run jest`       |
| Run Jest in watch mode | `npm run jest:watch` | `bun run jest:watch` |
| Check TypeScript types | `npm run typecheck`  | `bun run typecheck`  |
| Lint code              | `npm run lint`       | `bun run lint`       |

---

## Build & Deployment Commands

### Build Commands

```bash
# Using npm
npm run build            # Production build
npm start                # Start production server

# Using Bun
bun run build            # Production build
bun start                # Start production server
```

### Production Server Management

```bash
sudo systemctl start hibiki     # Start service
sudo systemctl stop hibiki      # Stop service
sudo systemctl restart hibiki   # Restart service
sudo systemctl status hibiki    # Check status
sudo journalctl -u hibiki -f    # View logs
```

---

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
lsof -i :3000
kill -9 <PID>
```

#### Database Connection Issues

```bash
sudo systemctl status postgresql
psql -h 127.0.0.1 -d hibiki_console -U hibiki_console
```

#### Build Failures

```bash
# Using npm
rm -rf .next node_modules package-lock.json
npm install
npm run build

# Using Bun
rm -rf .next node_modules bun.lockb
bun install
bun run build
```

#### Git Push Issues

If you encounter authentication or credential issues when pushing to a remote repository:

```bash
git config --global --unset credential.helper
```

This clears the global credential helper configuration, which can resolve issues with cached or incorrect credentials.

---

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Mantine Documentation](https://mantine.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
