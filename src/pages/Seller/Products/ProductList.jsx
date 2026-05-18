import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Package,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";

import { toast } from "sonner";

export default function ProductList() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  // Fetch Products
  useEffect(() => {

    if (!user?.uid) return;

    const q = query(
      collection(db, "products"),
      where("sellerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {

        const productList =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setProducts(productList);

        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();

  }, [user]);

  // Delete Product
  const handleDelete =
    async (productId) => {

      const confirmDelete =
        window.confirm(
          "Delete this product?"
        );

      if (!confirmDelete)
        return;

      try {

        await deleteDoc(
          doc(
            db,
            "products",
            productId
          )
        );

        toast.success(
          "Product deleted"
        );

        // fetchProducts();

      } catch (error) {

        toast.error(
          error.message
        );
      }
    };

  // Search Filter
  const filteredProducts =
    products.filter((product) =>
      product.productName
        ?.toLowerCase()
        .includes(
          search.toLowerCase()
        )
    );

  return (
    <div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

        <div>

          <h1 className="text-3xl font-bold text-white">

            Products

          </h1>

          <p className="text-zinc-400 mt-2">

            Manage seller catalog inventory

          </p>

        </div>

        <Button
          onClick={() =>
            navigate(
              "/seller/products/add"
            )
          }
        >

          Add Product

        </Button>

      </div>

      {/* Search */}
      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-3 top-3 text-zinc-500"
        />

        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="pl-10"
        />

      </div>

      {/* Table */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-0 overflow-auto">

          <table className="w-full">

            <thead className="bg-zinc-800">

              <tr className="text-left">

                <th className="p-4">
                  Product
                </th>

                <th className="p-4">
                  Parent SKU
                </th>

                <th className="p-4">
                  Variants
                </th>

                <th className="p-4">
                  Total Qty
                </th>

                <th className="p-4">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredProducts.map(
                (product) => {

                  const variants =
                    Object.values(
                      product.variants ||
                      {}
                    );

                  const totalQty =
                    variants.reduce(
                      (
                        total,
                        variant
                      ) =>
                        total +
                        Number(
                          variant.qty ||
                          0
                        ),
                      0
                    );

                  return (
                    <tr
                      key={product.id}
                      className="border-t border-zinc-800 hover:bg-zinc-800/40"
                    >

                      {/* Product */}
                      <td className="p-4">

                        <div className="flex items-center gap-3">

                          <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">

                            <Package
                              size={18}
                            />

                          </div>

                          <div>

                            <p className="font-medium text-white">

                              {
                                product.productName
                              }

                            </p>

                            <p className="text-zinc-400 text-sm">

                              {
                                product.brand
                              }-{
                                product.subCategory
                              }

                            </p>

                          </div>

                        </div>

                      </td>

                      {/* Parent SKU */}
                      <td className="p-4 text-white">

                        {
                          product.parentSKU
                        }

                      </td>

                      {/* Variants */}
                      <td className="p-4">

                        <div className="flex flex-wrap gap-2">

                          {Object.entries(
                            product.variants ||
                            {}
                          ).map(
                            (
                              [
                                size,
                                variant,
                              ]
                            ) => (

                              <span
                                key={
                                  size
                                }
                                className="px-2 py-1 rounded-md bg-zinc-800 text-xs text-zinc-300"
                              >

                                {size}
                                {" • "}
                                {
                                  variant.qty
                                }

                              </span>

                            )
                          )}

                        </div>

                      </td>

                      {/* Total Qty */}
                      <td className="p-4">

                        <span
                          className={`font-semibold ${totalQty <=
                              5
                              ? "text-red-400"
                              : totalQty <=
                                15
                                ? "text-yellow-400"
                                : "text-green-400"
                            }`}
                        >

                          {totalQty}

                        </span>

                      </td>

                      {/* Actions */}
                      <td className="p-4">

                        <div className="flex gap-2">

                          <Button
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/seller/products/edit/${product.id}`
                              )
                            }
                          >

                            <Pencil
                              size={16}
                            />

                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              handleDelete(
                                product.id
                              )
                            }
                          >

                            <Trash2
                              size={16}
                            />

                          </Button>

                        </div>

                      </td>

                    </tr>
                  );
                }
              )}

            </tbody>

          </table>

          {!loading &&
            filteredProducts.length ===
            0 && (

              <div className="p-12 text-center">

                <Package
                  size={48}
                  className="mx-auto text-zinc-600"
                />

                <h3 className="text-xl font-semibold mt-4 text-white">

                  No products found

                </h3>

                <p className="text-zinc-400 mt-2">

                  Create your first catalog

                </p>

              </div>

            )}

        </CardContent>

      </Card>

    </div>
  );
}