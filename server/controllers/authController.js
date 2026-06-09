import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER
export const register = async (req, res) => {
    const { full_name, email, password, role, organization_name, phone, address, city } = req.body;

    try {
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            `INSERT INTO users (full_name, email, password, role, organization_name, phone, address, city)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, full_name, email, role`,
            [full_name, email, hashedPassword, role, organization_name, phone, address, city]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: newUser.rows[0]
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// LOGIN
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await pool.query(
            'SELECT * FROM users WHERE email = $1', [email]
        );
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        const isMatch = await bcrypt.compare(password, user.rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }


        if (!user.rows[0].is_active) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.rows[0].id,
                full_name: user.rows[0].full_name,
                email: user.rows[0].email,
                role: user.rows[0].role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, full_name, email, role, organization_name, phone, city FROM users WHERE id = $1',
            [req.user.id]
        );
        res.status(200).json(user.rows[0]);
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};