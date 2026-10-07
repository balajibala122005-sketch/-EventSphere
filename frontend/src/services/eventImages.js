// Curated, high-quality event photography matched to event categories
export const categoryImages = {
  Technology:
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
  Music:
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80",
  Education:
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
  Workshop:
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80",
  Business:
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
  Default:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
};

/**
 * Returns a valid image URL for an event, prioritizing the event's custom imageUrl
 * and falling back to a category-matched professional image.
 */
export function getEventImage(event) {
  if (event?.imageUrl && typeof event.imageUrl === "string" && event.imageUrl.trim() !== "") {
    return event.imageUrl;
  }

  const category = (event?.category || "").trim().toLowerCase();

  if (category.includes("tech")) return categoryImages.Technology;
  if (category.includes("music")) return categoryImages.Music;
  if (category.includes("edu") || category.includes("work")) return categoryImages.Education;
  if (category.includes("bus")) return categoryImages.Business;
  if (category.includes("sport")) return categoryImages.Sports;

  return categoryImages.Default;
}
