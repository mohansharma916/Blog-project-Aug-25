import { fetchUserPosts } from "@/lib/actions/postActions";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";
import NoPost from "./_components/NoPost";
import PostList from "./_components/PostList";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
const UserPostPage = async ({ searchParams }: Props) => {
  const { page } = await searchParams;
  const { totalPosts, posts } = await fetchUserPosts({
    page: page ? +page : 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  return (
    <div>
      {!posts || !posts.length ? (
        <NoPost />
      ) : (
        <PostList
          posts={posts}
          currentPage={page ? +page : 1}
          totalPages={Math.ceil(totalPosts / DEFAULT_PAGE_SIZE)}
        />
      )}
    </div>
  );
};

export default UserPostPage;
