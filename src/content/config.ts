import { z, defineCollection, reference } from "astro:content";

const pages = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image().optional(),
      hero: z
        .object({
          title: z.string(),
          background_image: image(),
          style: z.string(),
          first_section: z.object({
            image: image(),
            image_alt: z.string(),
            text: z.string(),
          }),
          second_section: z.object({
            image: image(),
            image_alt: z.string(),
            text: z.string(),
          }),
          inner_image: z
            .object({
              src: image(),
              alt: z.string(),
            })
            .optional(),
        })
        .optional(),
      dev_section: z.array(
        z.object({
          first_column: z.object({
            image: image(),
            title: z.string(),
            url: z.string(),
            text: z.string(),
          }),
          second_column: z.object({
            image: image(),
            title: z.string(),
            url: z.string(),
            text: z.string(),
          }),
        })
      ),

      flow: z
        .array(
          z.object({
            row: reference("rows"),
            style: z.string(),
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

// Expose your defined collection to Astro
// with the `collections` export
export const collections = {
  pages,
  rows,
  sections,
  data,
};
