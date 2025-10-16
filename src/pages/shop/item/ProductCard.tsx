import { IoMdStar } from "react-icons/io";
import { IoCartOutline } from "react-icons/io5";
import { DetailItem } from "../data";

interface ProductCardProps {
    item: DetailItem;
    onAddToCart: (item: DetailItem) => void;
}
const StarRating: React.FC = () => (
    <div className="flex gap-1 w-full py-2">
        {Array.from({ length: 5 }, (_, index) => (
            <IoMdStar  className="text-yellow-400" />
        ))}
    </div>
);
export const ProductCard: React.FC<ProductCardProps> = ({ item, onAddToCart }) => (
    <div className="rounded-lg shadow flex flex-col m-4 p-4">
        <div
            className="w-full h-64 bg-center bg-cover"
            style={{ backgroundImage: `url(${item.img})` }}
            aria-label={item.name}
        />
        <div className="flex justify-between items-center">
            <StarRating />
            <span className="text-gray-800 font-medium">{`(${item.nums})`}</span>
        </div>
        <h2 className="text-gray-800 font-medium text-xs">{item.name}</h2>
        <p className="text-blue-500 text-xl font-medium">${item.priceSell.toFixed(2)}</p>
        <button
            onClick={() => onAddToCart(item)}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-all active:scale-95"
            aria-label={`Add ${item.name} to cart`}
        >
            <IoCartOutline />
            Add To Cart
        </button>
    </div>
);