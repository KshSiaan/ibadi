import React from "react";
import Content from "../content";
import { base_api, base_url } from "@/lib/utils";

export default async function Page() {
  const fetchContent = async () => {
    const res = await fetch(
      `${base_url}${base_api}/contents?key=termsAndCondition`,
      {
        cache: "no-store",
      },
    );
    return res.json();
  };
  const content = await fetchContent();
  return (
    <div className="py-24 max-w-2xl mx-auto">
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
        dangerouslySetInnerHTML={{ __html: content?.data?.termsAndCondition }}
      />
    </div>
  );
}
