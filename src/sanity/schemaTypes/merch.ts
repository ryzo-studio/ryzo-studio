import { defineField, defineType } from 'sanity';
import { TagIcon } from '@sanity/icons';

export const merchType = defineType({
  name: 'merch',
  title: 'Merchandise',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Product Name',
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
      name: 'isVisible',
      title: 'Visible on Site',
      description: '⚠️ Toggle this to publish/unpublish the entire merchandise page.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Product Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Apparel', value: 'apparel' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Collectibles', value: 'collectibles' },
          { title: 'Digital', value: 'digital' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'sizes',
      title: 'Available Sizes',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'XS', value: 'xs' },
          { title: 'S', value: 's' },
          { title: 'M', value: 'm' },
          { title: 'L', value: 'l' },
          { title: 'XL', value: 'xl' },
          { title: 'XXL', value: 'xxl' },
          { title: 'One Size', value: 'one-size' },
        ],
      },
    }),
    defineField({
      name: 'purchaseLink',
      title: 'Purchase Link',
      type: 'url',
      description: 'External store link (Shopify, Etsy, etc.)',
    }),
    defineField({
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'isFeatured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
      isVisible: 'isVisible',
      media: 'images.0',
    },
    prepare({ title, price, isVisible, media }) {
      return {
        title,
        subtitle: `$${price || '—'} · ${isVisible ? 'Visible' : 'Hidden'}`,
        media,
      };
    },
  },
});
