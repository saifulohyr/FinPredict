import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as authController from '../controllers/auth.controller';

const router = Router();

// ============================================================
// PUBLIC ENDPOINTS (No token required)
// ============================================================

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new account (manual)
 *     description: |
 *       Creates a new user account using email & password via Supabase Auth.
 *       A Profile record is also created in the FinPredict database.
 *       Returns the access_token which the frontend should store and use for subsequent API calls.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: mypassword123
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Registration successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Profile'
 *                     access_token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     refresh_token:
 *                       type: string
 *                       description: Token to refresh the access_token
 *       400:
 *         description: Validation error or registration failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', authController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email & password (manual)
 *     description: |
 *       Authenticates a user using email & password via Supabase Auth.
 *       Returns the access_token, refresh_token, and profile data.
 *       The frontend should store the access_token and include it in the
 *       Authorization header (Bearer token) for all subsequent API calls.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: mypassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Login successful.
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/Profile'
 *                     access_token:
 *                       type: string
 *                       description: JWT token for authentication
 *                     refresh_token:
 *                       type: string
 *                       description: Token to refresh the access_token
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', authController.login);

// ============================================================
// PROTECTED ENDPOINTS (Token required via Authorization header)
// ============================================================

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user profile (auto-sync)
 *     description: |
 *       Returns the authenticated user's profile.
 *       Works for BOTH Google Login and Manual Login users.
 *
 *       **For Google Login flow:**
 *       After the frontend completes Google OAuth via Supabase SDK,
 *       call this endpoint with the received token to sync the user's
 *       profile into the FinPredict database.
 *
 *       **For Manual Login flow:**
 *       Profile is already synced during /login, but this endpoint
 *       can be called anytime to get the latest profile data.
 *
 *       If the profile does not exist yet, it is automatically created.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved (or created) successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/me', requireAuth, authController.getMe);

/**
 * @openapi
 * /auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update user profile
 *     description: Updates the authenticated user's full_name and/or avatar_url.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               full_name:
 *                 type: string
 *                 example: John Doe
 *               avatar_url:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Profile'
 *       401:
 *         description: Missing or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Profile not found (call GET /me first)
 *       500:
 *         description: Internal server error
 */
router.put('/profile', requireAuth, authController.updateProfile);

export default router;
