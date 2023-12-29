"use client";

import { DataTable } from "@/app/admin/tables/Table";
import ServerError from "@/components/common/ServerError";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAdminSelectedState } from "@/store/SelectedState";
import { type OmitUndefined } from "@/types/custom";
import { type ModelPayloadIncluded } from "@/types/prisma";
import { api } from "@/trpc/react";
import { type RouterInputs } from "@/trpc/shared";
import {
  defaultSearch,
  defaultSortBy,
  defaultSortOrder,
  type SortOrder,
} from "@/utils/constants";
import { type ColumnDef } from "@tanstack/react-table";
import {
  parseAsString,
  parseAsStringEnum,
  useQueryState,
} from "next-usequerystate";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Searchbar from "../Searchbar";
import TableHeader from "../TableHeader";

type SortBy = OmitUndefined<RouterInputs["model"]["getModels"]["sortBy"]>;

export default function ModelTable() {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const categoryId = params.get("category") ?? undefined;
  const brandId = params.get("brand") ?? undefined;

  const [sortBy, setSortBy] = useQueryState(
    "sortBy",
    parseAsStringEnum<SortBy>([
      "category",
      "brand",
      "name",
      "createdAt",
      "updatedAt",
      "active",
    ]).withDefault(defaultSortBy),
  );

  const [sortOrder, setSortOrder] = useQueryState(
    "sortOrder",
    parseAsStringEnum<SortOrder>(["asc", "desc"]).withDefault(defaultSortOrder),
  );

  const [updatingModelId, setUpdatingModelId] = useState<string>();
  const updateModelById = api.model.updateModelById.useMutation();

  const selectedState = useAdminSelectedState((selected) => selected.state);
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(defaultSearch),
  );
  const modelsApi = api.model.getModels.useInfiniteQuery(
    {
      search,
      sortBy,
      sortOrder,
      categoryId,
      brandId,
      state: selectedState,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    },
  );

  const deleteModelApi = api.model.deleteModelById.useMutation();
  const [deleteModelId, setDeleteModelId] = useState<string>();

  const columns: ColumnDef<ModelPayloadIncluded>[] = useMemo(
    () => [
      {
        id: "Name",
        header: () => (
          <TableHeader
            title="name"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.name,
      },
      {
        id: "active",
        header: "Active",
        cell: ({ row }) => (
          <Switch
            disabled={updatingModelId === row.original.id}
            checked={row.original.active}
            // make the switch blue when active and black when inactive
            className="data-[state=checked]:bg-blue-500"
            onCheckedChange={() => {
              setUpdatingModelId(row.original.id);
              updateModelById
                .mutateAsync({
                  id: row.original.id,
                  active: !row.original.active,
                })
                .then(async () => {
                  await modelsApi.refetch();
                  setUpdatingModelId(undefined);
                })
                .catch((err) => {
                  console.log(err);
                });
            }}
          />
        ),
      },
      {
        id: "Brand",
        header: () => (
          <TableHeader
            title="brand"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.brand.name,
      },
      {
        id: "Category",
        header: () => (
          <TableHeader
            title="category"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.category.name,
      },
      {
        id: "products",
        header: "Products",
        cell: ({ row }) => (
          <Link
            href={`/admin/tables/products?model=${row.original.id}`}
            className="text-blue-400 hover:text-blue-600"
          >
            Products
          </Link>
        ),
      },
      {
        id: "createdAt",
        header: () => (
          <TableHeader
            title="createdAt"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.createdAt.toLocaleString("en-US"),
      },
      {
        id: "updatedAt",
        header: () => (
          <TableHeader
            title="updatedAt"
            sortBy={sortBy}
            setSortBy={(sortBy) => void setSortBy(sortBy)}
            sortOrder={sortOrder}
            setSortOrder={(sortOrder) => void setSortOrder(sortOrder)}
          />
        ),
        accessorFn: (row) => row.updatedAt.toLocaleString("en-US"),
      },
      {
        id: "edit",
        header: "Edit",
        cell: ({ row }) => (
          <Button size="sm" variant="outline" className="border-blue-400">
            <Link
              href={`/admin/models/edit/?id=${row.original.id}`}
              className="flex h-full w-full items-center justify-center"
            >
              Edit
            </Link>
          </Button>
        ),
      },
      {
        id: "delete",
        header: "Delete",
        cell: ({ row }) => (
          <Button
            onClick={() => {
              setDeleteModelId(row.id);
              void deleteModelApi
                .mutateAsync({ modelId: row.original.id })
                .then(async () => {
                  await modelsApi.refetch();
                  setDeleteModelId(undefined);
                });
            }}
            disabled={deleteModelId === row.id}
            size="sm"
            variant="outline"
            className="border-red-400"
          >
            Delete
          </Button>
        ),
      },
    ],
    [
      deleteModelApi,
      deleteModelId,
      modelsApi,
      setSortBy,
      setSortOrder,
      sortBy,
      sortOrder,
      updateModelById,
      updatingModelId,
    ],
  );

  if (modelsApi.isError) {
    return <ServerError message={modelsApi.error.message} />;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-2 rounded-lg">
        <Searchbar search={search} setSearch={setSearch} />
        <Link href="/admin/models/create">
          <Button>New</Button>
        </Link>
      </div>
      <DataTable
        columns={columns}
        data={modelsApi.data?.pages.flatMap((page) => page.models)}
        canViewMore={!!modelsApi.hasNextPage}
        viewMore={() => {
          void modelsApi.fetchNextPage();
        }}
        isLoading={modelsApi.isLoading}
      />
    </>
  );
}
