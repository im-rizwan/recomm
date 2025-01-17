import { useRouter } from "next/navigation";
import { type FC, useEffect } from "react";

import {
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { api } from "@/trpc/react";
import { debounce } from "@/utils/helper";
import { useClientSelectedState } from "@/store/SelectedState";

interface SuggestionProps {
  searchKey: string;
}

const Suggestions: FC<SuggestionProps> = ({ searchKey }) => {
  const router = useRouter();
  const selectedState = useClientSelectedState((selected) => selected.state);
  const suggestionsApi = api.search.all.useQuery({
    search: searchKey,
    state: selectedState,
  });

  useEffect(() => {
    if (searchKey && searchKey.length > 2) {
      debounce(() => void suggestionsApi.refetch())();
    }
  }, [suggestionsApi, searchKey]);

  if (suggestionsApi.isLoading)
    return (
      <CommandItem>
        <CommandEmpty>Searching...</CommandEmpty>
      </CommandItem>
    );
  if (suggestionsApi.isError)
    return (
      <CommandItem>
        <CommandEmpty>Suggestions not available</CommandEmpty>
      </CommandItem>
    );

  if (suggestionsApi.data === undefined) {
    return (
      <CommandGroup>
        <CommandEmpty>No Items found</CommandEmpty>
      </CommandGroup>
    );
  }

  const { categories, brands, models } = suggestionsApi.data;

  return (
    <div className="space-y-2">
      <CommandGroup heading="Category">
        {categories.map((category) => (
          <CommandItem
            key={category.id}
            onSelect={() => {
              router.push(`/products/?category=${category.id}`);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {category.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Brand">
        {brands.map((brand) => (
          <CommandItem
            key={brand.id}
            onSelect={() => {
              router.push(`/products/?brand=${brand.id}`);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {brand.name}
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Model">
        {models.map((modal) => (
          <CommandItem
            key={modal.id}
            onSelect={() => {
              router.push(`/products/?model=${modal.id}`);
            }}
            className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200/50"
          >
            {modal.name}
          </CommandItem>
        ))}
      </CommandGroup>
    </div>
  );
};
export default Suggestions;
