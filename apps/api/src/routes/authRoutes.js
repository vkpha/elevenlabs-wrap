import express from 'express';
import { authService } from '../modules/auth/authService.js';

const router = express.Router();

/**
 * Initiate Spotify OAuth login
 * GET /auth/login?redirect=page-name (optional)
 */
router.get('/login', (req, res) => {
  // Store redirect preference in session
  if (req.query.redirect) {
    req.session.redirectPage = req.query.redirect;
  }
  const authUrl = authService.getAuthorizationUrl();
  res.redirect(authUrl);
});

/**
 * OAuth callback endpoint
 * GET /auth/callback
 */
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.redirect(`${authService.frontendUrl}/#error=no_code`);
  }

  try {
    await authService.authenticateUser(req.session, code);

    // Check if there's a redirect page preference
    const redirectPage = req.session.redirectPage || '';
    delete req.session.redirectPage; // Clean up

    // Save session and redirect to frontend
    req.session.save((err) => {
      if (err) {
        console.error('Error saving session:', err);
        return res.redirect(`${authService.frontendUrl}/#error=session_save_failed`);
      }

      // Redirect to specific page or loading screen
      if (redirectPage) {
        res.redirect(`${authService.frontendUrl}/${redirectPage}.html?success=true`);
      } else {
        res.redirect(`${authService.frontendUrl}/#loading`);
      }
    });
  } catch (error) {
    console.error('Error during authentication:', error.response?.data || error.message);
    const redirectPage = req.session.redirectPage || '';
    delete req.session.redirectPage;

    if (redirectPage) {
      res.redirect(`${authService.frontendUrl}/${redirectPage}.html?error=auth_failed`);
    } else {
      res.redirect(`${authService.frontendUrl}/#error=auth_failed`);
    }
  }
});

/**
 * Logout endpoint
 * POST /auth/logout
 */
router.post('/logout', async (req, res) => {
  try {
    await authService.logoutUser(req.session);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to logout' });
  }
});

/**
 * Check authentication status
 * GET /auth/status
 */
router.get('/status', (req, res) => {
  res.json({
    authenticated: authService.isAuthenticated(req.session)
  });
});

export default router;
