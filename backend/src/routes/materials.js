const express = require('express');
const router = express.Router();
const { authenticate, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  trackDownload,
  getStudentMaterials,
  viewMaterial
} = require('../controllers/materialController');

// Apply authentication to all routes
router.use(authenticate);

// POST /api/materials/upload - Upload new material (teacher only)
router.post('/upload', requireRole('teacher'), upload.single('file'), uploadMaterial);

// GET /api/materials - Get materials (role-specific)
router.get('/', (req, res, next) => {
  if (req.user.role === 'teacher') {
    return getMaterials(req, res, next);
  } else {
    return getStudentMaterials(req, res, next);
  }
});

// GET /api/materials/:materialId - Get specific material (teacher only)
router.get('/:materialId', requireRole('teacher'), getMaterialById);

// PUT /api/materials/:materialId - Update material (teacher only)
router.put('/:materialId', requireRole('teacher'), updateMaterial);

// DELETE /api/materials/:materialId - Delete material (teacher only)
router.delete('/:materialId', requireRole('teacher'), deleteMaterial);

// POST /api/materials/:materialId/download - Track download (students)
router.post('/:materialId/download', trackDownload);

// POST /api/materials/:materialId/view - Track material view (students)
router.post('/:materialId/view', viewMaterial);

module.exports = router;
