import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Search,
  Ticket,
  RefreshCw,
  X,
  ArrowRight,
  LayoutGrid,
  List,
  Heart,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

import { getEvents } from "../services/eventService";
import { getEventImage } from "../services/eventImages";
import { useToast } from "../context/ToastContext";

const CATEGORIES = [
  "All",
  "Technology",
  "Music",
  "Education",
  "Business",
  "Sports",
];

const PRICE_FILTERS = [
  { id: "all", label: "All Prices" },
  { id: "under500", label: "Under ₹500" },
  { id: "above500", label: "₹500 & Above" },
];

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-asc");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("eventsphere_favs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync favorites to localStorage
  function toggleFavorite(eventId, eventTitle) {
    let next;
    if (favorites.includes(eventId)) {
      next = favorites.filter((id) => id !== eventId);
      showToast(`Removed "${eventTitle}" from favorites`, "info");
    } else {
      next = [...favorites, eventId];
      showToast(`Saved "${eventTitle}" to your favorites!`, "success");
    }
    setFavorites(next);
    localStorage.setItem("eventsphere_favs", JSON.stringify(next));
  }

  // Copy share link
  function handleShare(event, e) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/events/${event.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast(`Link for "${event.title}" copied to clipboard!`, "success");
    } else {
      showToast(url, "info");
    }
  }

  // Sync params if they change in URL
  useEffect(() => {
    const qParam = searchParams.get("q");
    const catParam = searchParams.get("category");
    if (qParam !== null) setSearch(qParam);
    if (catParam !== null && CATEGORIES.includes(catParam)) setCategory(catParam);
  }, [searchParams]);

  // Fetch events from Spring Boot backend
  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const data = await getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading events:", err);
      setError(
        "Unable to load events from the backend server. Please verify that your Spring Boot backend is active on port 8080."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  // Format event date
  function formatDate(dateValue) {
    if (!dateValue) return { full: "Date not specified", month: "TBD", day: "--", time: "" };

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
      return { full: "Date not specified", month: "TBD", day: "--", time: "" };
    }

    const month = date.toLocaleString("en-IN", { month: "short" }).toUpperCase();
    const day = date.getDate();
    const time = date.toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" });
    const full = date.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return { full, month, day, time };
  }

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = events.filter((event) => {
      const title = (event.title || "").toLowerCase();
      const location = (event.location || "").toLowerCase();
      const eventCategory = (event.category || "").toLowerCase();
      const description = (event.description || "").toLowerCase();
      const price = Number(event.ticketPrice) || 0;

      const matchesSearch =
        searchText === "" ||
        title.includes(searchText) ||
        location.includes(searchText) ||
        description.includes(searchText);

      const matchesCategory =
        category === "All" ||
        eventCategory === category.toLowerCase();

      let matchesPrice = true;
      if (priceFilter === "under500") {
        matchesPrice = price < 500;
      } else if (priceFilter === "above500") {
        matchesPrice = price >= 500;
      }

      let matchesFav = true;
      if (showSavedOnly) {
        matchesFav = favorites.includes(event.id);
      }

      return matchesSearch && matchesCategory && matchesPrice && matchesFav;
    });

    // Sorting
    return filtered.sort((a, b) => {
      if (sortBy === "price-asc") {
        return (Number(a.ticketPrice) || 0) - (Number(b.ticketPrice) || 0);
      }
      if (sortBy === "price-desc") {
        return (Number(b.ticketPrice) || 0) - (Number(a.ticketPrice) || 0);
      }
      if (sortBy === "date-desc") {
        return new Date(b.eventDate || 0) - new Date(a.eventDate || 0);
      }
      // default: date-asc
      return new Date(a.eventDate || 0) - new Date(b.eventDate || 0);
    });
  }, [events, search, category, priceFilter, showSavedOnly, favorites, sortBy]);

  function resetFilters() {
    setSearch("");
    setCategory("All");
    setPriceFilter("all");
    setShowSavedOnly(false);
    setSortBy("date-asc");
    setSearchParams({});
  }

  return (
    <main className="events-page-wrapper">
      {/* Page Heading Banner */}
      <section className="events-hero-bar">
        <div className="events-hero-content">
          <span className="section-label">
            <Sparkles size={14} /> CURATED EXPERIENCES
          </span>
          <h1>Explore Live Events</h1>
          <p>
            Find world-class tech summits, musical gatherings, hands-on masterclasses, and business conferences. Book with verified digital passes.
          </p>
        </div>

        {/* View Mode & Quick Bookmark Toggles */}
        <div className="catalog-toolbar">
          <button
            type="button"
            className={`catalog-tool-btn ${showSavedOnly ? "active" : ""}`}
            onClick={() => setShowSavedOnly(!showSavedOnly)}
            title="Show only bookmarked events"
          >
            <Heart size={16} fill={showSavedOnly ? "currentColor" : "none"} />
            <span>Saved ({favorites.length})</span>
          </button>

          <div className="view-mode-toggle" role="group" aria-label="View Mode">
            <button
              type="button"
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              aria-label="Grid View"
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              aria-label="List View"
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Primary Filters Control Bar */}
      <section className="event-filters-card">
        <div className="filters-top-row">
          {/* Search Box */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by event title, location, or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) {
                  const p = new URLSearchParams(searchParams);
                  p.delete("q");
                  setSearchParams(p);
                }
              }}
              aria-label="Search events"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  const p = new URLSearchParams(searchParams);
                  p.delete("q");
                  setSearchParams(p);
                }}
                aria-label="Clear search"
                className="search-clear-btn"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="filters-right-controls">
            {/* Price Segment Selector */}
            <div className="price-filter-group">
              {PRICE_FILTERS.map((pf) => (
                <button
                  key={pf.id}
                  type="button"
                  className={`price-pill ${priceFilter === pf.id ? "active" : ""}`}
                  onClick={() => setPriceFilter(pf.id)}
                >
                  {pf.label}
                </button>
              ))}
            </div>

            {/* Sort Selector */}
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort events"
            >
              <option value="date-asc">Date: Upcoming First</option>
              <option value="date-desc">Date: Latest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="category-pills-row" role="tablist" aria-label="Category filters">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-pill ${isActive ? "active" : ""}`}
                onClick={() => {
                  setCategory(cat);
                  const p = new URLSearchParams(searchParams);
                  if (cat === "All") p.delete("category");
                  else p.set("category", cat);
                  setSearchParams(p);
                }}
                role="tab"
                aria-selected={isActive}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results Status Bar */}
      {!loading && !error && (
        <div className="filter-results-info">
          <span>
            Showing <strong>{filteredEvents.length}</strong> {filteredEvents.length === 1 ? "event" : "events"}
            {category !== "All" && ` in ${category}`}
            {priceFilter !== "all" && ` (${priceFilter === "under500" ? "< ₹500" : "≥ ₹500"})`}
            {showSavedOnly && ` (Saved Only)`}
            {search && ` matching "${search}"`}
          </span>

          {(search || category !== "All" || priceFilter !== "all" || showSavedOnly) && (
            <button
              type="button"
              onClick={resetFilters}
              className="reset-filters-btn"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="skeleton-cards-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div className="skeleton-card" key={n}>
              <div className="skeleton-box skeleton-art" />
              <div className="skeleton-content">
                <div className="skeleton-box skeleton-line" style={{ width: "70%" }} />
                <div className="skeleton-box skeleton-line" style={{ width: "95%" }} />
                <div className="skeleton-box skeleton-line" style={{ width: "50%" }} />
                <div className="skeleton-box skeleton-btn" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="empty-state error-state">
          <div className="empty-state-icon">
            <RefreshCw size={28} />
          </div>
          <h3>Unable to Load Events</h3>
          <p>{error}</p>
          <button
            type="button"
            className="primary-btn"
            onClick={loadEvents}
            style={{ marginTop: "16px" }}
          >
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Event Cards (Grid or List View) */}
      {!loading && !error && (
        <>
          <div className={`events-${viewMode}`}>
            {filteredEvents.map((event) => {
              const imageUrl = getEventImage(event);
              const isSoldOut = Number(event.availableTickets) <= 0;
              const isLowStock = !isSoldOut && Number(event.availableTickets) <= 15;
              const isFav = favorites.includes(event.id);
              const dateObj = formatDate(event.eventDate);

              return (
                <article
                  className={`event-card ${viewMode === "list" ? "event-card-list" : ""}`}
                  key={event.id}
                >
                  {/* Event Art Container */}
                  <div className="event-art">
                    <img
                      src={imageUrl}
                      alt={event.title}
                      className="event-image"
                      loading="lazy"
                    />
                    <span className="event-category-badge">
                      {event.category || "General"}
                    </span>

                    {/* Date Stamp Overlay */}
                    <div className="event-calendar-stamp">
                      <span className="stamp-month">{dateObj.month}</span>
                      <span className="stamp-day">{dateObj.day}</span>
                    </div>

                    {/* Action buttons over image */}
                    <div className="event-art-actions">
                      <button
                        type="button"
                        className={`art-action-btn ${isFav ? "favorited" : ""}`}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleFavorite(event.id, event.title);
                        }}
                        aria-label={isFav ? "Remove favorite" : "Save favorite"}
                        title={isFav ? "Saved" : "Save event"}
                      >
                        <Heart size={16} fill={isFav ? "#ef4444" : "none"} color={isFav ? "#ef4444" : "#ffffff"} />
                      </button>

                      <button
                        type="button"
                        className="art-action-btn"
                        onClick={(e) => handleShare(event, e)}
                        aria-label="Share event"
                        title="Copy share link"
                      >
                        <Share2 size={16} color="#ffffff" />
                      </button>
                    </div>

                    {isSoldOut && (
                      <div className="sold-out-overlay">
                        <span>Sold Out</span>
                      </div>
                    )}
                  </div>

                  {/* Event Information */}
                  <div className="event-info">
                    <div className="event-card-title-row">
                      <h3>{event.title}</h3>
                    </div>

                    {event.description && (
                      <p className="event-desc-snippet">{event.description}</p>
                    )}

                    <div className="event-meta-list">
                      <div className="event-detail">
                        <CalendarDays size={15} />
                        <span>{dateObj.full}</span>
                      </div>

                      <div className="event-detail">
                        <MapPin size={15} />
                        <span>{event.location}</span>
                      </div>

                      <div className="event-detail">
                        <Ticket size={15} />
                        <span>
                          {isSoldOut ? (
                            <strong className="text-danger">Sold Out</strong>
                          ) : (
                            `${event.availableTickets} tickets left`
                          )}
                          {isLowStock && (
                            <span className="text-warning-pill">
                              <Zap size={10} /> Filling Fast
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Pricing & CTA */}
                    <div className="event-bottom">
                      <div className="event-price-wrapper">
                        <span className="price-label">Ticket Price</span>
                        <strong className="event-price-amount">
                          ₹{Number(event.ticketPrice || 0).toLocaleString("en-IN")}
                        </strong>
                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className={`book-btn ${isSoldOut ? "disabled-btn" : ""}`}
                        aria-label={`View details for ${event.title}`}
                      >
                        <span>{isSoldOut ? "View Event" : "Book Tickets"}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* No Matching Events Empty State */}
          {filteredEvents.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Search size={28} />
              </div>
              <h3>No Events Found</h3>
              <p>
                We couldn't find any events matching your current filters. Try resetting search or checking other categories.
              </p>
              <button
                type="button"
                className="secondary-btn"
                onClick={resetFilters}
                style={{ marginTop: "16px" }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}

export default Events;