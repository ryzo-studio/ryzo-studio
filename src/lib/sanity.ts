import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const isConfigured = projectId && projectId !== 'placeholder';

export const sanityClient = createClient({
  projectId: projectId || 'placeholder',
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
  perspective: 'published',
});

export async function fetchSanity<T>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T | null> {
  if (!isConfigured) {
    return null;
  }
  try {
    return await sanityClient.fetch<T>(query, params);
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return null;
  }
}

// Queries
export const queries = {
  events: `*[_type == "event"] | order(date asc) {
    _id, title, date, endDate, location, venue, description,
    eventType, registrationLink, isFeatured,
    "image": image.asset->url
  }`,

  upcomingEvents: `*[_type == "event" && date > now()] | order(date asc) [0...10] {
    _id, title, date, endDate, location, venue, eventType, registrationLink, isFeatured,
    "image": image.asset->url
  }`,

  guides: `*[_type == "guide"] | order(publishedAt desc) {
    _id, title, slug, audience, relatedContent, description,
    skills, gradeLevel, publishedAt, isFeatured,
    "coverImage": coverImage.asset->url,
    "pdfUrl": downloadablePDF.asset->url
  }`,

  merch: `*[_type == "merch"] | order(_createdAt desc) {
    _id, title, slug, isVisible, price, description, category,
    sizes, purchaseLink, inStock, isFeatured,
    "images": images[].asset->url
  }`,

  isMerchVisible: `count(*[_type == "merch" && isVisible == true]) > 0`,
};
