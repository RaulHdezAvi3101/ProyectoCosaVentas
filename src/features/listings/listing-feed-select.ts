export const listingFeedSelect = {
  slug: true,
  title: true,
  description: true,
  priceCents: true,
  currency: true,
  category: true,
  condition: true,
  imageUrls: true,
  sellerId: true,
  status: true,
  firstToClaim: true,
  phraseHidden: true,
  quantity: true,
  seller: {
    select: {
      id: true,
      displayName: true,
      sellerProfile: {
        select: {
          score: true,
          tier: true,
        },
      },
    },
  },
} as const;
