import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
  useEffect,
  useState,
} from "react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  Package,
  Plus,
  Search,
} from "lucide-react";

import {
  Input,
} from "@/components/ui/input";

import {
  useNavigate,
} from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function ProductList() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [products, setProducts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const fetchProducts =
    async () => {

      try {

        const q = query(
          collection(db, "products"),
          where(
            "sellerId",
            "==",
            user.uid
          )
        );

        const snapshot =
          await getDocs(q);

        const productList =
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

        setProducts(productList);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

  useEffect(() => {

    if (user?.uid) {
      fetchProducts();
    }

  }, [user]);

  const filteredProducts =
    products.filter((product) =>
      product.name
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

          <h1 className="text-3xl font-bold">
            Products
          </h1>

          <p className="text-zinc-400 mt-2">
            Manage your catalog
          </p>

        </div>

        <Button
          onClick={() =>
            navigate(
              "/seller/products/add"
            )
          }
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </Button>

      </div>

      {/* Search */}
      <div className="mb-6 relative">

        <Search
          className="absolute left-3 top-3 text-zinc-500"
          size={18}
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

      {/* Product Table */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-0 overflow-auto">

          <table className="w-full">

            <thead className="bg-zinc-800">

              <tr className="text-left">

                <th className="p-4">
                  Product
                </th>

                <th className="p-4">
                  SKU
                </th>

                <th className="p-4">
                  Category
                </th>

                <th className="p-4">
                  Price
                </th>

                <th className="p-4">
                  Stock
                </th>

                <th className="p-4">
                  Status
                </th>

                <th className="p-4">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredProducts.map(
                (product) => (

                  <tr
                    key={product.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40"
                  >

                    <td className="p-4">

                      <div className="flex items-center gap-3">

                        <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center">

                          <Package size={18} />

                        </div>

                        <div>

                          <p className="font-medium">
                            {
                              product.name
                            }
                          </p>

                          <p className="text-zinc-400 text-sm">
                            {
                              product.brand
                            }
                          </p>

                        </div>

                      </div>

                    </td>

                    <td className="p-4">
                      {product.sku}
                    </td>

                    <td className="p-4">
                      {
                        product.category
                      }
                    </td>

                    <td className="p-4">
                      ₹
                      {product.price}
                    </td>

                    <td className="p-4">
                      {
                        product.stock
                      }
                    </td>

                    <td className="p-4">

                      <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">

                        Active

                      </span>

                    </td>

                    <td className="p-4">
                      <Button
                        size="sm"
                        onClick={() =>
                          navigate(
                            `/seller/products/edit/${product.id}`
                          )
                        }
                      >
                        Edit
                      </Button>
                    </td>

                  </tr>
                )
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

                <h3 className="text-xl font-semibold mt-4">

                  No products found

                </h3>

                <p className="text-zinc-400 mt-2">

                  Start building your catalog

                </p>

              </div>

            )}

        </CardContent>

      </Card>

    </div>
  );
}