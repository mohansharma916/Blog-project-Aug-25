"use client";

import { saveNewPost } from "@/lib/actions/postActions";
import { useActionState } from "react";
import UpsertPostForm from "./upsertPostForm";

const CreatePostContainer = () => {
  const [state, action] = useActionState(saveNewPost, undefined);

  console.log("Rendering CreatePostContainer", state);
  return <UpsertPostForm state={state} formAction={action} />;
};

export default CreatePostContainer;
