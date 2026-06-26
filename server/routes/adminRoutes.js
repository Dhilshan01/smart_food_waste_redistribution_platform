import express from 'express';
import {
    getStats,
    getAllUsers,
    toggleUserStatus,
    deleteUser,
    getAllListings,
    deleteAnyListing,
    getAllClaims
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect, authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/listings', getAllListings);
router.delete('/listings/:id', deleteAnyListing);
router.get('/claims', getAllClaims);

export default router;
