export const contentImage = (item, kind = "poster") => {
  const source = kind === "banner" ? item?.banner || item?.bannerUrl : item?.poster || item?.posterUrl || item?.thumbnail || item?.thumbnailUrl;
  return source || `https://placehold.co/${kind === "banner" ? "1400x700" : "600x900"}/141414/ffffff?text=${encodeURIComponent(item?.title || "StreamWave")}`;
};

export const genreNames = (item) => item?.genre || (item?.genres || []).map((genre) => genre.name || genre).join(" • ");

export const minutes = (value) => (value ? `${value} min` : "Series");
