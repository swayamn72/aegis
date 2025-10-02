import express from 'express';
import auth from '../middleware/auth.js';
import { createSupportRequest, createBugReport } from '../controllers/support.controller.js';

const router = express.Router();

router.post('/contact', auth, createSupportRequest);
router.post('/bug', auth, createBugReport);

export default router;
