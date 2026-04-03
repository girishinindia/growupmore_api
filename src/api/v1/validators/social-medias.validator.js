/**
 * ═══════════════════════════════════════════════════════════════
 * SOCIAL-MEDIAS VALIDATOR — Zod Schemas
 * ═══════════════════════════════════════════════════════════════
 */

const { z } = require('zod');

const createSocialMediaSchema = z.object({
  name: z
    .string()
    .min(2, 'Social media name must be at least 2 characters.')
    .max(100, 'Social media name must not exceed 100 characters.')
    .trim(),
  platform_type: z
    .enum(['facebook', 'twitter', 'linkedin', 'instagram', 'youtube', 'github', 'other'], {
      errorMap: () => ({ message: 'Platform type must be one of: facebook, twitter, linkedin, instagram, youtube, github, other' }),
    }),
  is_active: z.boolean().default(true),
});

const updateSocialMediaSchema = createSocialMediaSchema.partial();

module.exports = {
  createSocialMediaSchema,
  updateSocialMediaSchema,
};
