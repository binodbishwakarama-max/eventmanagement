import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { created } from '../../utils/respond.js';
import { storePosterImage } from '../../services/storage/storage.service.js';

const router = Router();

router.post(
  '/poster',
  authenticate,
  authorize('admin', 'organizer'),
  asyncHandler(async (req, res) => {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      throw ApiError.badRequest('Content-Type must be multipart/form-data');
    }

    let formData;
    try {
      const response = new Response(req, { headers: req.headers });
      formData = await response.formData();
    } catch (err) {
      throw ApiError.badRequest(`Could not parse form data: ${err.message}`);
    }

    const file = formData.get('file') || formData.get('poster');
    const stored = await storePosterImage(file);

    return created(res, stored, 'Event poster uploaded successfully');
  })
);

export default router;
