const { User, Company, Driver } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../config/jwt');

// Helper to compute a default home path for a given role
function roleHomePath(role) {
  switch (role) {
    case 'driver':
      return '/driver/dashboard';
    case 'company_admin':
      return '/company/dashboard';
    case 'commuter':
      return '/dashboard/commuter';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/';
  }
}

const register = async (req, res) => {
  try {
    const { full_name, email, password, role, company_name, phone_number } = req.body;

    // Prevent admin role creation via signup
    if (role === 'admin') {
      return res.status(403).json({ error: 'Admin accounts cannot be created through signup' });
    }

    // Validate role
    const allowedRoles = ['commuter', 'company_admin', 'driver'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    const user = await User.create({
      full_name,
      email,
      password,
      role: role || 'commuter',
      phone_number,
      company_id: req.body.company_id || null
    });

    // If registering a company admin, create an approved company and issue a token
    if (role === 'company_admin') {
      const company = await Company.create({
        owner_id: user.id,
        name: company_name || `${full_name} Company`,
        email: email,
        phone: phone_number,
        status: 'approved',
        is_approved: true,
        approval_date: new Date(),
        approved_by: null
      });

      // Link company to user and activate the user immediately
      await user.update({ company_id: company.id, is_active: true });

      const token = generateAccessToken(user.id, user.role);

      return res.status(201).json({
        message: 'Company account created and approved',
        user: user.toSafeObject(),
        company,
        token
      });
    }

    // If registering as a driver and a license_number was provided, create a Driver profile
    if (role === 'driver') {
      const { license_number } = req.body;
      try {
        if (license_number) {
          await Driver.create({
            company_id: req.body.company_id || null,
            user_id: user.id,
            name: full_name,
            license_number,
            phone: phone_number,
            email
          });
        }
      } catch (drvErr) {
        // Log but don't block registration if driver profile creation fails
        console.warn('Failed to create Driver profile during registration:', drvErr && drvErr.message ? drvErr.message : drvErr);
      }
    }

    const token = generateAccessToken(user.id, user.role);

    const safeUser = user.toSafeObject();
    res.status(201).json({
      user: { ...safeUser, homePath: roleHomePath(safeUser.role) },
      token,
      homePath: roleHomePath(safeUser.role)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is not active' });
    }

    const token = generateAccessToken(user.id, user.role);

    const safeUser = user.toSafeObject();

    res.json({
      user: { ...safeUser, homePath: roleHomePath(safeUser.role) },
      token,
      homePath: roleHomePath(safeUser.role)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    const safeUser = user.toSafeObject();
    res.json({ user: { ...safeUser, homePath: roleHomePath(safeUser.role) }, homePath: roleHomePath(safeUser.role) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};



module.exports = {
  register,
  login,
  getMe
};