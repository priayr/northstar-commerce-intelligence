import useSWR from "swr";
import { useFilterStore } from "@/store/filters";

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

export function useAnalytics<T>(endpoint: string, extraParams?: Record<string, string>) {
  const { dateRange, selectedCategories, selectedRegions, selectedChannels } = useFilterStore();

  const searchParams = new URLSearchParams();
  
  if (dateRange?.from) {
    searchParams.set("startDate", dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    searchParams.set("endDate", dateRange.to.toISOString());
  }
  
  if (selectedCategories.length > 0) {
    searchParams.set("categories", selectedCategories.join(","));
  }
  if (selectedRegions.length > 0) {
    searchParams.set("regions", selectedRegions.join(","));
  }
  if (selectedChannels.length > 0) {
    searchParams.set("channels", selectedChannels.join(","));
  }

  if (extraParams) {
    Object.entries(extraParams).forEach(([key, value]) => {
      searchParams.set(key, value);
    });
  }

  const queryString = searchParams.toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;

  const { data, error, isLoading } = useSWR<T>(url, fetcher, {
    keepPreviousData: true,
  });

  return {
    data,
    isLoading,
    isError: error,
  };
}
