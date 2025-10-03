"use client";

type Props = {
  content: string;
  className?: string;
};
const SanitizedContent = (props: Props) => {
  // const cleanHtml = DOMPurify.sanitize(props.content);

  return (
    <div
      className={props.className}
      dangerouslySetInnerHTML={{ __html: props.content }}
    />
  );
};

export default SanitizedContent;
