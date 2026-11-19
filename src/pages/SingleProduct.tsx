import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { addToCart, setCartState } from "../redux/features/cartSlice";
import { Product } from "../models/Product";
import RatingStar from "../components/RatingStar";
import PriceSection from "../components/PriceSection";
import toast from "react-hot-toast";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { FaHandHoldingDollar } from "react-icons/fa6";
import ProductList from "../components/ProductList";
import Reviews from "../components/Reviews";
import useAuth from "../hooks/useAuth";
import { MdFavoriteBorder } from "react-icons/md";
import { addToWishlist } from "../redux/features/productSlice";
import { updateLoading } from "../redux/features/homeSlice";
import { API_ENDPOINTS } from "../api";
import AIProductOverview from "../components/AIProductOverview";

const SingleProduct: FC = () => {
  const dispatch = useAppDispatch();
  const { productID } = useParams();
  const [product, setProduct] = useState<Product>();
  const [imgs, setImgs] = useState<string[]>();
  const [selectedImg, setSelectedImg] = useState<string>();
  const [sCategory, setScategory] = useState<string>();
  const [similar, setSimilar] = useState<Product[]>([]);
  const { requireAuth } = useAuth();
  const isLoading = useAppSelector((state) => state.homeReducer.isLoading);
  const navigate = useNavigate()

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProductDetails = () => {
      dispatch(updateLoading(true));
      fetch(`${API_ENDPOINTS.PRODUCTS_ID.replace(":id", productID || "")}`)
        .then((res) => res.json())
        .then((data) => {
          const { thumbnail, images, category } = data;
          setProduct(data);
          setImgs(images);
          setScategory(category);
          setSelectedImg(thumbnail);
          dispatch(updateLoading(false));
        });
    };
    fetchProductDetails();
  }, [productID, dispatch]);

  useEffect(() => {
    const fetchPreferences = (cat: string) => {
      fetch(`${API_ENDPOINTS.PRODUCTS_CATEGORY_ID.replace(":id", cat)}`)
        .then((res) => res.json())
        .then((data) => {
          const _products: Product[] = data.products;
          const filtered = _products.filter((product) => {
            if (productID && product.id !== parseInt(productID)) return product;
          });
          setSimilar(filtered);
        });
    };
    if (sCategory && sCategory !== "") fetchPreferences(sCategory);
  }, [productID, sCategory]);

  const addCart = () => {
    requireAuth(() => {
      if (product)
        dispatch(
          addToCart({
            id: product.id,
            price: product.price,
            title: product.title,
            category: product.category,
            rating: product.rating,
            thumbnail: product.thumbnail,
            discountPercentage: product.discountPercentage,
          })
        );
      toast.success("item added to cart successfully", {
        duration: 3000,
      });
    });
  };

  const buyNow = () => {
    requireAuth(() => {
      if (product)
        dispatch(
          addToCart({
            id: product.id,
            price: product.price,
            title: product.title,
            category: product.category,
            rating: product.rating,
            thumbnail: product.thumbnail,
            discountPercentage: product.discountPercentage,
          })
        );
      dispatch(setCartState(true));
    });
  };

  const addWishlist = () => {
    requireAuth(() => {
      if (product) {
        dispatch(addToWishlist(product));
        toast.success("item added to your wishlist", {
          duration: 3000,
        });
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[83vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto pt-8 dark:text-white">
      <button onClick={() => {navigate(-1)}} className="hover:text-gray-600 mb-4 inline-flex items-center text-sm font-semibold"> ← Back </button>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 font-karla">
        {/* Left Column: Product Images */}
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 flex items-center justify-center border border-slate-200/80 dark:border-slate-700/80 min-h-[340px]">
            <img src={selectedImg} alt={product?.title || "selected"} className="max-h-96 max-w-full object-contain" />
          </div>
          <div className="flex space-x-2 items-center overflow-x-auto pb-1">
            {imgs &&
              imgs.map((_img) => (
                <img
                  src={_img}
                  key={_img}
                  alt="thumb"
                  className={`w-16 h-16 object-contain rounded-lg p-1 bg-slate-50 dark:bg-slate-800 cursor-pointer border-2 transition-all ${
                    _img === selectedImg
                      ? "border-blue-600 shadow-sm"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                  onClick={() => setSelectedImg(_img)}
                />
              ))}
          </div>
        </div>

        {/* Right Column: Details, Description, AI Overview (ONCE), Purchase Actions */}
        <div className="space-y-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md">
              {product?.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-2 text-slate-900 dark:text-white">
              {product?.title}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              {product?.rating && <RatingStar rating={product?.rating} />}
            </div>
          </div>

          <div>
            {product?.discountPercentage && (
              <PriceSection
                discountPercentage={product?.discountPercentage}
                price={product?.price}
              />
            )}
          </div>

          <table className="text-sm">
            <tbody>
              <tr>
                <td className="pr-4 py-0.5 font-bold text-slate-500 dark:text-slate-400">Brand</td>
                <td className="font-semibold text-slate-800 dark:text-slate-200">{product?.brand}</td>
              </tr>
              <tr>
                <td className="pr-4 py-0.5 font-bold text-slate-500 dark:text-slate-400">Stock</td>
                <td className="font-semibold text-slate-800 dark:text-slate-200">{product?.stock} units</td>
              </tr>
            </tbody>
          </table>

          {/* About the product - clean description without lorem */}
          <div className="pt-1">
            <h2 className="font-bold text-base text-slate-900 dark:text-white">About the product</h2>
            <p className="leading-6 text-sm text-slate-600 dark:text-slate-300 mt-1">
              {product?.description}
            </p>
          </div>

          {/* Single AI Overview Card: Appears only ONCE */}
          {product && <AIProductOverview product={product} className="mt-2" />}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              className="flex space-x-2 items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              onClick={addCart}
              title="ADD TO CART"
            >
              <AiOutlineShoppingCart className="text-lg" />
              <span>ADD TO CART</span>
            </button>
            <button
              type="button"
              className="flex space-x-2 items-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              onClick={buyNow}
              title="BUY NOW"
            >
              <FaHandHoldingDollar className="text-lg" />
              <span>BUY NOW</span>
            </button>
            <button
              type="button"
              className="flex space-x-2 items-center border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white hover:text-rose-500 font-semibold py-2.5 px-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              onClick={addWishlist}
              title="ADD TO WISHLIST"
            >
              <MdFavoriteBorder className="text-lg" />
              <span>ADD TO WISHLIST</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="px-4 mt-12 max-w-4xl">
        {product && <Reviews id={product?.id} />}
      </div>

      <hr className="mt-8 border-slate-200 dark:border-slate-700" />
      <ProductList title="Similar Products" products={similar} />
      <br />
    </div>
  );
};

export default SingleProduct;
