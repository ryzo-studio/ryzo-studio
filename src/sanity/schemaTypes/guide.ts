import { defineField, defineType } from 'sanity';
import { BookIcon } from '@sanity/icons';

export const guideType = defineType({
  name: 'guide',
  title: 'Engagement Guide',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Guide Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'audience',
      title: 'Audience',
      type: 'string',
      options: {
        list: [
          { title: 'Teachers', value: 'teachers' },
          { title: 'Parents', value: 'parents' },
          { title: 'Both', value: 'both' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'relatedContent',
      title: 'Related Content',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Release The Beast (Film)', value: 'film' },
          { title: 'Rage Fighters (Game)', value: 'game' },
          { title: 'Both', value: 'both' },
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'content',
      title: 'Guide Content',
      type: 'array',
      of: [
        { type: 'block' },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: 'Caption',
            },
          ],
        },
      ],
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'downloadablePDF',
      title: 'Downloadable PDF',
      type: 'file',
      options: { accept: '.pdf' },
    }),
    defineField({
      name: 'skills',
      title: 'Social-Emotional Skills Covered',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'E.g. "Emotional regulation", "Anger management", "Empathy"',
    }),
    defineField({
      name: 'gradeLevel',
      title: 'Grade Level',
      type: 'string',
      options: {
        list: [
          { title: 'K–2', value: 'k-2' },
          { title: '3–5', value: '3-5' },
          { title: '6–8', value: '6-8' },
          { title: 'All Grades', value: 'all' },
        ],
      },
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    }),
    defineField({
      name: 'isFeatured',
      title: 'Feature on Guides page',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      audience: 'audience',
    },
    prepare({ title, audience }) {
      return {
        title,
        subtitle: audience ? `For: ${audience}` : '',
      };
    },
  },
});
