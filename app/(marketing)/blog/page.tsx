import { allPosts } from "contentlayer/generated";

import { constructMetadata, getBlurDataURL } from "@/lib/utils";
import { BlogPosts } from "@/components/content/blog-posts";
import { BUSINESS_NAME } from "@/config/site";

export const metadata = constructMetadata({
  title: `Blog – ${BUSINESS_NAME}`,
  description: `Latest news and updates from ${BUSINESS_NAME}.`,
});

export default async function BlogPage() {
  const posts = await Promise.all(
    allPosts
      .filter((post) => post.published)
      .sort((a, b) => b.date.localeCompare(a.date))
      .map(async (post) => ({
        ...post,
        blurDataURL: await getBlurDataURL(post.image),
      })),
  );

  return <BlogPosts posts={posts} />;
}
