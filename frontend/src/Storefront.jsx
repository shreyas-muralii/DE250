import { useMemo, useState } from "react";
import "./Storefront.css";
import "./StoreMapDetails.css";
import "./StorefrontInteractions.css";
import "./SearchStatus.css";

function LeafMark() {
  return <span className="leaf-mark" aria-hidden="true"><span /></span>;
}

function materialLabel(materials = []) {
  return Array.isArray(materials) ? materials.join(" · ") : String(materials || "Material details pending");
}

function StoreMap({ products, selectedId, onSelect }) {
  const selectedProduct = products.find((item) => item.id === selectedId);
  const selectedLocation = selectedProduct?.store_location || {};
  return (
    <section className="map-panel" aria-label="Store floor plan">
      <div className="map-panel-heading"><div><p className="eyebrow">FIND IT IN STORE</p><h2>A simple way <em>there.</em></h2></div><span className="map-north">N ↑</span></div>
      <div className="floor-plan">
        <span className="map-entry-label">BACK OF STORE</span>
        <div className="floor-zone zone-layers"><span className="zone-title">SHIRTS &amp; LAYERS</span><span className="zone-mark">A</span></div>
        <div className="floor-zone zone-trousers"><span className="zone-title">TROUSERS</span><span className="zone-mark">B</span></div>
        <div className="floor-zone zone-table"><span className="zone-title">CARE &amp; REPAIR</span><span className="table-mark">○</span></div>
        <div className="floor-zone zone-fitting"><span className="zone-title">FITTING</span><span>□</span></div>
        <div className="floor-zone zone-checkout"><span className="zone-title">CHECKOUT</span><span>↗</span></div>
        <div className="map-walkway"><span>OPEN WALKWAY</span></div>
        {products.map((item, index) => {
          const location = item.store_location || {};
          return <button key={item.id} className={`map-marker ${selectedId === item.id ? "is-selected" : ""}`} style={{ left: `${location.x ?? 50}%`, top: `${location.y ?? 50}%` }} onClick={() => onSelect(item.id)} aria-label={`Locate ${item.name} at ${location.rack || location.zone || "store location pending"}`} title={`${item.name} · ${location.rack || location.zone}`}><span><i>{String(index + 1).padStart(2, "0")}</i></span><b>{location.rack || "?"}</b></button>;
        })}
        <span className="map-entry">ENTRANCE</span>
      </div>
      <div className="map-legend"><span><i className="legend-dot" />Selected garment</span><span><i className="legend-line" />Walkway</span><span className="map-scale">ILLUSTRATIVE STORE PLAN</span></div>
      {selectedProduct && <div className="map-selection"><span className="map-selected-label">SELECTED PIECE</span><strong>{selectedProduct.name}</strong><span>{selectedLocation.zone || "Store location pending"}{selectedLocation.rack ? ` · Rack ${selectedLocation.rack}` : ""}</span>{selectedLocation.directions && <p>{selectedLocation.directions}</p>}</div>}
    </section>
  );
}

function ProductResult({ item, selected, index, onLocate, onOpen }) {
  const location = item.store_location || {};
  return (
    <article className={`result-card ${selected ? "is-selected" : ""}`}>
      <button className="card-open-surface" onClick={() => onOpen(item.id)} aria-label={`Open the garment passport for ${item.name}`} />
      <div className={`result-swatch result-swatch-${index % 3}`} aria-hidden="true"><span /></div>
      <div className="result-content">
        <div className="result-kicker"><span>{item.category}</span><span>№ {String(item.id).slice(0, 5).toUpperCase()}</span></div>
        <h3>{item.name}</h3>
        <p className="result-brand">{item.brand}</p>
        <p className="result-materials">{materialLabel(item.materials)}</p>
        <div className="feature-list">{(item.features || []).slice(0, 2).map((feature) => <span key={feature}>{feature}</span>)}</div>
        <div className="result-location"><span className="pin-icon">⌖</span><span><strong>{location.zone || "Location pending"}</strong>{location.rack ? ` · Rack ${location.rack}` : ""}</span><button onClick={() => onLocate(item.id)}>{selected ? "On map" : "Locate"} ↗</button></div>
        <button className="result-story" onClick={() => onOpen(item.id)}>Explore its garment story <span>↗</span></button>
      </div>
    </article>
  );
}

export default function Storefront({ products, loading, error, onOpen }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All pieces");
  const [material, setMaterial] = useState("All materials");
  const [selectedId, setSelectedId] = useState("");

  const categories = useMemo(() => ["All pieces", ...new Set(products.map((item) => item.category).filter(Boolean))], [products]);
  const materials = useMemo(() => ["All materials", ...new Set(products.flatMap((item) => Array.isArray(item.materials) ? item.materials : [item.materials]).filter(Boolean))], [products]);
  const filteredProducts = useMemo(() => products.filter((item) => {
    const query = search.trim().toLowerCase();
    const itemMaterials = Array.isArray(item.materials) ? item.materials : [item.materials].filter(Boolean);
    const itemFeatures = Array.isArray(item.features) ? item.features : [];
    const searchable = [item.name, item.brand, item.category, item.description, ...itemMaterials, ...itemFeatures].join(" ").toLowerCase();
    return (!query || searchable.includes(query)) && (category === "All pieces" || item.category === category) && (material === "All materials" || itemMaterials.includes(material));
  }), [products, search, category, material]);
  const activeId = filteredProducts.some((item) => item.id === selectedId) ? selectedId : (filteredProducts[0]?.id || "");

  function clearFilters() {
    setSearch("");
    setCategory("All pieces");
    setMaterial("All materials");
    setSelectedId("");
  }

  function submitSearch(event) {
    event.preventDefault();
    setSearch(String(new FormData(event.currentTarget).get("catalog-search") || "").trim());
    setSelectedId("");
    requestAnimationFrame(() => document.getElementById("store-results")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <main className="storefront-page">
      <header className="storefront-topbar"><a className="wordmark" href="/" aria-label="Common Thread home"><LeafMark /><span>common<span className="wordmark-light">thread</span></span></a><span className="topbar-note">A little more known, before you choose.</span><span className="store-display-label"><span className="display-live-dot" />IN-STORE GUIDE</span></header>
      <section className="storefront-hero"><div className="hero-overline"><span className="eyebrow"><span className="eyebrow-line" />THE MOMENT BEFORE YOU BUY</span><span className="display-index">01 — EXPLORE</span></div><div className="storefront-title-row"><h1>Find a piece.<br /><em>Know its path.</em></h1><p>Choose what you’re looking for, see where it lives in the store, and learn what we know about how it was made.</p></div><div className="consideration-note"><span>✳</span><p>A considered choice starts with clarity.<br /><strong>Explore at your own pace.</strong></p><span className="note-rule" /></div></section>
      <section className="browse-section" aria-label="Browse garments">
        <div className="browse-toolbar"><form className="search-box" role="search" onSubmit={submitSearch}><span aria-hidden="true">⌕</span><input name="catalog-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by garment or material" aria-label="Search garments" /><button className="search-submit" type="submit">SEARCH <span>↗</span></button></form><label className="filter-control"><span>STYLE</span><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by garment type">{categories.map((option) => <option key={option}>{option}</option>)}</select></label><label className="filter-control"><span>MATERIAL</span><select value={material} onChange={(event) => setMaterial(event.target.value)} aria-label="Filter by material">{materials.map((option) => <option key={option}>{option}</option>)}</select></label><button className="clear-filters" onClick={clearFilters} disabled={!search && category === "All pieces" && material === "All materials"}>Reset</button></div>
        <div className="results-summary" id="store-results"><span><strong>{String(filteredProducts.length).padStart(2, "0")}</strong> {filteredProducts.length === 1 ? "PIECE" : "PIECES"} TO EXPLORE{search && <span className="query-label"> · MATCHING “{search}”</span>}</span><span>FILTER BY WHAT MATTERS TO YOU</span></div>
        {error && <p className="store-error" role="alert">{error}</p>}
        {loading && <p className="store-empty">Gathering the garment stories…</p>}
        {!loading && filteredProducts.length > 0 && <div className="browse-layout"><StoreMap products={filteredProducts} selectedId={activeId} onSelect={setSelectedId} /><section className="results-panel"><div className="results-heading"><div><p className="eyebrow">THE COLLECTION</p><h2>Pieces with <em>stories.</em></h2></div><span>{filteredProducts.length} {filteredProducts.length === 1 ? "MATCH" : "MATCHES"}</span></div><div className="result-list">{filteredProducts.map((item, index) => <ProductResult key={item.id} item={item} index={index} selected={activeId === item.id} onLocate={setSelectedId} onOpen={onOpen} />)}</div>{!filteredProducts.length && <p className="store-empty">No pieces match those filters. Try a different material or style.</p>}</section></div>}
        {!loading && filteredProducts.length === 0 && <div className="no-results"><LeafMark /><p>No pieces match those filters.</p><button onClick={clearFilters}>Clear filters</button></div>}
      </section>
      <section className="trust-note"><span className="trust-number">02</span><p><strong>Transparency, without the gloss.</strong> These course examples show the kind of information a garment passport can hold. Their sourcing and store locations are illustrative, and no unverified footprint score is shown.</p><a href="#collection-note">WHY THIS MATTERS <span>↗</span></a></section>
      <footer className="storefront-footer" id="collection-note"><a className="wordmark" href="/"><LeafMark /><span>common<span className="wordmark-light">thread</span></span></a><span>KNOW MORE. CHOOSE WITH CARE.</span><span>IN-STORE GARMENT GUIDE</span></footer>
    </main>
  );
}
