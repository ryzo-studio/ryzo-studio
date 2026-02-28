import { defineField, defineType } from 'sanity';

export const subscriberType = defineType({
  name: 'subscriber',
  title: 'Subscribers',
  type: 'document',
  fields: [
    defineField({ name: 'firstName', title: 'First Name', type: 'string' }),
    defineField({ name: 'email',     title: 'Email',      type: 'string' }),
    defineField({ name: 'region',    title: 'Region',     type: 'string' }),
    defineField({
      name: 'interests',
      title: 'Interests',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Films & Screenings',  value: 'films'     },
          { title: 'Events & Activations', value: 'events'   },
          { title: 'Educator Resources',  value: 'educators' },
          { title: 'Studio News',         value: 'studio'    },
        ],
      },
    }),
    defineField({ name: 'subscribedAt', title: 'Subscribed At', type: 'datetime' }),
  ],
  preview: {
    select: { title: 'email', subtitle: 'region' },
  },
});
