const { z } = require('zod');

const paginationSchema = {
  page: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(1)
  ),
  limit: z.preprocess(
    (val) => (val !== undefined ? String(val) : undefined),
    z.string().regex(/^\d+$/).transform(Number).optional().default(20)
  ),
};

// ENROLLMENTS VALIDATORS
const getEnrollmentsSchema = z.object({
  query: z.object({
    ...paginationSchema,
    studentId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    courseId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    status: z.string().optional(),
    sourceType: z.string().optional(),
    bundleId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    batchId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    orderId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      },
      z.boolean().optional()
    ),
    isDeleted: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return 'false';
      },
      z.boolean().optional().default(false)
    ),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional().default('enrolled_at'),
    sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  }),
});

const createEnrollmentSchema = z.object({
  body: z.object({
    studentId: z.number().int().positive('Student ID must be a positive integer'),
    courseId: z.number().int().positive('Course ID must be a positive integer'),
    sourceType: z.string().optional().default('direct'),
    bundleId: z.number().int().positive().optional().nullable(),
    batchId: z.number().int().positive().optional().nullable(),
    orderId: z.number().int().positive().optional().nullable(),
    orderItemId: z.number().int().positive().optional().nullable(),
    enrollmentStatus: z.string().optional().default('active'),
    enrolledAt: z.string().datetime().optional().nullable(),
    expiresAt: z.string().datetime().optional().nullable(),
    accessStartsAt: z.string().datetime().optional().nullable(),
    accessEndsAt: z.string().datetime().optional().nullable(),
  }),
});

const updateEnrollmentSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
  body: z.object({
    enrollmentStatus: z.string().optional(),
    expiresAt: z.string().datetime().optional().nullable(),
    accessStartsAt: z.string().datetime().optional().nullable(),
    accessEndsAt: z.string().datetime().optional().nullable(),
  }),
});

const deleteEnrollmentSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
});

const bulkDeleteEnrollmentsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

const bulkRestoreEnrollmentsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

// BATCH ENROLLMENTS VALIDATORS
const getBatchEnrollmentsSchema = z.object({
  query: z.object({
    ...paginationSchema,
    studentId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    batchId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    status: z.string().optional(),
    orderId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      },
      z.boolean().optional()
    ),
    isDeleted: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return 'false';
      },
      z.boolean().optional().default(false)
    ),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional().default('enrolled_at'),
    sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  }),
});

const createBatchEnrollmentSchema = z.object({
  body: z.object({
    batchId: z.number().int().positive('Batch ID must be a positive integer'),
    studentId: z.number().int().positive('Student ID must be a positive integer'),
    orderId: z.number().int().positive().optional().nullable(),
    enrollmentStatus: z.string().optional().default('active'),
    enrolledAt: z.string().datetime().optional().nullable(),
    completedAt: z.string().datetime().optional().nullable(),
  }),
});

const updateBatchEnrollmentSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
  body: z.object({
    enrollmentStatus: z.string().optional(),
    completedAt: z.string().datetime().optional().nullable(),
  }),
});

const deleteBatchEnrollmentSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
});

const bulkDeleteBatchEnrollmentsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

const bulkRestoreBatchEnrollmentsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

// WEBINAR REGISTRATIONS VALIDATORS
const getWebinarRegistrationsSchema = z.object({
  query: z.object({
    ...paginationSchema,
    studentId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    webinarId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    status: z.string().optional(),
    orderId: z.preprocess(
      (val) => (val !== undefined ? String(val) : undefined),
      z.string().regex(/^\d+$/).transform(Number).optional()
    ),
    isActive: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return undefined;
      },
      z.boolean().optional()
    ),
    isDeleted: z.preprocess(
      (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return 'false';
      },
      z.boolean().optional().default(false)
    ),
    searchTerm: z.string().optional(),
    sortBy: z.string().optional().default('registered_at'),
    sortDir: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  }),
});

const createWebinarRegistrationSchema = z.object({
  body: z.object({
    webinarId: z.number().int().positive('Webinar ID must be a positive integer'),
    studentId: z.number().int().positive('Student ID must be a positive integer'),
    orderId: z.number().int().positive().optional().nullable(),
    registrationStatus: z.string().optional().default('registered'),
    registeredAt: z.string().datetime().optional().nullable(),
    attendedAt: z.string().datetime().optional().nullable(),
  }),
});

const updateWebinarRegistrationSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
  body: z.object({
    registrationStatus: z.string().optional(),
    attendedAt: z.string().datetime().optional().nullable(),
  }),
});

const deleteWebinarRegistrationSchema = z.object({
  params: z.object({
    id: z.preprocess(
      (val) => String(val),
      z.string().regex(/^\d+$/).transform(Number)
    ),
  }),
});

const bulkDeleteWebinarRegistrationsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

const bulkRestoreWebinarRegistrationsSchema = z.object({
  body: z.object({
    ids: z.array(z.number().int().positive()).min(1),
  }),
});

module.exports = {
  // Enrollments
  getEnrollmentsSchema,
  createEnrollmentSchema,
  updateEnrollmentSchema,
  deleteEnrollmentSchema,
  bulkDeleteEnrollmentsSchema,
  bulkRestoreEnrollmentsSchema,
  // Batch Enrollments
  getBatchEnrollmentsSchema,
  createBatchEnrollmentSchema,
  updateBatchEnrollmentSchema,
  deleteBatchEnrollmentSchema,
  bulkDeleteBatchEnrollmentsSchema,
  bulkRestoreBatchEnrollmentsSchema,
  // Webinar Registrations
  getWebinarRegistrationsSchema,
  createWebinarRegistrationSchema,
  updateWebinarRegistrationSchema,
  deleteWebinarRegistrationSchema,
  bulkDeleteWebinarRegistrationsSchema,
  bulkRestoreWebinarRegistrationsSchema,
};
