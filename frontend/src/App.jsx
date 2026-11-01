import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import "./App.css";
import "./TagQr.css";
import "./JourneyPreview.css";
import "./Impact.css";
import Storefront from "./Storefront.jsx";
import "./Storefront.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

function getInitialId() {
  return new URLSearchParams(window.location.search).get("id") || "";
}

function getStages(process) {
  if (process?.stages && Array.isArray(process.stages)) return process.stages.map((stage) => ({
    ...stage,
    detail: stage.location ? `${stage.detail} Location: ${stage.location}.` : stage.detail,
  }));
  if (Array.isArray(process)) {
    return process.map((item, index) => typeof item === "object"
      ? { title: item.title || item.name || `Stage ${index + 1}`, detail: item.detail || item.description || item.location || "Details coming soon." }
      : { title: `Stage ${index + 1}`, detail: String(item) });
  }
  if (process && typeof process === "object") {
    return Object.entries(process).map(([key, value], index) => {
      if (value && typeof value === "object") {
        return { title: value.title || value.name || key.replace(/[_-]/g, " "), detail: value.detail || value.description || value.location || JSON.stringify(value) };
      }
      return { title: key.replace(/[_-]/g, " "), detail: String(value), index };
    });
  }
  if (typeof process === "string" && process.trim()) return [{ title: "Making notes", detail: process }];
  return [];
}

function LeafMark() {
  return <span className="leaf-mark" aria-hidden="true"><span /></span>;
}

function App() {
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const previewStepsRef = useRef(null);

  const stages = useMemo(() => getStages(product?.process), [product]);
  const impact = product?.impact || product?.process?.impact || product?.process?.environmental || {};
  const hasMetric = (...keys) => keys.some((key) => impact[key] !== undefined && impact[key] !== null && impact[key] !== "");
  const impactStats = [
    { label: "Carbon footprint", value: impact.carbon_emissions ?? impact.carbon_kg_co2e ?? impact.co2e ?? "Not measured", unit: hasMetric("carbon_emissions", "carbon_kg_co2e", "co2e") ? "kg CO₂e per garment" : "No verified figure provided" },
    { label: "Water use", value: impact.water_liters ?? impact.water_l ?? "Not measured", unit: hasMetric("water_liters", "water_l") ? "litres per garment" : "No verified figure provided" },
    { label: "Energy use", value: impact.energy_kwh ?? impact.energy ?? "Not measured", unit: hasMetric("energy_kwh", "energy") ? "kWh per garment" : "No verified figure provided" },
  ];
  const passportUrl = useMemo(() => {
    if (!product) return "";
    const base = import.meta.env.VITE_PUBLIC_BASE_URL || window.location.origin;
    const url = new URL("/", base);
    url.searchParams.set("id", product.id);
    return url.toString();
  }, [product]);

  useEffect(() => {
    if (!passportUrl) { setQrDataUrl(""); return; }
    QRCode.toDataURL(passportUrl, { width: 176, margin: 1, errorCorrectionLevel: "M", color: { dark: "#263023", light: "#f8f7f2" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [passportUrl]);

  useEffect(() => {
    const rail = previewStepsRef.current;
    const active = rail?.querySelector(".preview-step.is-active");
    if (rail && active) {
      const left = active.offsetLeft;
      const right = left + active.offsetWidth;
      if (left < rail.scrollLeft || right > rail.scrollLeft + rail.clientWidth) {
        rail.scrollTo({ left: left - (rail.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
      }
    }
  }, [activeStage, stages.length]);

  async function loadProduct(id, updateUrl = true) {
    if (!id.trim()) return;
    setLoading(true);
    setError("");
    setProduct(null);
    try {
      const response = await fetch(`${API_BASE_URL}/info/${encodeURIComponent(id.trim())}/`);
      if (!response.ok) throw new Error(response.status === 404 ? "We couldn't find this garment passport." : `Request failed (${response.status}).`);
      const data = await response.json();
      setProduct(data);
      setActiveStage(0);
      if (updateUrl) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", data.id);
        window.history.replaceState({}, "", url);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof TypeError ? "The garment record could not be reached. Check that the product service is running." : err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API_BASE_URL}/info/`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => {
        setProducts([]);
        setError("The store collection could not be reached. Check that the product service is running.");
      })
      .finally(() => setCatalogLoading(false));
    const initialId = getInitialId();
    if (initialId) loadProduct(initialId, false);
  }, []);

  async function sharePassport() {
    try {
      await navigator.clipboard.writeText(passportUrl || window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      {!product ? <Storefront products={products} loading={catalogLoading || loading} error={error} onOpen={loadProduct} /> : (
        <main className="page-shell">
          <article className="passport-view">
          <div className="passport-toolbar"><button className="back-button" onClick={() => { setProduct(null); setError(""); window.history.replaceState({}, "", window.location.pathname); }}><span aria-hidden="true">←</span> All garments</button><span className="passport-label"><LeafMark /> GARMENT PASSPORT</span><button className="share-button" onClick={sharePassport}>{copied ? "Link copied ✓" : "Share story ↗"}</button></div>
          <section className="product-hero">
            <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line" />A STORY IN EVERY STITCH</p><p className="hero-brand">{product.brand}</p><h1>{product.name}</h1><p className="hero-description">{product.description}</p><div className="hero-meta"><span><span className="meta-dot" />INDIVIDUAL PASSPORT</span><span>№ {String(product.id).slice(0, 8).toUpperCase()}</span></div></div>
            <div className="hero-object journey-preview" aria-label="Swipe through the garment making steps">
              <div className="preview-heading"><span>THE MAKING THREAD</span><span>SWIPE TO EXPLORE →</span></div>
              {stages.length > 0 ? <>
                <div className="preview-steps" ref={previewStepsRef} role="tablist" aria-label="Garment making steps">
                  {stages.map((stage, index) => <button key={`${stage.title}-preview`} className={`preview-step ${activeStage === index ? "is-active" : ""}`} role="tab" aria-selected={activeStage === index} onClick={() => setActiveStage(index)}><span className="preview-step-number">{String(index + 1).padStart(2, "0")}</span><span className="preview-step-title">{stage.title}</span></button>)}
                </div>
                <div className="preview-detail" key={activeStage}><span className="preview-now">STEP {String(activeStage + 1).padStart(2, "0")} · OF {String(stages.length).padStart(2, "0")}</span><strong>{stages[activeStage]?.title}</strong><p>{stages[activeStage]?.detail}</p></div>
              </> : <div className="preview-detail"><strong>The story is still being gathered.</strong><p>Making details will appear here as they are added.</p></div>}
              <span className="preview-thread" aria-hidden="true" />
            </div>
          </section>
          <section className="journey-section impact-section"><div className="journey-heading"><div><p className="eyebrow">A CLOSER LOOK</p><h2>Product <em>footprint.</em></h2></div><p className="journey-intro">The environmental details available for this piece, with gaps made clear.</p></div>
            <div className="impact-layout"><div className="impact-stats">{impactStats.map((stat) => <article className="impact-stat" key={stat.label}><span className="impact-stat-label">{stat.label}</span><strong>{stat.value}</strong><span className="impact-stat-unit">{stat.unit}</span></article>)}</div><div className="impact-panel"><div className="stage-panel-top"><span>THIS GARMENT</span><span className="panel-leaf"><LeafMark /></span></div><h3>Materials & care</h3><p><strong>Materials</strong><br />{Array.isArray(product.materials) && product.materials.length ? product.materials.join(" · ") : "Material details not provided."}</p><p><strong>Designed for</strong><br />{Array.isArray(product.features) && product.features.length ? product.features.join(" · ") : "Everyday wear"}</p><p><strong>Care note</strong><br />{product.process?.care || "Care guidance not provided."}</p></div></div>
            <p className="impact-disclosure">{product.process?.transparency || "Environmental figures and supplier details have not been independently verified."} Carbon, water and energy values are shown only when supplied for this product.</p>
          </section>
          <section className="pause-section"><div className="pause-symbol"><span>✳</span></div><div><p className="eyebrow">A MOMENT TO CONSIDER</p><h2>Will it become part<br />of <em>your story?</em></h2></div><div className="pause-copy"><p>Good choices begin with good questions. Think about how this piece fits your life, how often you’ll wear it, and how you might care for it over time.</p><a href="#care-note">A note on caring well <span>↘</span></a></div></section>
          <section className="care-note" id="care-note"><span className="care-icon">↻</span><div><p className="eyebrow">KEEP IT IN CIRCULATION</p><p>The most thoughtful garment is one that gets worn, cared for, repaired, and loved for a long time.</p></div><span className="care-tail">Made for the long run.</span></section>
          <section className="tag-qr-section"><div className="tag-story"><p className="eyebrow">THE TAG, THOUGHT THROUGH</p><h2>Plant a small<br /><em>possibility.</em></h2><p>{product.process?.tag?.material || "A seed-paper tag can give its material a second life."}</p><p className="planting-note">{product.process?.tag?.planting || "Check local planting guidance before planting seed paper."}</p><p className="tag-disclosure">{product.process?.tag?.note || "Seed paper is not a measured carbon offset."}</p></div><div className="qr-card"><div className="qr-frame">{qrDataUrl && <img src={qrDataUrl} alt={`QR code for ${product.name} garment passport`} />}</div><div><p className="eyebrow">THIS GARMENT’S PASSPORT</p><p className="qr-prompt">Scan to return to this story.</p><a className="qr-url" href={passportUrl}>{passportUrl}</a></div><button className="copy-link" onClick={sharePassport}>{copied ? "Link copied ✓" : "Copy passport link ↗"}</button></div></section>
          <p className="source-disclosure">{product.process?.transparency || "Product details are shared by the maker and may need independent verification."}</p>
          <footer className="passport-footer"><a className="wordmark" href="/"><LeafMark /><span>common<span className="wordmark-light">thread</span></span></a><span>KNOW MORE. CHOOSE WITH CARE.</span><span>№ {String(product.id).slice(0, 8).toUpperCase()}</span></footer>
          </article>
        </main>
      )}
    </>
  );
}

export default App;
