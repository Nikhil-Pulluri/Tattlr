// // src/hooks/useUnreadCounts.ts
// import { useQuery } from '@tanstack/react-query';

// export interface UnreadCount {
//   conversationId: string;
//   count: number;
// }

// const backend = process.env.NEXT_PUBLIC_BACKEND_URL


// async function fetchUnreadCounts(userId : string) : Promise<UnreadCount[]> {
//   console.log(userId)
// }

// export const useUnreadCounts = () => {
//   return useQuery({
//     queryKey: ['unreadCounts'],
//     queryFn: fetchUnreadCounts,
//     refetchInterval: 10000, // auto-refetch every 10 seconds
//     staleTime: 5000,        // mark data as stale after 5s
//   });
// };
