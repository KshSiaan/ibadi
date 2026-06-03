"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse } from "@/lib/api/client";
import { User } from "@/lib/api/types";
import { useCookies } from "react-cookie";

export function useUpdateServiceProviderInfo() {
  const [cookies] = useCookies(["accessToken"]);
  const queryClient = useQueryClient();

  return useMutation<User, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/service-provider-info`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${cookies.accessToken}`,
          },
          body: formData,
        },
      );
      const json: ApiResponse<User> = await res.json();
      if (!json.success) throw new Error(json.message);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}
