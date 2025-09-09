const Material = require('../models/Material');
const RecentActivity = require('../models/RecentActivity');
const { cloudinary } = require('../config/cloudinary');
const geminiService = require('../services/geminiService');

const uploadMaterial = async (req, res) => {
  try {
    const { title, description, subject, classroomId } = req.body;
    const teacherId = req.user._id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get file info from Cloudinary
    const fileUrl = req.file.path;
    const publicId = req.file.filename;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    // Generate AI summary for text-based files
    let aiSummary = null;
    if (fileType.includes('text') || fileType.includes('pdf')) {
      try {
        aiSummary = await geminiService.generateMaterialSummary(
          title + ' ' + description, 
          fileType
        );
      } catch (error) {
        console.error('AI summary generation failed:', error);
      }
    }

    // Create material record
    const material = new Material({
      title,
      description,
      subject,
      teacher: teacherId,
      classroom: classroomId || null,
      fileUrl,
      fileName: req.file.originalname,
      fileType,
      fileSize,
      cloudinaryPublicId: publicId,
      aiSummary,
      downloadCount: 0
    });

    await material.save();

    // Create recent activity
    await RecentActivity.createActivity({
      teacherId,
      type: 'material_uploaded',
      title: 'New material uploaded',
      description: `Uploaded "${title}" for ${subject}`,
      relatedId: material._id,
      relatedModel: 'Material',
      metadata: {
        subject,
        fileType,
        classroomId
      }
    });

    res.status(201).json({
      success: true,
      message: 'Material uploaded successfully',
      data: material
    });
  } catch (error) {
    console.error('Material upload error:', error);
    
    // Clean up Cloudinary file if database save failed
    if (req.file && req.file.filename) {
      try {
        await cloudinary.uploader.destroy(req.file.filename);
      } catch (cleanupError) {
        console.error('Cloudinary cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload material'
    });
  }
};

const getMaterials = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { page = 1, limit = 10, subject, classroomId } = req.query;

    const filter = { teacher: teacherId };
    if (subject) filter.subject = subject;
    if (classroomId) filter.classroom = classroomId;

    const materials = await Material.find(filter)
      .populate('classroom', 'name code')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Material.countDocuments(filter);

    res.json({
      success: true,
      data: {
        materials,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials'
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user._id;

    const material = await Material.findOne({
      _id: materialId,
      teacher: teacherId
    }).populate('classroom', 'name code students');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Get material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material'
    });
  }
};

const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const { title, description, subject, classroomId } = req.body;
    const teacherId = req.user._id;

    const material = await Material.findOneAndUpdate(
      { _id: materialId, teacher: teacherId },
      {
        title,
        description,
        subject,
        classroom: classroomId || null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.json({
      success: true,
      message: 'Material updated successfully',
      data: material
    });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material'
    });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const teacherId = req.user._id;

    const material = await Material.findOne({
      _id: materialId,
      teacher: teacherId
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Delete file from Cloudinary
    if (material.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(material.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
      }
    }

    // Delete material from database
    await Material.findByIdAndDelete(materialId);

    res.json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material'
    });
  }
};

const trackDownload = async (req, res) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user._id;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Add download record if student hasn't downloaded before
    await material.addDownload(studentId);

    res.json({
      success: true,
      message: 'Download tracked',
      data: {
        downloadUrl: material.file.url || material.file.path,
        filename: material.file.originalName || material.title
      }
    });
  } catch (error) {
    console.error('Track download error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track download'
    });
  }
};

const getStudentMaterials = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { type, subject, classroom } = req.query;

    // Build filter for student's classrooms
    const filter = {
      isActive: true,
      $or: [
        { isPublic: true },
        { classroom: { $in: req.user.classrooms || [] } }
      ]
    };

    if (type) {
      filter.type = type.toLowerCase();
    }
    if (subject) {
      filter.subject = new RegExp(subject, 'i');
    }
    if (classroom) {
      filter.classroom = classroom;
    }

    const materials = await Material.find(filter)
      .populate('classroom', 'name')
      .populate('teacher', 'name')
      .sort({ publishedAt: -1 })
      .lean();

    // Add view status for each material
    const materialsWithStatus = materials.map(material => {
      const hasViewed = material.views.some(v => v.student.toString() === studentId.toString());
      const hasDownloaded = material.downloads.some(d => d.student.toString() === studentId.toString());
      
      return {
        ...material,
        hasViewed,
        hasDownloaded,
        fileSizeFormatted: material.fileSizeFormatted
      };
    });

    res.json({
      success: true,
      data: materialsWithStatus
    });
  } catch (error) {
    console.error('Get student materials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials'
    });
  }
};

const viewMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const studentId = req.user._id;
    const { duration = 0 } = req.body;

    const material = await Material.findById(materialId)
      .populate('classroom', 'name')
      .populate('teacher', 'name');

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Add view record
    await material.addView(studentId, duration);

    res.json({
      success: true,
      message: 'View tracked',
      data: material
    });
  } catch (error) {
    console.error('View material error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track view'
    });
  }
};

module.exports = {
  uploadMaterial,
  getMaterials,
  getMaterialById,
  updateMaterial,
  deleteMaterial,
  trackDownload,
  getStudentMaterials,
  viewMaterial
};
