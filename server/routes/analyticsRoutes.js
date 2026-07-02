import express from 'express';
import { getBusinessAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/business', protect, authorizeRoles('donor'), getBusinessAnalytics);
router.get('/my-stats', protect, authorizeRoles('donor'), getBusinessAnalytics);

export default router;
