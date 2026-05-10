import { RequestHandler, Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { upload } from '../services/files.service';
import {
    deleteFile,
    getFile,
    streamUploadedFile,
    uploadFile,
    uploadMultipleFiles,
} from '../controllers/files.controller';

const router = Router();

router.get(
    '/files/:filename',
    authenticate,
    streamUploadedFile as RequestHandler
);

router.post(
    '/upload',
    authenticate,
    upload.single('file'),
    uploadFile as RequestHandler
);
router.post(
    '/upload-multiple',
    authenticate,
    upload.array('files', 10),
    uploadMultipleFiles as RequestHandler
);
router.get('/upload/:filename', authenticate, getFile as RequestHandler);
router.delete(
    '/upload/:filename',
    authenticate,
    requireRole('Landlord'),
    deleteFile as RequestHandler
);

export default router;
