// The "See what Hyperagent is capable of building" showcase on the home
// screen (docs/reference/pages/threads-new.html), in the order the site
// renders it. Cover images were downloaded from static.hyperagent.com
// (featured-threads/<dir>/preview_w800.png, served as WebP) into
// public/img/home/<slug>.webp.

export type FeaturedThread = {
  slug: string;
  title: string;
  description: string;
  /** Wall-clock run time as the site prints it ("9m 17s"). */
  duration: string;
  /** Spend as the site prints it ("$6.43"). */
  cost: string;
  /** Local cover image under public/. */
  image: string;
  /**
   * The showcase is a CSS multi-column masonry (`columns-1 md:columns-2
   * lg:columns-3`); the site pins where each column starts with
   * `break-before-*` utilities so cards do not reflow by height.
   */
  breakClass?: string;
};

export const featuredThreads: FeaturedThread[] = [
  {
    slug: "out-of-home-campaign",
    title: "Out-of-home campaign",
    description:
      "Research billboard locations, develop creative strategy, and visualize a campaign in real-world settings.",
    duration: "8m 38s",
    cost: "$6.42",
    image: "/img/home/out-of-home-campaign.webp",
  },
  {
    slug: "apparel-launch",
    title: "Apparel launch",
    description:
      "Research audience and influencer strategy, test product placements, and generate on-brand imagery and videography.",
    duration: "9m 17s",
    cost: "$6.43",
    image: "/img/home/apparel-launch.webp",
  },
  {
    slug: "hiring-command-center",
    title: "Hiring command center",
    description: "Source and rank real candidates in a dashboard with skill sliders.",
    duration: "22m 11s",
    cost: "$14.19",
    image: "/img/home/hiring-command-center.webp",
  },
  {
    slug: "small-business-rebrand",
    title: "Small business rebrand",
    description: "Redesign storefront, packaging, and web for a local bakery.",
    duration: "15m 7s",
    cost: "$3.88",
    image: "/img/home/small-business-rebrand.webp",
  },
  {
    slug: "podcast-launch",
    title: "Podcast launch",
    description: "Plan studio layout, generate promo clips, and build the media kit.",
    duration: "25m 56s",
    cost: "$14.20",
    image: "/img/home/podcast-launch.webp",
    breakClass: "lg:break-before-column",
  },
  {
    slug: "product-merchandising",
    title: "Product merchandising",
    description: "Turn raw product photos into a beautiful marketing package.",
    duration: "25m 22s",
    cost: "$10.48",
    image: "/img/home/product-merchandising.webp",
  },
  {
    slug: "cinematic-real-estate-video",
    title: "Cinematic real estate video",
    description: "Turn any listing into a stunning marketing package.",
    duration: "29m 55s",
    cost: "$24.79",
    image: "/img/home/cinematic-real-estate-video.webp",
    breakClass: "md:break-before-column lg:break-before-auto",
  },
  {
    slug: "multi-channel-product-launch",
    title: "Multi-channel product launch",
    description:
      "Build every launch deliverable and preview exactly how it will look in each channel.",
    duration: "16m 10s",
    cost: "$8.79",
    image: "/img/home/multi-channel-product-launch.webp",
  },
  {
    slug: "real-estate-listing-kit",
    title: "Real estate listing kit",
    description:
      "Generate a property listing kit with a video, editorial website, and buyer's handout",
    duration: "9m 35s",
    cost: "$6.75",
    image: "/img/home/real-estate-listing-kit.webp",
    breakClass: "lg:break-before-column",
  },
  {
    slug: "personalized-prospect-outreach",
    title: "Personalized prospect outreach",
    description: "Find prospects with buying triggers, draft outreach emails, and a pitch deck",
    duration: "23m 49s",
    cost: "$8.83",
    image: "/img/home/personalized-prospect-outreach.webp",
  },
  {
    slug: "startup-investment-research",
    title: "Startup investment research",
    description:
      "Compare the top 10 AI infra startup raises this month, build a deck, and draft a tear sheet",
    duration: "18m 28s",
    cost: "$12.05",
    image: "/img/home/startup-investment-research.webp",
  },
  {
    slug: "brand-sponsorship-strategy",
    title: "Brand sponsorship strategy",
    description: "Create a 2026 World Cup sponsorship plan for a sports apparel brand",
    duration: "8m 36s",
    cost: "$9.02",
    image: "/img/home/brand-sponsorship-strategy.webp",
  },
];
