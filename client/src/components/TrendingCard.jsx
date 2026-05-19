import { Link } from "react-router-dom";
import { contentImage } from "../utils/content";

const TrendingCard = ({ item, rank }) => (
  <Link to={`/details/${item._id}`} className="relative flex min-w-[210px] items-end pl-10">
    <span className="rank-text absolute bottom-2 left-0 z-10 text-8xl font-black leading-none">{rank}</span>
    <img src={contentImage(item)} alt={item.title} className="aspect-[2/3] w-40 rounded-lg object-cover shadow-2xl transition hover:scale-105" />
  </Link>
);

export default TrendingCard;
