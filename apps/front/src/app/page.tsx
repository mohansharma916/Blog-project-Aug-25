import Hero from "@/components/hero";
import Posts from "@/components/Posts";
import { fetchPosts } from "@/lib/actions/postActions";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { getSession } from "@/lib/session";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Home({ searchParams }: Props) {
  const { page } = await searchParams;
  
  const { totalPosts, posts } = await fetchPosts({
 
    page: page ? +page : undefined,
  });
  const session = await getSession();
  console.log("%c", "color: green; font-weight: bold;", { session });

  return (
    <main>
      
      <Hero />
      <Posts
        posts={posts}
        currentPage={page ? +page : 1}
        totalPages={Math.ceil(totalPosts / DEFAULT_PAGE_SIZE)}
      />
    </main>
  );
}
