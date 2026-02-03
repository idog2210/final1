import { Router } from 'express';
import adminRequestsRoutes from './requests.routes';
import adminUsersRoutes from './users.routes';

const router = Router();

router.use('/requests', adminRequestsRoutes);
router.use('/users', adminUsersRoutes);

export default router;
