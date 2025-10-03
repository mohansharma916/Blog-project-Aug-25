"use server";

import { print } from "graphql";
import { authFetchGraphQL, fetchGraphQL } from "../fetchGraphQL";
import {
  CREATE_POST_MUTATION,
  DELETE_POST_MUTATION,
  GET_POST_BY_ID,
  GET_POSTS,
  GET_USER_POSTS,
  UPDATE_POST_MUTATION,
} from "../gqlQueries";
import { transformTakeSkip } from "../helpers";
import { Post } from "../types/modelTypes";
import { PostFormState } from "../types/formState";
import { PostFormSchema } from "../zodSchemas/postFormSchema";
import { uploadThumbnail } from "../upload";
import { stat } from "fs";

export const fetchPosts = async ({
  page,
  pageSize,
}: {
  page?: number;
  pageSize?: number;
}) => {
  const { skip, take } = transformTakeSkip({ page, pageSize });

  console.log("ui",{ skip, take },GET_POSTS);
  const data = await fetchGraphQL(print(GET_POSTS), { skip, take });

  return { posts: data.posts as Post[], totalPosts: data.postCount };
};

export const fetchPostById = async (id: string) => {
 
  const data = await fetchGraphQL(print(GET_POST_BY_ID), { id });
 console.log("ui3",data);
  return data.getPostById as Post;
};

export async function fetchUserPosts({
  page,
  pageSize,
}: {
  page?: number;
  pageSize: number;
}) {
  const { take, skip } = transformTakeSkip({ page, pageSize });
  const data = await authFetchGraphQL(print(GET_USER_POSTS), {
    take,
    skip,
  });

  return {
    posts: data.getUserPosts as Post[],
    totalPosts: data.userPostCount as number,
  };
}

export async function saveNewPost(
  state: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  console.log("ui0", Object.fromEntries(formData.entries()));
  const validatedFields = PostFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  console.log("ui1",validatedFields);

  
  if (!validatedFields.success)
    return {
      data: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
    };
  // let thumbnailUrl = "";
  // Todo:Upload Thumbnail to supabase
  // if (validatedFields.data.thumbnail)
  //   thumbnailUrl = await uploadThumbnail(validatedFields.data.thumbnail);

  // Todo: call garphql api

  console.log("ui2",validatedFields.data);

  const data = await authFetchGraphQL(print(CREATE_POST_MUTATION), {

    input: {
      ...validatedFields.data,
      // thumbnail: "https://picsum.photos/200",
    },
  });

  if (data) return { message: "Success! New Post Saved", ok: true };
  return {
    message: "Oops, Something Went Wrong",
    data: Object.fromEntries(formData.entries()),
  };
}

export async function updatePost(
  state: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const validatedFields = PostFormSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success)
    return {
      data: Object.fromEntries(formData.entries()),
      errors: validatedFields.error.flatten().fieldErrors,
    };

  // Todo: check if thumbnail has been changed
  const { thumbnail, ...inputs } = validatedFields.data;

  let thumbnailUrl = "";
  // Todo:Upload Thumbnail to supabase
  if (thumbnail) thumbnailUrl = await uploadThumbnail(thumbnail);

  const data = await authFetchGraphQL(print(UPDATE_POST_MUTATION), {
    input: {
      ...inputs,
      ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
    },
  });

  if (data) return { message: "Success! The Post Updated", ok: true };
  return {
    message: "Oops, Something Went Wrong",
    data: Object.fromEntries(formData.entries()),
  };
}

export async function deletePost(postId: number) {
  const data = await authFetchGraphQL(print(DELETE_POST_MUTATION), {
    postId,
  });

  return data.deletePost;
}
