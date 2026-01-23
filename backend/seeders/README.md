# Database Seeders

## Create Admin User

To create the admin user with default credentials, run:

```bash
node seeders/createAdmin.js
```

### Default Admin Credentials
- **Email**: `admin@safaritix.com`
- **Password**: `Admin@123456`
- **Phone**: `+254700000000`

These can be customized in the `.env` file:
```env
ADMIN_EMAIL="admin@safaritix.com"
ADMIN_PASSWORD="Admin@123456"
ADMIN_PHONE="+254700000000"
```

### Important Notes
- Admin accounts **cannot** be created through the signup page
- Only one admin account will be created
- Change the default password after first login
- Run this seeder after setting up the database tables
