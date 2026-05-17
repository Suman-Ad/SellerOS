import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import {
  Search,
  Boxes,
  AlertTriangle,
  PackageCheck,
  PackageX,
  Flame,
} from "lucide-react";

import QRCode from "react-qr-code";


import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";



export default function Inventory() {

  const { user } = useAuth();

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [selectedRows, setSelectedRows] =
    useState({});

  useEffect(() => {

    if (!user?.uid) return;

    const q = query(
      collection(db, "products"),
      where("sellerId", "==", user.uid)
    );

    const unsubscribe =
      onSnapshot(q, (snapshot) => {

        const productList =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setProducts(productList);

        setLoading(false);
      });

    return () => unsubscribe();

  }, [user]);


  // Flatten variants
  const inventoryItems =
    useMemo(() => {

      return products.flatMap((product) => {

        const variants = Array.isArray(product.variants)
          ? product.variants
          : Object.values(product.variants || {});

        return variants.map((variant) => {

          const stock = Number(variant.qty || 0);

          const reorderLevel = Number(
            variant.reorderLevel || 5
          );

          let status = "Healthy";

          if (stock <= 0) {
            status = "Out Of Stock";
          } else if (stock <= reorderLevel) {
            status = "Critical";
          } else if (stock <= reorderLevel + 5) {
            status = "Low";
          }

          return {
            variantId:
              variant.sku ||
              `${product.id}-${variant.size}`,

            productId: product.id,

            productName:
              product.productName,

            brand: product.brand,

            category: product.category,

            image:
              product.images?.[0] || "",

            inventoryValue:
              Number(stock) *
              Number(variant.buyingPrice || 0),

            status,

            ...variant,
          };
        });
      });

    }, [products]);

  // Search
  const filteredItems =
    useMemo(() => {

      return inventoryItems.filter(
        (item) => {

          const searchTerm =
            search.toLowerCase();

          return (
            item.productName
              ?.toLowerCase()
              .includes(searchTerm) ||

            item.sku
              ?.toLowerCase()
              .includes(searchTerm) ||

            String(item.barcode || "")
              .toLowerCase()
              .includes(searchTerm) ||

            item.brand
              ?.toLowerCase()
              .includes(searchTerm)
          );
        }
      );

    }, [inventoryItems, search]);

  const updateStock =
    async (
      productId,
      sku,
      newStock
    ) => {

      try {

        const product =
          products.find(
            (p) =>
              p.id === productId
          );

        if (!product) return;

        const updatedVariants = {
          ...product.variants,
        };

        Object.keys(updatedVariants).forEach((key) => {

          if (updatedVariants[key].sku === sku) {

            addDoc(
              collection(db, "inventory_movements"),
              {
                sku,
                type: "ADJUSTMENT",
                beforeStock: Number(updatedVariants[key].qty || 0),
                afterStock: Number(newStock),
                quantity:
                  Number(newStock) -
                  Number(updatedVariants[key].qty || 0),
                sellerId: user.uid,
                createdAt: serverTimestamp(),
              }
            );

            updatedVariants[key] = {
              ...updatedVariants[key],
              qty: Number(newStock),
              lastUpdated: serverTimestamp(),
            };
          }
        });

        await updateDoc(
          doc(
            db,
            "products",
            productId
          ),
          {
            variants:
              updatedVariants,
          }
        );

      } catch (error) {

        console.error(error);
      }
    };

  const columns = [

    {
      accessorKey: "productName",
      header: "Product",

      cell: ({ row }) => (

        <div className="flex items-center gap-3">

          <div className="w-14 h-14 min-w-14 min-h-14 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center">

            <img
              src={row.original.image || "/placeholder.png"}
              onError={(e) => {
                e.target.src = "/placeholder.png";
              }}
              loading="lazy"
              className="w-full h-full object-cover"
            />

          </div>

          <div>
            <p className="font-semibold">
              {
                row.original
                  .productName
              }
            </p>

            <p className="text-zinc-400 text-sm">
              {
                row.original
                  .brand
              }
            </p>
          </div>

        </div>
      ),
    },

    {
      accessorKey: "sku",
      header: "SKU",
    },

    {
      accessorKey: "qty",
      header: "Stock",

      cell: ({ row }) => (

        <Input
          type="number"
          value={
            row.original.qty || 0
          }

          onChange={(e) => {

            const value = e.target.value;

            row.original.qty = value;
          }}

          onBlur={(e) =>
            updateStock(
              row.original.productId,
              row.original.sku,
              e.target.value
            )
          }

          className="w-24"
        />
      ),
    },

    {
      accessorKey: "status",
      header: "Status",

      cell: ({ row }) => {

        const status =
          row.original.status;

        return (

          <span
            className={`px-3 py-1 rounded-full text-xs
        ${status ===
                "Critical"
                ? "bg-red-500/20 text-red-400"

                : status ===
                  "Low"
                  ? "bg-yellow-500/20 text-yellow-400"

                  : "bg-green-500/20 text-green-400"
              }`}
          >
            {status}
          </span>
        );
      },
    },

    {
      accessorKey: "inventoryValue",
      header: "Value",

      cell: ({ row }) => (
        <p>
          ₹
          {row.original.inventoryValue}
        </p>
      ),
    },




  ];

  const table = useReactTable({

    data: filteredItems,

    columns,

    getCoreRowModel:
      getCoreRowModel(),

    getPaginationRowModel:
      getPaginationRowModel(),
  });

  return (
    <div>

      {/* Header */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold text-white">

          Inventory

        </h1>

        <p className="text-zinc-400 mt-2">

          Manage variant stock inventory

        </p>

      </div>

      {/* Search */}
      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-3 top-3 text-zinc-500"
        />

        <Input
          placeholder="Search inventory..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="pl-10"
        />

      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p>Total SKU</p>
            <h2 className="text-2xl font-bold">
              {filteredItems.length}
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p>Total Units</p>
            <h2 className="text-2xl font-bold">
              {
                filteredItems.reduce(
                  (a, b) =>
                    a +
                    Number(
                      b.qty || 0
                    ),
                  0
                )
              }
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p>Low Stock</p>
            <h2 className="text-2xl font-bold text-yellow-400">
              {
                filteredItems.filter(
                  (i) =>
                    i.status ===
                    "Low"
                ).length
              }
            </h2>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <p>Critical</p>
            <h2 className="text-2xl font-bold text-red-400">
              {
                filteredItems.filter(
                  (i) =>
                    i.status ===
                    "Critical"
                ).length
              }
            </h2>
          </CardContent>
        </Card>

      </div>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-0 overflow-auto">

          <table className="w-full">

            <thead className="bg-zinc-800 sticky top-0 z-10">

              {table
                .getHeaderGroups()
                .map((headerGroup) => (

                  <tr
                    key={headerGroup.id}
                  >

                    {headerGroup.headers.map(
                      (header) => (

                        <th
                          key={header.id}
                          className="p-4 text-left"
                        >

                          {flexRender(
                            header.column
                              .columnDef
                              .header,
                            header.getContext()
                          )}

                        </th>
                      )
                    )}

                  </tr>
                ))}

            </thead>

            <tbody>

              {table
                .getRowModel()
                .rows.map((row) => (

                  <tr
                    key={row.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40 h-[88px]"
                  >

                    {row
                      .getVisibleCells()
                      .map((cell) => (

                        <td
                          key={cell.id}
                          className="p-4"
                        >

                          {flexRender(
                            cell.column
                              .columnDef
                              .cell,
                            cell.getContext()
                          )}

                        </td>
                      ))}

                  </tr>
                ))}

            </tbody>

          </table>

          <div className="flex items-center justify-between p-4">

            <Button
              onClick={() =>
                table.previousPage()
              }

              disabled={
                !table.getCanPreviousPage()
              }
            >
              Previous
            </Button>

            <span>
              Page{" "}
              {table.getState()
                .pagination.pageIndex + 1}
            </span>

            <Button
              onClick={() =>
                table.nextPage()
              }

              disabled={
                !table.getCanNextPage()
              }
            >
              Next
            </Button>

          </div>

          {!loading &&
            filteredItems.length ===
            0 && (

              <div className="p-12 text-center">

                <Boxes
                  size={48}
                  className="mx-auto text-zinc-600"
                />

                <h3 className="text-xl font-semibold mt-4 text-white">

                  No inventory found

                </h3>

                <p className="text-zinc-400 mt-2">

                  Add products with variants

                </p>

              </div>

            )}

        </CardContent>

      </Card>

    </div>
  );
}