import { z, defineCollection, reference } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";

const pages = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string().optional(),
      dark_title: z.string().optional(),
      description: z.string().optional(),
      image: image().optional(),
      hero: z
        .object({
          dark_title: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          background_image: image().optional(),
          style: z.string().optional(),
          buttons: z
            .object({
              title: z.string(),
              url: z.string(),
              style: z.string(),
            })
            .optional(),
          card_section: z
            .array(
              z.object({
                image: image(),
                image_alt: z.string(),
                text: z.string(),
              })
            )
            .optional(),
          second_section: z
            .object({
              image: image(),
              image_alt: z.string(),
              text: z.string(),
            })
            .optional(),
          inner_image: z
            .object({
              src: image(),
              alt: z.string(),
            })
            .optional(),
        })
        .optional(),
      dev_section: z
        .array(
          z.object({
            image: image(),
            title: z.string(),
            url: z.string(),
            text: z.string(),
          })
        )
        .optional(),

      flow: z
        .array(
          z.object({
            row: reference("rows").optional(),
            style: z.string().optional(),
            sections: z
              .array(
                z
                  .object({
                    component: reference("sections"),
                  })
                  .catchall(z.any())
              )
              .optional(),
          })
        )
        .optional(),
    }),
});

const resources = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      author: z.string(),
      date: z.date(),
      description: z.string().optional(),
      image: image(),
      extra: z
        .object({
          head: z.string(),
        })
        .optional(),
    }),
});

const cheri = defineCollection({
  type: "content",
  schema: z.any(),
});

const rows = defineCollection({
  type: "content",
  schema: z.object({
    path: z.string(),
  }),
});

const sections = defineCollection({
  type: "content",
  schema: z.object({
    path: z.string(),
  }),
});

const data = defineCollection({
  type: "data",
  schema: z.any(),
});

const docs = defineCollection({ schema: docsSchema() });

// Expose your defined collection to Astro
// with the `collections` export
export const collections = {
  pages,
  rows,
  sections,
  data,
  resources,
  cheri,
  docs,
};
